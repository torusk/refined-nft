import { NextRequest, NextResponse } from 'next/server';
import { TemplateService } from '@/services/templateService';
import { mockTemplates } from '@/lib/mock/mockData';

// Get all active templates
export async function GET(request: NextRequest) {
  try {
    // Use mock data if database is not configured
    if (process.env.NODE_ENV === 'development' && !process.env.DB_HOST) {
      return NextResponse.json({
        success: true,
        data: mockTemplates
      });
    }

    const templates = await TemplateService.getActiveTemplates();

    return NextResponse.json({
      success: true,
      data: templates
    });

  } catch (error) {
    console.error('Get templates error:', error);
    
    // Fallback to mock data on error
    return NextResponse.json({
      success: true,
      data: mockTemplates
    });
  }
}