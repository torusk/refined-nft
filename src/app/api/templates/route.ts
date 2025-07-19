import { NextRequest, NextResponse } from 'next/server';
import { TemplateService } from '@/services/templateService';

// Get all active templates
export async function GET(request: NextRequest) {
  try {
    const templates = await TemplateService.getActiveTemplates();

    return NextResponse.json({
      success: true,
      data: templates
    });

  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}