import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey",
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

    let y = height - 50;

    page.drawText(`Accessibility Scan Report for: ${scan.name}`, {
      x: 50,
      y,
      font: boldFont,
      size: 24,
    });
    y -= 30;
    
    page.drawText(`URL: ${scan.target_url || scan.file_name}`, {
        x: 50,
        y,
        font: font,
        size: 12,
      });
      y -= 20;

    page.drawText(`Score: ${scan.rating}/100 (${scan.grade})`, {
        x: 50,
        y,
        font: boldFont,
        size: 16,
      });
      y -= 30;

    for (const issue of issues) {
        y -= 20;
        page.drawText(`[${issue.severity}] ${issue.title}`, { x: 50, y, font: boldFont, size: 12 });
        y -= 15;
        page.drawText(issue.description, { x: 50, y, font, size: 10, maxWidth: width - 100, lineHeight: 12 });
        y -= 30;
        page.drawText(`Selector: ${issue.selector}`, {x: 50, y, font: codeFont, size: 8 });
        y -= 20;
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});