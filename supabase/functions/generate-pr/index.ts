import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PRRequest {
  scanId: string;
  githubToken: string;
  githubRepo: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { scanId, githubToken, githubRepo }: PRRequest = await req.json();

    // Get scan and issues
    const { data: scan, error: scanError } = await supabaseClient
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .eq('user_id', user.id)
      .single();

    if (scanError || !scan) {
      return new Response(
        JSON.stringify({ error: 'Scan not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: issues, error: issuesError } = await supabaseClient
      .from('issues')
      .select('*')
      .eq('scan_id', scanId)
      .order('severity', { ascending: false });

    if (issuesError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch issues' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate branch name
    const timestamp = Date.now();
    const branchName = `accessfix/accessibility-fixes-${timestamp}`;

    // Get default branch
    const repoResponse = await fetch(
      `https://api.github.com/repos/${githubRepo}`,
      {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!repoResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to access GitHub repository. Check repository name and token permissions.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const repoData = await repoResponse.json();
    const defaultBranch = repoData.default_branch;

    // Get SHA of default branch
    const refResponse = await fetch(
      `https://api.github.com/repos/${githubRepo}/git/ref/heads/${defaultBranch}`,
      {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    const refData = await refResponse.json();
    const baseSha = refData.object.sha;

    // Create new branch
    const createBranchResponse = await fetch(
      `https://api.github.com/repos/${githubRepo}/git/refs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: baseSha,
        }),
      }
    );

    if (!createBranchResponse.ok) {
      const error = await createBranchResponse.json();
      return new Response(
        JSON.stringify({ error: 'Failed to create branch', details: error }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate PR description
    const criticalIssues = issues?.filter(i => i.severity === 'critical') || [];
    const warningIssues = issues?.filter(i => i.severity === 'warning') || [];
    const infoIssues = issues?.filter(i => i.severity === 'info') || [];

    let description = `# Accessibility Fixes\n\n`;
    description += `This PR addresses ${issues?.length || 0} accessibility issues found by AccessFix.\n\n`;
    
    if (criticalIssues.length > 0) {
      description += `## Critical Issues (${criticalIssues.length})\n\n`;
      criticalIssues.forEach((issue, index) => {
        description += `### ${index + 1}. ${issue.title}\n`;
        description += `**Category:** ${issue.category}\n`;
        description += `**WCAG:** ${issue.wcag_criteria || 'N/A'}\n`;
        description += `**Description:** ${issue.description}\n`;
        description += `**Fix:** ${issue.recommended_fix}\n\n`;
        if (issue.code_snippet) {
          description += `**Before:**\n\`\`\`html\n${issue.code_snippet}\n\`\`\`\n\n`;
        }
        if (issue.fixed_code) {
          description += `**After:**\n\`\`\`html\n${issue.fixed_code}\n\`\`\`\n\n`;
        }
      });
    }

    if (warningIssues.length > 0) {
      description += `## Warnings (${warningIssues.length})\n\n`;
      warningIssues.forEach((issue, index) => {
        description += `### ${index + 1}. ${issue.title}\n`;
        description += `**Description:** ${issue.description}\n`;
        description += `**Fix:** ${issue.recommended_fix}\n\n`;
      });
    }

    if (infoIssues.length > 0) {
      description += `## Info (${infoIssues.length})\n\n`;
      infoIssues.forEach((issue, index) => {
        description += `- ${issue.title}\n`;
      });
    }

    description += `\n---\n*Generated by [AccessFix](https://accessfix.app) - Automated Accessibility Scanning*`;

    // Create pull request
    const prResponse = await fetch(
      `https://api.github.com/repos/${githubRepo}/pulls`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Fix ${issues?.length || 0} accessibility issues`,
          head: branchName,
          base: defaultBranch,
          body: description,
        }),
      }
    );

    if (!prResponse.ok) {
      const error = await prResponse.json();
      return new Response(
        JSON.stringify({ error: 'Failed to create pull request', details: error }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const prData = await prResponse.json();

    // Save PR record
    const { data: prRecord, error: prError } = await supabaseClient
      .from('pull_requests')
      .insert({
        scan_id: scanId,
        user_id: user.id,
        github_repo: githubRepo,
        pr_number: prData.number,
        pr_url: prData.html_url,
        branch_name: branchName,
        status: 'open',
      })
      .select()
      .single();

    if (prError) {
      console.error('Error saving PR record:', prError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        pr: prRecord,
        prUrl: prData.html_url,
        prNumber: prData.number,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});