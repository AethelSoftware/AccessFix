import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    // Parse request body
    let scan_id: string;
    try {
      const body = await req.json();
      scan_id = body.scan_id;
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    if (!scan_id) {
      return new Response(
        JSON.stringify({ error: "scan_id is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase environment variables not configured" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch Scan
    const { data: scan, error: scanError } = await supabaseAdmin
      .from("scans")
      .select("*")
      .eq("id", scan_id)
      .single();

    if (scanError) {
      console.error("Scan fetch error:", scanError);
      return new Response(
        JSON.stringify({ error: "Scan not found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    // 2. Fetch Issues
    const { data: issues, error: issuesError } = await supabaseAdmin
      .from("issues")
      .select("*")
      .eq("scan_id", scan_id)
      .order("severity", { ascending: false });

    if (issuesError) {
      console.error("Issues fetch error:", issuesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch issues" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Calculate score if not provided
    const calculateAccessibilityScore = (issues: any[]) => {
      if (issues.length === 0) return { rating: 100, grade: 'A' };
      
      const criticalCount = issues.filter((i: any) => i.severity === 'critical').length;
      const warningCount = issues.filter((i: any) => i.severity === 'warning').length;
      const infoCount = issues.filter((i: any) => i.severity === 'info').length;
      
      let score = 100;
      score -= criticalCount * 10;
      score -= warningCount * 5;
      score -= infoCount * 2;
      
      score = Math.max(0, Math.min(100, score));
      
      let grade = 'A';
      if (score < 90) grade = 'B';
      if (score < 80) grade = 'C';
      if (score < 70) grade = 'D';
      if (score < 60) grade = 'F';
      
      return { rating: Math.round(score), grade };
    };

    const scoreData = scan.rating && scan.grade 
      ? { rating: scan.rating, grade: scan.grade }
      : calculateAccessibilityScore(issues || []);

    // 3. Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const codeFont = await pdfDoc.embedFont(StandardFonts.Courier);

    const margin = 50;
    const maxWidth = width - (margin * 2);
    let y = height - margin;

    // Title
    page.drawText(`Accessibility Scan Report`, {
      x: margin,
      y,
      font: boldFont,
      size: 24,
      color: rgb(0, 0, 0),
    });
    y -= 40;

    // Scan name
    page.drawText(`Scan: ${scan.name}`, {
      x: margin,
      y,
      font: boldFont,
      size: 14,
      color: rgb(0, 0, 0),
    });
    y -= 20;

    // URL
    const url = scan.target_url || scan.file_name || 'N/A';
    page.drawText(`URL: ${url}`, {
      x: margin,
      y,
      font: font,
      size: 10,
      color: rgb(0, 0, 0),
    });
    y -= 20;

    // Score
    page.drawText(`Accessibility Score: ${scoreData.rating}/100 (${scoreData.grade})`, {
      x: margin,
      y,
      font: boldFont,
      size: 12,
      color: rgb(0, 0, 0),
    });
    y -= 30;

    // Scan date
    const scanDate = new Date(scan.created_at).toLocaleDateString();
    page.drawText(`Scan Date: ${scanDate}`, {
      x: margin,
      y,
      font: font,
      size: 10,
      color: rgb(0.4, 0.4, 0.4),
    });
    y -= 30;

    // Summary
    page.drawText(`Summary:`, {
      x: margin,
      y,
      font: boldFont,
      size: 14,
      color: rgb(0, 0, 0),
    });
    y -= 20;

    const totalIssues = issues?.length || 0;
    const criticalCount = issues?.filter((i: any) => i.severity === 'critical').length || 0;
    const warningCount = issues?.filter((i: any) => i.severity === 'warning').length || 0;
    const infoCount = issues?.filter((i: any) => i.severity === 'info').length || 0;

    page.drawText(`• Total Issues: ${totalIssues}`, {
      x: margin + 10,
      y,
      font: font,
      size: 10,
      color: rgb(0, 0, 0),
    });
    y -= 15;

    page.drawText(`• Critical: ${criticalCount}`, {
      x: margin + 10,
      y,
      font: font,
      size: 10,
      color: rgb(0.8, 0.1, 0.1),
    });
    y -= 15;

    page.drawText(`• Warnings: ${warningCount}`, {
      x: margin + 10,
      y,
      font: font,
      size: 10,
      color: rgb(0.9, 0.5, 0.1),
    });
    y -= 15;

    page.drawText(`• Info: ${infoCount}`, {
      x: margin + 10,
      y,
      font: font,
      size: 10,
      color: rgb(0.2, 0.5, 0.8),
    });
    y -= 30;

    // Issues header
    if (issues && issues.length > 0) {
      page.drawText(`Issues Found (${issues.length}):`, {
        x: margin,
        y,
        font: boldFont,
        size: 16,
        color: rgb(0, 0, 0),
      });
      y -= 30;

      // Issues list
      for (const issue of issues) {
        // Check if we need a new page
        if (y < 150) {
          const newPage = pdfDoc.addPage();
          const { height: newHeight } = newPage.getSize();
          y = newHeight - margin;
          
          // Add header to new page
          newPage.drawText(`Accessibility Scan Report - ${scan.name} (Continued)`, {
            x: margin,
            y,
            font: boldFont,
            size: 12,
            color: rgb(0.5, 0.5, 0.5),
          });
          y -= 30;
        }

        // Severity and title
        const severityColor = getSeverityColor(issue.severity);
        page.drawText(`[${issue.severity.toUpperCase()}]`, {
          x: margin,
          y,
          font: boldFont,
          size: 12,
          color: severityColor,
        });
        
        const severityWidth = boldFont.widthOfTextAtSize(`[${issue.severity.toUpperCase()}]`, 12);
        const titleLines = wrapText(issue.title, boldFont, 12, maxWidth - severityWidth - 5);
        
        if (titleLines.length > 0) {
          page.drawText(titleLines[0], {
            x: margin + severityWidth + 5,
            y,
            font: boldFont,
            size: 12,
            color: rgb(0, 0, 0),
          });
          y -= 15;
        }

        // Description
        if (issue.description) {
          const descriptionLines = wrapText(issue.description, font, 10, maxWidth);
          for (const line of descriptionLines) {
            if (y < 100) {
              const newPage = pdfDoc.addPage();
              const { height: newHeight } = newPage.getSize();
              y = newHeight - margin;
            }
            page.drawText(line, {
              x: margin,
              y,
              font: font,
              size: 10,
              color: rgb(0, 0, 0),
            });
            y -= 12;
          }
          y -= 8;
        }

        // Category and WCAG
        if (issue.category || issue.wcag_criteria) {
          let infoText = '';
          if (issue.category) infoText += `Category: ${issue.category}`;
          if (issue.wcag_criteria) infoText += `${infoText ? ' | ' : ''}WCAG: ${issue.wcag_criteria}`;
          
          if (y < 80) {
            const newPage = pdfDoc.addPage();
            const { height: newHeight } = newPage.getSize();
            y = newHeight - margin;
          }
          
          page.drawText(infoText, {
            x: margin,
            y,
            font: font,
            size: 9,
            color: rgb(0.4, 0.4, 0.4),
          });
          y -= 15;
        }

        // Recommended fix
        if (issue.recommended_fix) {
          if (y < 100) {
            const newPage = pdfDoc.addPage();
            const { height: newHeight } = newPage.getSize();
            y = newHeight - margin;
          }
          
          page.drawText(`Recommended Fix:`, {
            x: margin,
            y,
            font: boldFont,
            size: 10,
            color: rgb(0, 0, 0),
          });
          y -= 12;
          
          const fixLines = wrapText(issue.recommended_fix, font, 9, maxWidth);
          for (const line of fixLines) {
            if (y < 80) {
              const newPage = pdfDoc.addPage();
              const { height: newHeight } = newPage.getSize();
              y = newHeight - margin;
            }
            page.drawText(line, {
              x: margin,
              y,
              font: font,
              size: 9,
              color: rgb(0, 0, 0),
            });
            y -= 10;
          }
        }

        // Selector
        if (issue.selector) {
          if (y < 80) {
            const newPage = pdfDoc.addPage();
            const { height: newHeight } = newPage.getSize();
            y = newHeight - margin;
          }
          
          const selectorLines = wrapText(`Selector: ${issue.selector}`, codeFont, 8, maxWidth);
          for (const line of selectorLines) {
            if (y < 80) {
              const newPage = pdfDoc.addPage();
              const { height: newHeight } = newPage.getSize();
              y = newHeight - margin;
            }
            page.drawText(line, {
              x: margin,
              y,
              font: codeFont,
              size: 8,
              color: rgb(0.2, 0.2, 0.2),
            });
            y -= 9;
          }
        }

        y -= 20; // Space between issues
      }
    } else {
      page.drawText('No issues found! 🎉', {
        x: margin,
        y,
        font: boldFont,
        size: 14,
        color: rgb(0, 0.6, 0),
      });
    }

    // 4. Save PDF to buffer
    const pdfBytes = await pdfDoc.save();

    // 5. Upload to Supabase Storage
    const filePath = `${scan.user_id}/${scan.id}.pdf`;
    const { error: storageError } = await supabaseAdmin.storage
      .from("reports")
      .upload(filePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (storageError) {
      console.error("Storage upload error:", storageError);
      return new Response(
        JSON.stringify({ error: "Failed to upload PDF to storage" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // 6. Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("reports")
      .getPublicUrl(filePath);

    // 7. Update scan with PDF URL and scores
    const { error: updateError } = await supabaseAdmin
      .from("scans")
      .update({ 
        pdf_report_url: publicUrlData.publicUrl,
        rating: scoreData.rating,
        grade: scoreData.grade,
        total_issues: totalIssues,
        critical_count: criticalCount,
        warning_count: warningCount,
        info_count: infoCount
      })
      .eq("id", scan_id);

    if (updateError) {
      console.error("Scan update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update scan with PDF URL" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    return new Response(JSON.stringify({ 
      pdf_report_url: publicUrlData.publicUrl,
      rating: scoreData.rating,
      grade: scoreData.grade 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Helper function to wrap text
function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  if (!text) return [];
  
  const lines: string[] = [];
  const words = text.split(' ');
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

// Helper function to get severity color
function getSeverityColor(severity: string) {
  switch (severity.toLowerCase()) {
    case 'critical':
      return rgb(0.8, 0.1, 0.1);
    case 'high':
      return rgb(0.9, 0.5, 0.1);
    case 'warning':
      return rgb(0.9, 0.7, 0.1);
    case 'medium':
      return rgb(0.9, 0.7, 0.1);
    case 'low':
      return rgb(0.2, 0.5, 0.8);
    case 'info':
      return rgb(0.2, 0.5, 0.8);
    default:
      return rgb(0.5, 0.5, 0.5);
  }
}
