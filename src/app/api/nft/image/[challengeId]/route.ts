import { NextRequest, NextResponse } from 'next/server';
import { AchievementLevel } from '@/types';

// Generate SVG medal image based on achievement level
function generateMedalSVG(level: AchievementLevel, challengeTitle: string): string {
    const colors = {
        [AchievementLevel.GOLD]: {
            primary: '#FFD700',
            secondary: '#FFA500',
            accent: '#FF8C00',
            text: '#8B4513'
        },
        [AchievementLevel.SILVER]: {
            primary: '#C0C0C0',
            secondary: '#A9A9A9',
            accent: '#808080',
            text: '#2F4F4F'
        },
        [AchievementLevel.BRONZE]: {
            primary: '#CD7F32',
            secondary: '#A0522D',
            accent: '#8B4513',
            text: '#FFFFFF'
        }
    };

    const medals = {
        [AchievementLevel.GOLD]: '🥇',
        [AchievementLevel.SILVER]: '🥈',
        [AchievementLevel.BRONZE]: '🥉'
    };

    const levelText = {
        [AchievementLevel.GOLD]: 'GOAL ACHIEVED',
        [AchievementLevel.SILVER]: 'COMPLETED',
        [AchievementLevel.BRONZE]: 'CHALLENGED'
    };

    const color = colors[level];
    const medal = medals[level];
    const text = levelText[level];

    // Truncate title if too long
    const displayTitle = challengeTitle.length > 20
        ? challengeTitle.substring(0, 17) + '...'
        : challengeTitle;

    return `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="medalGradient" cx="50%" cy="30%" r="70%">
          <stop offset="0%" style="stop-color:${color.primary};stop-opacity:1" />
          <stop offset="70%" style="stop-color:${color.secondary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color.accent};stop-opacity:1" />
        </radialGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="4" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="400" fill="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"/>
      
      <!-- Medal Circle -->
      <circle cx="200" cy="180" r="120" fill="url(#medalGradient)" filter="url(#shadow)" stroke="${color.accent}" stroke-width="4"/>
      
      <!-- Inner Circle -->
      <circle cx="200" cy="180" r="90" fill="none" stroke="${color.accent}" stroke-width="2" opacity="0.7"/>
      
      <!-- Medal Emoji -->
      <text x="200" y="200" font-family="Arial, sans-serif" font-size="60" text-anchor="middle" fill="${color.text}">${medal}</text>
      
      <!-- Achievement Text -->
      <text x="200" y="330" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="white">${text}</text>
      
      <!-- Challenge Title -->
      <text x="200" y="355" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="rgba(255,255,255,0.9)">${displayTitle}</text>
      
      <!-- Protocol Branding -->
      <text x="200" y="380" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="rgba(255,255,255,0.7)">Marathon Challenge Protocol</text>
      
      <!-- Decorative Elements -->
      <circle cx="120" cy="100" r="3" fill="rgba(255,255,255,0.3)"/>
      <circle cx="280" cy="120" r="2" fill="rgba(255,255,255,0.4)"/>
      <circle cx="100" cy="260" r="2" fill="rgba(255,255,255,0.3)"/>
      <circle cx="300" cy="280" r="3" fill="rgba(255,255,255,0.4)"/>
    </svg>
  `;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { challengeId: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const level = searchParams.get('level') as AchievementLevel || AchievementLevel.BRONZE;
        const title = searchParams.get('title') || 'Marathon Challenge';

        // Validate achievement level
        if (!Object.values(AchievementLevel).includes(level)) {
            return NextResponse.json(
                { error: 'Invalid achievement level' },
                { status: 400 }
            );
        }

        const svg = generateMedalSVG(level, title);

        return new NextResponse(svg, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });

    } catch (error) {
        console.error('NFT image generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate NFT image' },
            { status: 500 }
        );
    }
}