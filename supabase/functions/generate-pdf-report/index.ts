import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { scan_id } = await req.json()

    if (!scan_id) {
      throw new Error('scan_id is required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch scan data
    const { data: scan, error: scanError } = await supabaseAdmin
      .from('scans')
      .select('*')
      .eq('id', scan_id)
      .single()

    if (scanError) throw scanError

    // Fetch issues
    const { data: issues, error: issuesError } = await supabaseAdmin
      .from('issues')
      .select('*')
      .eq('scan_id', scan_id)
      .order('severity', { ascending: false })

    if (issuesError) throw issuesError

    // Calculate accessibility score
    const calculateScore = (issues: any[]) => {
      if (issues.length === 0) return { rating: 100, grade: 'A' }
      
      const criticalCount = issues.filter(i => i.severity === 'critical').length
      const warningCount = issues.filter(i => i.severity === 'warning').length
      const infoCount = issues.filter(i => i.severity === 'info').length
      
      let score = 100
      score -= criticalCount * 10
      score -= warningCount * 5
      score -= infoCount * 2
      score = Math.max(0, Math.min(100, score))
      
      let grade = 'A'
      if (score < 90) grade = 'B'
      if (score < 80) grade = 'C'
      if (score < 70) grade = 'D'
      if (score < 60) grade = 'F'
      
      return { rating: Math.round(score), grade }
    }

    const scoreData = scan.rating && scan.grade 
      ? { rating: scan.rating, grade: scan.grade }
      : calculateScore(issues || [])

    // Create PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 800])
    const { width, height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const margin = 50
    let y = height - margin

    // Title
    page.drawText('Accessibility Scan Report', {
      x: margin,
      y,
      size: 20,
      font: boldFont,
    })
    y -= 40

    // Scan info
    page.drawText(`Scan: ${scan.name}`, { x: margin, y, size: 12, font: boldFont })
    y -= 20
    page.drawText(`URL: ${scan.target_url || scan.file_name || 'N/A'}`, { x: margin, y, size: 10, font })
    y -= 20
    page.drawText(`Score: ${scoreData.rating}/100 (${scoreData.grade})`, { x: margin, y, size: 12, font: boldFont })
    y -= 30

    // Summary
    const totalIssues = issues?.length || 0
    const criticalCount = issues?.filter(i => i.severity === 'critical').length || 0
    const warningCount = issues?.filter(i => i.severity === 'warning').length || 0
    const infoCount = issues?.filter(i => i.severity === 'info').length || 0

    page.drawText('Summary:', { x: margin, y, size: 14, font: boldFont })
    y -= 20
    page.drawText(`Total Issues: ${totalIssues}`, { x: margin, y, size: 10, font })
    y -= 15
    page.drawText(`Critical: ${criticalCount}`, { x: margin, y, size: 10, font, color: rgb(0.8, 0.1, 0.1) })
    y -= 15
    page.drawText(`Warnings: ${warningCount}`, { x: margin, y, size: 10, font, color: rgb(0.9, 0.5, 0.1) })
    y -= 15
    page.drawText(`Info: ${infoCount}`, { x: margin, y, size: 10, font, color: rgb(0.2, 0.5, 0.8) })
    y -= 30

    // Issues
    if (issues && issues.length > 0) {
      page.drawText('Issues Found:', { x: margin, y, size: 16, font: boldFont })
      y -= 30

      for (const issue of issues) {
        if (y < 100) {
          const newPage = pdfDoc.addPage([600, 800])
          y = newPage.getSize().height - margin
        }

        const severityColor = getSeverityColor(issue.severity)
        page.drawText(`[${issue.severity.toUpperCase()}] ${issue.title}`, {
          x: margin,
          y,
          size: 12,
          font: boldFont,
          color: severityColor,
        })
        y -= 20

        if (issue.description) {
          const lines = wrapText(issue.description, font, 10, width - margin * 2)
          for (const line of lines) {
            if (y < 50) break
            page.drawText(line, { x: margin, y, size: 9, font })
            y -= 12
          }
          y -= 10
        }

        if (issue.recommended_fix) {
          page.drawText(`Fix: ${issue.recommended_fix}`, {
            x: margin,
            y,
            size: 9,
            font,
            color: rgb(0.3, 0.3, 0.3),
          })
          y -= 15
        }

        y -= 20
      }
    } else {
      page.drawText('No issues found! 🎉', {
        x: margin,
        y,
        size: 14,
        font: boldFont,
        color: rgb(0, 0.6, 0),
      })
    }

    const pdfBytes = await pdfDoc.save()

    // Upload to storage
    const filePath = `${scan.user_id}/${scan.id}.pdf`
    const { error: uploadError } = await supabaseAdmin.storage
      .from('reports')
      .upload(filePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('reports')
      .getPublicUrl(filePath)

    // Update scan record
    const { error: updateError } = await supabaseAdmin
      .from('scans')
      .update({
        pdf_report_url: urlData.publicUrl,
        rating: scoreData.rating,
        grade: scoreData.grade,
        total_issues: totalIssues,
        critical_count: criticalCount,
        warning_count: warningCount,
        info_count: infoCount,
      })
      .eq('id', scan_id)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({
        success: true,
        pdf_report_url: urlData.publicUrl,
        rating: scoreData.rating,
        grade: scoreData.grade,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const lines: string[] = []
  const words = text.split(' ')
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const width = font.widthOfTextAtSize(testLine, fontSize)

    if (width <= maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }

  if (currentLine) lines.push(currentLine)
  return lines
}

function getSeverityColor(severity: string) {
  switch (severity.toLowerCase()) {
    case 'critical': return rgb(0.8, 0.1, 0.1)
    case 'warning': return rgb(0.9, 0.5, 0.1)
    case 'info': return rgb(0.2, 0.5, 0.8)
    default: return rgb(0, 0, 0)
  }
}