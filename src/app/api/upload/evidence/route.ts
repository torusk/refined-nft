import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/middleware/auth';
import crypto from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Mock IPFS service for development
class MockIPFSService {
    static async uploadFile(file: File, challengeId: string): Promise<{ hash: string; url: string }> {
        // Generate a mock hash
        const buffer = Buffer.from(await file.arrayBuffer());
        const hash = crypto.createHash('sha256').update(buffer).digest('hex');

        // In development, save to public/uploads directory
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch (error) {
            // Directory might already exist
        }

        const fileName = `${challengeId}-${Date.now()}-${file.name}`;
        const filePath = path.join(uploadsDir, fileName);

        await writeFile(filePath, buffer);

        return {
            hash,
            url: `/uploads/${fileName}`,
        };
    }
}

// Real IPFS service (for production)
class IPFSService {
    static async uploadFile(file: File): Promise<{ hash: string; url: string }> {
        // This would integrate with Pinata or another IPFS service
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PINATA_API_KEY}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('IPFS upload failed');
        }

        const data = await response.json();

        return {
            hash: data.IpfsHash,
            url: `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${data.IpfsHash}`,
        };
    }
}

export const POST = withAuth(async (request) => {
    try {
        const user = getAuthUser(request);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('evidence') as File;
        const challengeId = formData.get('challengeId') as string;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        if (!challengeId) {
            return NextResponse.json(
                { success: false, error: 'Challenge ID is required' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, error: 'Only image files are allowed' },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'File size must be less than 10MB' },
                { status: 400 }
            );
        }

        // Upload to IPFS (or mock service in development)
        let uploadResult;

        if (process.env.NODE_ENV === 'development' || !process.env.PINATA_API_KEY) {
            // Use mock service for development
            uploadResult = await MockIPFSService.uploadFile(file, challengeId);
        } else {
            // Use real IPFS service for production
            uploadResult = await IPFSService.uploadFile(file);
        }

        return NextResponse.json({
            success: true,
            data: uploadResult
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Upload failed' },
            { status: 500 }
        );
    }
});

// Configure for file uploads
export const config = {
    api: {
        bodyParser: false,
    },
};