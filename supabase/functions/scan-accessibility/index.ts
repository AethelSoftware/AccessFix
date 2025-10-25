import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Octokit } from "npm:octokit@3";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Github-Token"
};
// Enhanced HTML scanning with more comprehensive checks
function scanHTML(html) {
  const issues = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  if (!doc) {
    console.error('Failed to parse HTML');
    return issues;
  }
  // Check for missing lang attribute
  const htmlElement = doc.querySelector('html');
  if (htmlElement && !htmlElement.getAttribute('lang')) {
    issues.push({
      severity: 'critical',
      category: 'Language',
      title: 'Missing lang attribute on html element',
      description: 'The html element must have a lang attribute to help screen readers pronounce content correctly.',
      selector: 'html',
      recommendedFix: 'Add lang="en" or appropriate language code to html element',
      codeSnippet: '<html>',
      fixedCode: '<html lang="en">',
      wcagCriteria: 'WCAG 2.1 Level A - 3.1.1 Language of Page'
    });
  }
  // Check images for alt attributes
  const images = doc.querySelectorAll('img');
  images.forEach((img, index)=>{
    const alt = img.getAttribute('alt');
    const src = img.getAttribute('src') || '';
    if (alt === null) {
      issues.push({
        severity: 'critical',
        category: 'Text Alternatives',
        title: 'Image missing alt attribute',
        description: 'All images must have an alt attribute for screen readers. Decorative images should use alt="".',
        selector: `img:nth-of-type(${index + 1})`,
        recommendedFix: 'Add alt attribute with descriptive text or alt="" for decorative images',
        codeSnippet: img.outerHTML,
        fixedCode: img.outerHTML.replace('<img', '<img alt="Description of image"'),
        wcagCriteria: 'WCAG 2.1 Level A - 1.1.1 Non-text Content'
      });
    } else if (alt === '' && !src.includes('decorative') && !img.hasAttribute('role')) {
      issues.push({
        severity: 'warning',
        category: 'Text Alternatives',
        title: 'Image has empty alt attribute',
        description: 'Empty alt attributes should only be used for decorative images. If this image conveys information, add descriptive alt text.',
        selector: `img:nth-of-type(${index + 1})`,
        recommendedFix: 'Replace empty alt with descriptive text if image is meaningful, or add role="presentation" if truly decorative',
        codeSnippet: img.outerHTML,
        wcagCriteria: 'WCAG 2.1 Level A - 1.1.1 Non-text Content'
      });
    }
  });
  // Check form inputs for labels
  const inputs = doc.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="tel"], input[type="number"], input[type="search"], input[type="url"], textarea');
  inputs.forEach((input, index)=>{
    const id = input.getAttribute('id');
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledby = input.getAttribute('aria-labelledby');
    const title = input.getAttribute('title');
    if (!id && !ariaLabel && !ariaLabelledby && !title) {
      issues.push({
        severity: 'critical',
        category: 'Forms',
        title: 'Form input without accessible label',
        description: 'Form inputs must have an associated label, aria-label, aria-labelledby, or title attribute for accessibility.',
        selector: `${input.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
        recommendedFix: 'Add an id attribute and associate with a <label>, or use aria-label',
        codeSnippet: input.outerHTML,
        fixedCode: `<label for="input-${index}">Field Label</label>\n${input.outerHTML.replace(/^<input/, `<input id="input-${index}"`)}`,
        wcagCriteria: 'WCAG 2.1 Level A - 1.3.1 Info and Relationships, 3.3.2 Labels or Instructions'
      });
    } else if (id) {
      // Check if label actually exists
      const label = doc.querySelector(`label[for="${id}"]`);
      if (!label && !ariaLabel && !ariaLabelledby) {
        issues.push({
          severity: 'critical',
          category: 'Forms',
          title: 'Form input has id but no associated label',
          description: 'The input has an id attribute but no corresponding label element.',
          selector: `#${id}`,
          recommendedFix: `Add <label for="${id}">Label Text</label> before or after the input`,
          codeSnippet: input.outerHTML,
          wcagCriteria: 'WCAG 2.1 Level A - 1.3.1 Info and Relationships'
        });
      }
    }
  });
  // Check buttons for accessible text
  const buttons = doc.querySelectorAll('button');
  buttons.forEach((button, index)=>{
    const text = button.textContent?.trim();
    const ariaLabel = button.getAttribute('aria-label');
    const ariaLabelledby = button.getAttribute('aria-labelledby');
    const title = button.getAttribute('title');
    if (!text && !ariaLabel && !ariaLabelledby && !title) {
      issues.push({
        severity: 'critical',
        category: 'Forms',
        title: 'Button without accessible name',
        description: 'Buttons must contain text, aria-label, aria-labelledby, or title for screen readers to announce.',
        selector: `button:nth-of-type(${index + 1})`,
        recommendedFix: 'Add descriptive text inside the button or use aria-label attribute',
        codeSnippet: button.outerHTML,
        fixedCode: '<button>Descriptive Action</button>',
        wcagCriteria: 'WCAG 2.1 Level A - 4.1.2 Name, Role, Value'
      });
    }
  });
  // Check links for accessible text
  const links = doc.querySelectorAll('a[href]');
  links.forEach((link, index)=>{
    const text = link.textContent?.trim();
    const ariaLabel = link.getAttribute('aria-label');
    const ariaLabelledby = link.getAttribute('aria-labelledby');
    const title = link.getAttribute('title');
    if (!text && !ariaLabel && !ariaLabelledby && !title) {
      issues.push({
        severity: 'critical',
        category: 'Navigation',
        title: 'Link without accessible name',
        description: 'Links must contain text, aria-label, aria-labelledby, or title so users know where the link goes.',
        selector: `a:nth-of-type(${index + 1})`,
        recommendedFix: 'Add descriptive link text or use aria-label attribute',
        codeSnippet: link.outerHTML,
        fixedCode: '<a href="...">Descriptive Link Text</a>',
        wcagCriteria: 'WCAG 2.1 Level A - 2.4.4 Link Purpose (In Context)'
      });
    } else if (text && /^(click here|read more|here|more|link)$/i.test(text)) {
      issues.push({
        severity: 'warning',
        category: 'Navigation',
        title: 'Non-descriptive link text',
        description: 'Avoid generic link text like "click here" or "read more". Link text should describe the destination.',
        selector: `a:nth-of-type(${index + 1})`,
        recommendedFix: 'Use descriptive link text that makes sense out of context',
        codeSnippet: link.outerHTML,
        wcagCriteria: 'WCAG 2.1 Level A - 2.4.4 Link Purpose (In Context)'
      });
    }
  });
  // Check heading hierarchy
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const headingLevels = [];
  headings.forEach((heading)=>{
    const level = parseInt(heading.tagName[1]);
    headingLevels.push(level);
  });
  if (headingLevels.length > 0 && !headingLevels.includes(1)) {
    issues.push({
      severity: 'warning',
      category: 'Structure',
      title: 'Page missing h1 heading',
      description: 'Pages should have a single h1 heading that describes the main content.',
      recommendedFix: 'Add an h1 element to identify the main topic of the page',
      wcagCriteria: 'WCAG 2.1 Level A - 1.3.1 Info and Relationships'
    });
  }
  // Check for skipped heading levels
  for(let i = 1; i < headingLevels.length; i++){
    if (headingLevels[i] - headingLevels[i - 1] > 1) {
      issues.push({
        severity: 'warning',
        category: 'Structure',
        title: 'Skipped heading level',
        description: `Heading hierarchy jumps from h${headingLevels[i - 1]} to h${headingLevels[i]}. Headings should not skip levels.`,
        recommendedFix: 'Use sequential heading levels (h1, h2, h3) without skipping',
        wcagCriteria: 'WCAG 2.1 Level A - 1.3.1 Info and Relationships'
      });
      break;
    }
  }
  // Check iframes for title
  const iframes = doc.querySelectorAll('iframe');
  iframes.forEach((iframe, index)=>{
    const title = iframe.getAttribute('title');
    const ariaLabel = iframe.getAttribute('aria-label');
    if (!title && !ariaLabel) {
      issues.push({
        severity: 'critical',
        category: 'Structure',
        title: 'Iframe missing title attribute',
        description: 'Iframes must have a title or aria-label attribute that describes their content for screen reader users.',
        selector: `iframe:nth-of-type(${index + 1})`,
        recommendedFix: 'Add title attribute with descriptive text',
        codeSnippet: iframe.outerHTML,
        fixedCode: iframe.outerHTML.replace('<iframe', '<iframe title="Description of iframe content"'),
        wcagCriteria: 'WCAG 2.1 Level A - 4.1.2 Name, Role, Value'
      });
    }
  });
  // Check tables for headers
  const tables = doc.querySelectorAll('table');
  tables.forEach((table, index)=>{
    const hasHeaders = table.querySelector('th');
    const hasThead = table.querySelector('thead');
    if (!hasHeaders) {
      issues.push({
        severity: 'warning',
        category: 'Tables',
        title: 'Table missing header cells',
        description: 'Data tables should use <th> elements for headers to establish relationships between data.',
        selector: `table:nth-of-type(${index + 1})`,
        recommendedFix: 'Use <th> elements for table headers with scope attribute (scope="col" or scope="row")',
        wcagCriteria: 'WCAG 2.1 Level A - 1.3.1 Info and Relationships'
      });
    }
    const caption = table.querySelector('caption');
    if (!caption) {
      issues.push({
        severity: 'info',
        category: 'Tables',
        title: 'Table missing caption',
        description: 'Tables should include a <caption> element to describe the table\'s purpose.',
        selector: `table:nth-of-type(${index + 1})`,
        recommendedFix: 'Add <caption>Table Description</caption> as the first child of the table',
        wcagCriteria: 'WCAG 2.1 Level A - 1.3.1 Info and Relationships'
      });
    }
  });
  // Check for duplicate IDs
  const allIds = [];
  const elementsWithId = doc.querySelectorAll('[id]');
  elementsWithId.forEach((element)=>{
    const id = element.getAttribute('id');
    if (id) {
      if (allIds.includes(id)) {
        issues.push({
          severity: 'critical',
          category: 'HTML',
          title: 'Duplicate ID attribute',
          description: `The id "${id}" appears multiple times in the document. IDs must be unique.`,
          selector: `#${id}`,
          recommendedFix: 'Ensure each id attribute has a unique value',
          wcagCriteria: 'WCAG 2.1 Level A - 4.1.1 Parsing'
        });
      }
      allIds.push(id);
    }
  });
  // Check for ARIA roles used incorrectly
  const elementsWithRole = doc.querySelectorAll('[role]');
  elementsWithRole.forEach((element, index)=>{
    const role = element.getAttribute('role');
    const tagName = element.tagName.toLowerCase();
    // Check for redundant roles
    const redundantRoles = {
      'button': [
        'button'
      ],
      'nav': [
        'navigation'
      ],
      'main': [
        'main'
      ],
      'aside': [
        'complementary'
      ],
      'footer': [
        'contentinfo'
      ],
      'header': [
        'banner'
      ]
    };
    if (redundantRoles[tagName]?.includes(role || '')) {
      issues.push({
        severity: 'info',
        category: 'ARIA',
        title: 'Redundant ARIA role',
        description: `The <${tagName}> element has an implicit role of "${role}", no need to specify it.`,
        selector: `${tagName}:nth-of-type(${index + 1})`,
        recommendedFix: 'Remove the redundant role attribute',
        wcagCriteria: 'WCAG 2.1 Level A - 4.1.2 Name, Role, Value'
      });
    }
  });
  // Check for required ARIA attributes
  const elementsWithAriaRequired = doc.querySelectorAll('[aria-required="true"]');
  elementsWithAriaRequired.forEach((element, index)=>{
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledby = element.getAttribute('aria-labelledby');
    const id = element.getAttribute('id');
    const label = id ? doc.querySelector(`label[for="${id}"]`) : null;
    if (!ariaLabel && !ariaLabelledby && !label) {
      issues.push({
        severity: 'warning',
        category: 'Forms',
        title: 'Required field without label',
        description: 'Fields marked as required must have an accessible label.',
        selector: `[aria-required="true"]:nth-of-type(${index + 1})`,
        recommendedFix: 'Add aria-label, aria-labelledby, or associate with a label element',
        wcagCriteria: 'WCAG 2.1 Level A - 3.3.2 Labels or Instructions'
      });
    }
  });
  return issues;
}
// Fetch GitHub repo HTML files
async function fetchRepoHTMLFiles(repoFullName, githubToken) {
  const [owner, repo] = repoFullName.split("/");
  const octokit = new Octokit({
    auth: githubToken
  });
  const files = [];
  async function recurse(path = "") {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path
    });
    if (Array.isArray(data)) {
      for (const item of data){
        if (item.type === "file" && item.name.endsWith(".html")) {
          const file = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: item.path
          });
          const content = atob(file.data.content);
          files.push({
            path: item.path,
            content
          });
        } else if (item.type === "dir") {
          await recurse(item.path);
        }
      }
    }
  }
  await recurse("");
  return files;
}
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  try {
    let requestData;
    const contentType = req.headers.get("content-type") || "";
    if (req.method !== "POST" || !contentType.includes("application/json")) {
      return new Response(JSON.stringify({
        error: `Method ${req.method} not allowed or missing 'application/json' Content-Type.`
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    try {
      requestData = await req.json();
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return new Response(JSON.stringify({
        error: "Invalid or malformed JSON request body."
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const { scanType, targetUrl, htmlContent, name, githubRepo } = requestData;
    const githubToken = req.headers.get("X-Github-Token") || "";
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization')
        }
      }
    });
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const { data: scan, error: scanError } = await supabaseClient.from('scans').insert({
      user_id: user.id,
      name,
      scan_type: scanType,
      target_url: targetUrl,
      github_repo: githubRepo,
      status: 'processing'
    }).select().single();
    if (scanError) throw scanError;
    let issues = [];
    let insertedIssues = [];
    if (scanType === 'url' && targetUrl) {
      const res = await fetch(targetUrl);
      const html = await res.text();
      issues = scanHTML(html);
    } else if (scanType === 'file' && htmlContent) {
      issues = scanHTML(htmlContent);
    } else if (scanType === 'github' && githubRepo && githubToken) {
      const files = await fetchRepoHTMLFiles(githubRepo, githubToken);
      for (const file of files){
        const fileIssues = scanHTML(file.content);
        issues.push(...fileIssues.map((i)=>({
            ...i,
            filePath: file.path
          })));
      }
    }
    if (issues.length > 0) {
      const issueRecords = issues.map((issue)=>({
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
      const { data: issuesData, error: issuesError } = await supabaseClient.from('issues').insert(issueRecords).select();
      if (issuesError) throw issuesError;
      insertedIssues = issuesData || [];
    }
    const criticalCount = issues.filter((i)=>i.severity === 'critical').length;
    const warningCount = issues.filter((i)=>i.severity === 'warning').length;
    const infoCount = issues.filter((i)=>i.severity === 'info').length;
    const { data: updatedScan, error: updateError } = await supabaseClient.from('scans').update({
      status: 'completed',
      total_issues: issues.length,
      critical_count: criticalCount,
      warning_count: warningCount,
      info_count: infoCount,
      completed_at: new Date().toISOString()
    }).eq('id', scan.id).select().single();
    if (updateError) throw updateError;
    return new Response(JSON.stringify({
      scan: updatedScan || scan,
      issues: insertedIssues
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Critical Error in Scan Function:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
