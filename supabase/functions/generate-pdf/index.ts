import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { scan_id } = await req.json();
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Fetch Scan and Issues
    const { data: scan, error: scanError } = await supabaseAdmin
      .from("scans")
      .select("*")
      .eq("id", scan_id)
      .single();

    if (scanError) throw scanError;

    const { data: issues, error: issuesError } = await supabaseAdmin
      .from("issues")
      .select("*")
      .eq("scan_id", scan_id)
      .order("severity", { ascending: false });

    if (issuesError) throw issuesError;

    // 2. Create PDF
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
    page.drawText(`Accessibility Score: ${scan.rating}/100 (${scan.grade})`, {
      x: margin,
      y,
      font: boldFont,
      size: 12,
      color: rgb(0, 0, 0),
    });
    y -= 30;

    // Issues header
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
      if (y < 100) {
        const newPage = pdfDoc.addPage();
        const { height: newHeight } = newPage.getSize();
        y = newHeight - margin;
        
        // Add header to new page
        newPage.drawText(`Accessibility Scan Report - ${scan.name}`, {
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
      page.drawText(issue.title, {
        x: margin + severityWidth + 5,
        y,
        font: boldFont,
        size: 12,
        color: rgb(0, 0, 0),
      });
      y -= 18;

      // Description
      const descriptionLines = wrapText(issue.description, font, 10, maxWidth);
      for (const line of descriptionLines) {
        if (y < 80) {
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

      // Selector
      if (issue.selector) {
        if (y < 80) {
          const newPage = pdfDoc.addPage();
          const { height: newHeight } = newPage.getSize();
          y = newHeight - margin;
        }
        page.drawText(`Selector:`, {
          x: margin,
          y,
          font: font,
          size: 9,
          color: rgb(0.4, 0.4, 0.4),
        });
        y -= 12;
        
        const selectorLines = wrapText(issue.selector, codeFont, 8, maxWidth);
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
          y -= 10;
        }
      }

      y -= 20; // Space between issues
    }

    // 3. Save PDF to buffer
    const pdfBytes = await pdfDoc.save();

    // 4. Upload to Supabase Storage
    const filePath = `${scan.user_id}/${scan.id}.pdf`;
    const { error: storageError } = await supabaseAdmin.storage
      .from("reports")
      .upload(filePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (storageError) throw storageError;

    // 5. Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("reports")
      .getPublicUrl(filePath);

    // 6. Update scan with PDF URL
    const { error: updateError } = await supabaseAdmin
      .from("scans")
      .update({ pdf_report_url: publicUrlData.publicUrl })
      .eq("id", scan_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ pdf_report_url: publicUrlData.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

// Helper function to wrap text
function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
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
    case 'medium':
      return rgb(0.9, 0.7, 0.1);
    case 'low':
      return rgb(0.2, 0.5, 0.8);
    default:
      return rgb(0.5, 0.5, 0.5);
  }
}
