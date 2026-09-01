import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Fetch AI analytics data for export
    const { data: aiData, error } = await supabase
      .from('ai_analytics')
      .select('id, created_at, question, answer, confidence_score, response_time_ms, source_type')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!aiData || aiData.length === 0) {
      return new NextResponse('No data available to export', { status: 404 });
    }

    // Prepare CSV header
    const headers = [
      'ID',
      'Created At',
      'Question',
      'Answer',
      'Confidence Score',
      'Response Time (ms)',
      'Source Type'
    ].join(',');

    // Prepare CSV rows
    const rows = aiData.map((row) => {
      return [
        row.id,
        new Date(row.created_at).toISOString(),
        `"${(row.question || '').replace(/"/g, '""')}"`, // escape quotes for CSV
        `"${(row.answer || '').replace(/"/g, '""')}"`,
        row.confidence_score,
        row.response_time_ms,
        row.source_type
      ].join(',');
    });

    const csvContent = [headers, ...rows].join('\n');

    // Return the CSV file as a downloadable response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="ai_analytics_export.csv"',
      },
    });

  } catch (error: any) {
    console.error('Export error:', error);
    return new NextResponse(error.message || 'Export failed', { status: 500 });
  }
}
