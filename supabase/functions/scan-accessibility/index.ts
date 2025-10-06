import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ScanRequest {
  scanType: 'url' | 'file';
  targetUrl?: string;
  htmlContent?: string;
  name: string;
  githubRepo?: string;
}

interface AccessibilityIssue {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  selector?: string;
  lineNumber?: number;
  recommendedFix: string;
  codeSnippet?: string;
  fixedCode?: string;
  wcagCriteria?: string;
}

function scanHTML(html: string): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const lines = html.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();

    // Check for images without alt text
    if (/<img(?![^>]*alt=)[^>]*>/i.test(trimmedLine)) {
      const match = trimmedLine.match(/<img[^>]*>/i);
      if (match) {
        issues.push({
          severity: 'critical',
          category: 'images',
          title: 'Image missing alt attribute',
          description: 'All images must have an alt attribute for screen readers. Decorative images should use alt="".',
          lineNumber: lineNum,
          recommendedFix: 'Add alt attribute with descriptive text or alt="" for decorative images',
          codeSnippet: match[0],
          fixedCode: match[0].replace('<img', '<img alt="Description of image"'),
          wcagCriteria: 'WCAG 2.1 Level A - 1.1.1 Non-text Content'
        });
      }
    }

    // Check for empty alt attributes on non-decorative images
    if (/<img[^>]*alt=""[^>]*src=[^>]*>/i.test(trimmedLine) || /<img[^>]*src=[^>]*alt=""[^>]*>/i.test(trimmedLine)) {
      const match = trimmedLine.match(/<img[^>]*>/i);
      if (match) {
        issues.push({
          severity: 'warning',
          category: 'images',
          title: 'Image has empty alt attribute',
          description: 'Empty alt attributes should only be used for decorative images. If this image conveys information, add descriptive alt text.',
          lineNumber: lineNum,
          recommendedFix: 'Replace empty alt with descriptive text if image is meaningful',
          codeSnippet: match[0],
          wcagCriteria: 'WCAG 2.1 Level A - 1.1.1 Non-text Content'
        });
      }
    }

    // Check for form inputs without labels
    if (/<input(?![^>]*id=)[^>]*type=["']?(text|email|password|tel|number|search)["']?/i.test(trimmedLine)) {
      const match = trimmedLine.match(/<input[^>]*>/i);
      if (match) {
        issues.push({
          severity: 'critical',
          category: 'forms',
          title: 'Input field without associated label',
          description: 'Form inputs must have an id attribute and an associated label element for accessibility.',
          lineNumber: lineNum,
          recommendedFix: 'Add an id attribute and wrap with a label or use aria-label',
          codeSnippet: match[0],
          fixedCode: '<label for="input-id">Field Label</label>\n' + match[0].replace('<input', '<input id="input-id"'),
          wcagCriteria: 'WCAG 2.1 Level A - 1.3.1 Info and Relationships, 3.3.2 Labels or Instructions'
        });
      }
    }

    // Check for buttons without accessible text
    if (/<button[^>]*>\s*<\/button>/i.test(trimmedLine)) {
      const match = trimmedLine.match(/<button[^>]*>\s*<\/button>/i);
      if (match) {
        issues.push({
          severity: 'critical',
          category: 'forms',
          title: 'Button without text content',
          description: 'Buttons must contain text or an aria-label for screen readers to announce.',
          lineNumber: lineNum,
          recommendedFix: 'Add descriptive text inside the button or use aria-label attribute',
          codeSnippet: match[0],
          fixedCode: '<button>Descriptive Action</button>',
          wcagCriteria: 'WCAG 2.1 Level A - 4.1.2 Name, Role, Value'
        });
      }
    }

    // Check for missing heading hierarchy
    const h1Match = /<h1[^>]*>/i.test(html);
    if (/<h3[^>]*>/i.test(trimmedLine) && !h1Match) {
      issues.push({
        severity: 'warning',
        category: 'structure',
        title: 'Heading hierarchy issue',
        description: 'Pages should have a proper heading hierarchy starting with h1. Avoid skipping heading levels.',
        lineNumber: lineNum,
        recommendedFix: 'Ensure page has an h1 and headings follow sequential order (h1, h2, h3...)',
        wcagCriteria: 'WCAG 2.1 Level A - 1.3.1 Info and Relationships'
      });
    }

    // Check for links without text
    if (/<a[^>]*>\s*<\/a>/i.test(trimmedLine)) {
      const match = trimmedLine.match(/<a[^>]*>\s*<\/a>/i);
      if (match) {
        issues.push({
          severity: 'critical',
          category: 'navigation',
          title: 'Link without text content',
          description: 'Links must contain text or an aria-label so users know where the link goes.',
          lineNumber: lineNum,
          recommendedFix: 'Add descriptive link text or use aria-label attribute',
          codeSnippet: match[0],
          fixedCode: '<a href="...">Descriptive Link Text</a>',
          wcagCriteria: 'WCAG 2.1 Level A - 2.4.4 Link Purpose (In Context)'
        });
      }
    }

    // Check for generic link text
    if (/<a[^>]*>\s*(click here|read more|here|more)\s*<\/a>/i.test(trimmedLine)) {
      const match = trimmedLine.match(/<a[^>]*>[^<]*<\/a>/i);
      if (match) {
        issues.push({
          severity: 'warning',
          category: 'navigation',
          title: 'Non-descriptive link text',
          description: 'Avoid generic link text like "click here" or "read more". Link text should describe the destination.',
          lineNumber: lineNum,
          recommendedFix: 'Use descriptive link text that makes sense out of context',
          codeSnippet: match[0],
          wcagCriteria: 'WCAG 2.1 Level A - 2.4.4 Link Purpose (In Context)'
        });
      }
    }

    // Check for missing lang attribute
    if (/<html[^>]*>/i.test(trimmedLine) && !/<html[^>]*lang=/i.test(trimmedLine)) {
      const match = trimmedLine.match(/<html[^>]*>/i);
      if (match) {
        issues.push({
          severity: 'critical',
          category: 'structure',
          title: 'Missing lang attribute on html element',
          description: 'The html element must have a lang attribute to help screen readers pronounce content correctly.',
          lineNumber: lineNum,
          recommendedFix: 'Add lang="en" or appropriate language code to html element',
          codeSnippet: match[0],
          fixedCode: '<html lang="en">',
          wcagCriteria: 'WCAG 2.1 Level A - 3.1.1 Language of Page'
        });
      }
    }

    // Check for tables without proper structure
    if (/<table[^>]*>/i.test(trimmedLine)) {
      const tableSection = html.substring(html.indexOf(trimmedLine));
      if (!/<th[^>]*>/i.test(tableSection)) {
        issues.push({
          severity: 'warning',
          category: 'structure',
          title: 'Table missing header cells',
          description: 'Data tables should use <th> elements for headers to establish relationships between data.',
          lineNumber: lineNum,
          recommendedFix: 'Use <th> elements for table headers with scope attribute',
          wcagCriteria: 'WCAG 2.1 Level A - 1.3.1 Info and Relationships'
        });
      }
    }

    // Check for iframes without title
    if (/<iframe(?![^>]*title=)[^>]*>/i.test(trimmedLine)) {
      const match = trimmedLine.match(/<iframe[^>]*>/i);
      if (match) {
        issues.push({
          severity: 'critical',
          category: 'structure',
          title: 'Iframe missing title attribute',
          description: 'Iframes must have a title attribute that describes their content for screen reader users.',
          lineNumber: lineNum,
          recommendedFix: 'Add title attribute with descriptive text',
          codeSnippet: match[0],
          fixedCode: match[0].replace('<iframe', '<iframe title="Description of iframe content"'),
          wcagCriteria: 'WCAG 2.1 Level A - 4.1.2 Name, Role, Value'
        });
      }
    }
  });

  return issues;
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

    const { scanType, targetUrl, htmlContent, name, githubRepo }: ScanRequest = await req.json();

    // Create scan record
    const { data: scan, error: scanError } = await supabaseClient
      .from('scans')
      .insert({
        user_id: user.id,
        name,
        scan_type: scanType,
        target_url: targetUrl,
        file_name: scanType === 'file' ? name : null,
        github_repo: githubRepo,
        status: 'processing'
      })
      .select()
      .single();

    if (scanError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create scan', details: scanError }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let html = htmlContent || '';

    // Fetch HTML from URL if needed
    if (scanType === 'url' && targetUrl) {
      try {
        const response = await fetch(targetUrl);
        html = await response.text();
      } catch (error) {
        await supabaseClient
          .from('scans')
          .update({ status: 'failed' })
          .eq('id', scan.id);

        return new Response(
          JSON.stringify({ error: 'Failed to fetch URL', details: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Scan HTML for accessibility issues
    const issues = scanHTML(html);

    // Insert issues into database
    if (issues.length > 0) {
      const issueRecords = issues.map(issue => ({
        scan_id: scan.id,
        severity: issue.severity,
        category: issue.category,
        title: issue.title,
        description: issue.description,
        selector: issue.selector,
        line_number: issue.lineNumber,
        recommended_fix: issue.recommendedFix,
        code_snippet: issue.codeSnippet,
        fixed_code: issue.fixedCode,
        wcag_criteria: issue.wcagCriteria
      }));

      const { error: issuesError } = await supabaseClient
        .from('issues')
        .insert(issueRecords);

      if (issuesError) {
        console.error('Error inserting issues:', issuesError);
      }
    }

    // Count issues by severity
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const infoCount = issues.filter(i => i.severity === 'info').length;

    // Update scan with results
    const { data: updatedScan, error: updateError } = await supabaseClient
      .from('scans')
      .update({
        status: 'completed',
        total_issues: issues.length,
        critical_count: criticalCount,
        warning_count: warningCount,
        info_count: infoCount,
        completed_at: new Date().toISOString()
      })
      .eq('id', scan.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating scan:', updateError);
    }

    return new Response(
      JSON.stringify({
        scan: updatedScan || scan,
        issues: issues
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