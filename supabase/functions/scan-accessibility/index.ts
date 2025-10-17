import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Octokit } from "npm:octokit@3";

// --- CORS Configuration ---
const corsHeaders = {
  // Ensure protocol is included for localhost
  "Access-Control-Allow-Origin": "https://access-fix.vercel.app/", 
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Github-Token",
};

interface ScanRequest {
  scanType: 'url' | 'file' | 'github';
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
  filePath?: string;
}

// --- HTML Scanning Logic (No change needed) ---
function scanHTML(html: string): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const lines = html.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();

    // --- Accessibility Checks ---
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

    if (/<input(?![^>]*id=)[^>]*type=["\']?(text|email|password|tel|number|search)["\']?/i.test(trimmedLine)) {
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

// --- GitHub Repo Helper (No change needed) ---
async function fetchRepoHTMLFiles(repoFullName: string, githubToken: string): Promise<{ path: string; content: string }[]> {
  const [owner, repo] = repoFullName.split("/");
  const octokit = new Octokit({ auth: githubToken });
  const files: { path: string; content: string }[] = [];

  async function recurse(path = "") {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path });
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.type === "file" && item.name.endsWith(".html")) {
          const file = await octokit.rest.repos.getContent({ owner, repo, path: item.path });
          const content = atob((file.data as any).content);
          files.push({ path: item.path, content });
        } else if (item.type === "dir") {
          await recurse(item.path);
        }
      }
    }
  }

  await recurse("");
  return files;
}

// --- Main Function with Final Fixes ---
Deno.serve(async (req: Request) => {
  // 1. Handle OPTIONS preflight request immediately
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // 2. Wrap all subsequent execution in a single try/catch
  try {
    
    // --- Body Parsing with Strict Checks ---
    let requestData: ScanRequest;
    const contentType = req.headers.get("content-type") || "";

    // 3. CRITICAL FIX: Ensure method is POST and Content-Type is application/json 
    // before attempting to read the body as JSON.
    if (req.method !== "POST" || !contentType.includes("application/json")) {
        return new Response(
            JSON.stringify({ error: `Method ${req.method} not allowed or missing 'application/json' Content-Type.` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
    
    // Safely attempt to parse the JSON body to catch the SyntaxError
    try {
        requestData = await req.json() as ScanRequest;
    } catch (e) {
        console.error("Failed to parse request body (likely malformed JSON):", e);
        return new Response(
            JSON.stringify({ error: "Invalid or malformed JSON request body." }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
    
    // Deconstruct data from the safely parsed request body
    const { scanType, targetUrl, htmlContent, name, githubRepo } = requestData;
    const githubToken = req.headers.get("X-Github-Token") || "";

    // --- Authentication and Client Initialization ---
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // --- Database Insertion (Scan Record) ---
    const { data: scan, error: scanError } = await supabaseClient
      .from('scans')
      .insert({
        user_id: user.id,
        name,
        scan_type: scanType,
        target_url: targetUrl,
        github_repo: githubRepo,
        status: 'processing'
      })
      .select()
      .single();

    if (scanError) throw scanError;

    // --- Scanning Logic ---
    let issues: AccessibilityIssue[] = [];

    if (scanType === 'url' && targetUrl) {
      const res = await fetch(targetUrl);
      const html = await res.text();
      issues = scanHTML(html);

    } else if (scanType === 'file' && htmlContent) {
      issues = scanHTML(htmlContent);

    } else if (scanType === 'github' && githubRepo && githubToken) {
      const files = await fetchRepoHTMLFiles(githubRepo, githubToken);
      for (const file of files) {
        const fileIssues = scanHTML(file.content).map(i => ({ ...i, filePath: file.path }));
        issues.push(...fileIssues);
      }
    }

    // --- Database Insertion (Issue Records) ---
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
        wcag_criteria: issue.wcagCriteria,
        file_path: issue.filePath
      }));
      await supabaseClient.from('issues').insert(issueRecords);
    }

    // --- Database Update (Final Scan Status) ---
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const infoCount = issues.filter(i => i.severity === 'info').length;

    const { data: updatedScan } = await supabaseClient
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

    // --- Successful Response ---
    return new Response(JSON.stringify({ scan: updatedScan || scan, issues }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // This general catch ensures that even unhandled exceptions return CORS headers
    console.error("Critical Error in Scan Function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
