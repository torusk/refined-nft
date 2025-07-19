import { NFTMetadata, NFTRecord, AchievementLevel, Challenge, ChallengeResult } from '@/types';

// Only import database connection on server side
let getConnection: any;
let generateUUID: any;

if (typeof window === 'undefined') {
    // Server-side only imports
    const dbModule = require('@/lib/database/connection');
    getConnection = dbModule.getConnection;
    generateUUID = dbModule.generateUUID;
}

export class NFTService {
    // Generate NFT metadata based on challenge and result
    static generateNFTMetadata(
        challenge: Challenge,
        result: ChallengeResult,
        templateName: string = 'Marathon'
    ): NFTMetadata {
        const achievementText = {
            [AchievementLevel.GOLD]: result.resultData.isCompleted ? 'Goal Achieved' : 'Challenge Completed',
            [AchievementLevel.SILVER]: 'Marathon Completed',
            [AchievementLevel.BRONZE]: 'Marathon Challenged',
        };

        const medalEmoji = {
            [AchievementLevel.GOLD]: '🥇',
            [AchievementLevel.SILVER]: '🥈',
            [AchievementLevel.BRONZE]: '🥉',
        };

        const formatTime = (seconds: number): string => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };

        const getGoalText = (goalType: string, goalDetails: any): string => {
            switch (goalType) {
                case 'completion':
                    return 'Complete the race';
                case 'sub4':
                    return 'Sub 4:00:00';
                case 'sub3_5':
                    return 'Sub 3:30:00';
                case 'sub3':
                    return 'Sub 3:00:00';
                case 'custom':
                    return goalDetails?.targetTime ? `Sub ${formatTime(goalDetails.targetTime)}` : 'Custom Goal';
                default:
                    return 'Marathon Challenge';
            }
        };

        const name = `${medalEmoji[result.achievementLevel]} ${challenge.title} - ${achievementText[result.achievementLevel]}`;

        let description = `Marathon Challenge Protocol NFT\n\n`;
        description += `Event: ${challenge.title}\n`;
        description += `Date: ${new Date(challenge.targetDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}\n`;
        description += `Goal: ${getGoalText(challenge.goalType, challenge.goalDetails)}\n`;

        if (result.resultData.isCompleted && result.resultData.actualTime) {
            description += `Result: ${formatTime(result.resultData.actualTime)}\n`;
        } else if (!result.resultData.isCompleted) {
            description += `Status: Did Not Finish (DNF)\n`;
        }

        description += `Achievement: ${achievementText[result.achievementLevel]}\n\n`;
        description += `This NFT represents a marathon challenge completed through the Marathon Challenge Protocol - `;
        description += `a system for declaring goals, recording results, and celebrating achievements.`;

        const attributes = [
            {
                trait_type: 'Challenge Type',
                value: templateName,
            },
            {
                trait_type: 'Event',
                value: challenge.title,
            },
            {
                trait_type: 'Goal Type',
                value: challenge.goalType.toUpperCase(),
            },
            {
                trait_type: 'Achievement Level',
                value: result.achievementLevel.toUpperCase(),
            },
            {
                trait_type: 'Year',
                value: new Date(challenge.targetDate).getFullYear(),
            },
            {
                trait_type: 'Month',
                value: new Date(challenge.targetDate).toLocaleDateString('en-US', { month: 'long' }),
            },
            {
                trait_type: 'Completion Status',
                value: result.resultData.isCompleted ? 'Completed' : 'DNF',
            },
        ];

        if (result.resultData.isCompleted && result.resultData.actualTime) {
            const timeInHours = result.resultData.actualTime / 3600;
            attributes.push({
                trait_type: 'Finish Time (Hours)',
                value: Math.round(timeInHours * 100) / 100,
            });

            // Add time category
            if (result.resultData.actualTime <= 10800) { // Sub 3
                attributes.push({ trait_type: 'Time Category', value: 'Elite (Sub 3:00)' });
            } else if (result.resultData.actualTime <= 12600) { // Sub 3:30
                attributes.push({ trait_type: 'Time Category', value: 'Advanced (Sub 3:30)' });
            } else if (result.resultData.actualTime <= 14400) { // Sub 4
                attributes.push({ trait_type: 'Time Category', value: 'Intermediate (Sub 4:00)' });
            } else if (result.resultData.actualTime <= 18000) { // Sub 5
                attributes.push({ trait_type: 'Time Category', value: 'Recreational (Sub 5:00)' });
            } else {
                attributes.push({ trait_type: 'Time Category', value: 'Finisher (5:00+)' });
            }
        }

        if (result.isAchieved) {
            attributes.push({
                trait_type: 'Goal Achievement',
                value: 'Achieved',
            });
        }

        return {
            name,
            description,
            image: '', // Will be set when image is generated
            attributes: attributes.reduce((acc, attr) => {
                acc[attr.trait_type.toLowerCase().replace(/\s+/g, '_')] = attr.value;
                return acc;
            }, {} as any),
        };
    }

    // Generate NFT image URL (placeholder for now)
    static generateNFTImageUrl(
        challengeId: string,
        achievementLevel: AchievementLevel,
        challengeTitle: string
    ): string {
        // In a real implementation, this would generate or retrieve an actual NFT image
        // For now, return a placeholder that indicates the medal type
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return `${baseUrl}/api/nft/image/${challengeId}?level=${achievementLevel}`;
    }

    // Create NFT record
    static async createNFTRecord(
        challengeId: string,
        result: ChallengeResult,
        challenge: Challenge,
        templateName: string = 'Marathon'
    ): Promise<NFTRecord> {
        // Use mock data if database is not configured
        if (process.env.NODE_ENV === 'development' && !process.env.DB_HOST) {
            return this.createMockNFTRecord(challengeId, result, challenge, templateName);
        }

        const connection = await getConnection();

        // Check if NFT already exists for this challenge
        const [existingNFTs] = await connection.execute(
            'SELECT id FROM nft_records WHERE challenge_id = ?',
            [challengeId]
        );

        if (Array.isArray(existingNFTs) && existingNFTs.length > 0) {
            throw new Error('NFT already exists for this challenge');
        }

        // Generate metadata
        const metadata = this.generateNFTMetadata(challenge, result, templateName);

        // Generate image URL
        const imageUrl = this.generateNFTImageUrl(challengeId, result.achievementLevel, challenge.title);
        metadata.image = imageUrl;

        // Generate token ID (in real implementation, this would come from blockchain)
        const tokenId = `MCP-${Date.now()}-${challengeId.slice(-8)}`;

        const nftId = generateUUID();
        const now = new Date();

        await connection.execute(
            `INSERT INTO nft_records 
       (id, challenge_id, token_id, contract_address, metadata, image_url, minted_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                nftId,
                challengeId,
                tokenId,
                process.env.NFT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
                JSON.stringify(metadata),
                imageUrl,
                now,
            ]
        );

        return {
            id: nftId,
            challengeId,
            tokenId,
            contractAddress: process.env.NFT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
            metadata,
            imageUrl,
            mintedAt: now,
        };
    }

    // Create mock NFT record for development
    private static createMockNFTRecord(
        challengeId: string,
        result: ChallengeResult,
        challenge: Challenge,
        templateName: string
    ): NFTRecord {
        const metadata = this.generateNFTMetadata(challenge, result, templateName);
        const imageUrl = this.generateNFTImageUrl(challengeId, result.achievementLevel, challenge.title);
        metadata.image = imageUrl;

        const tokenId = `MCP-MOCK-${Date.now()}-${challengeId.slice(-8)}`;

        return {
            id: `mock-nft-${Date.now()}`,
            challengeId,
            tokenId,
            contractAddress: '0x0000000000000000000000000000000000000000',
            metadata,
            imageUrl,
            mintedAt: new Date(),
        };
    }

    // Get NFT by challenge ID
    static async getNFTByChallengeId(challengeId: string): Promise<NFTRecord | null> {
        // Use mock data if database is not configured
        if (process.env.NODE_ENV === 'development' && !process.env.DB_HOST) {
            return null; // No mock NFTs for now
        }

        const connection = await getConnection();

        const [nfts] = await connection.execute(
            'SELECT * FROM nft_records WHERE challenge_id = ?',
            [challengeId]
        );

        if (Array.isArray(nfts) && nfts.length > 0) {
            const nft = nfts[0] as any;
            return {
                id: nft.id,
                challengeId: nft.challenge_id,
                tokenId: nft.token_id,
                contractAddress: nft.contract_address,
                metadata: JSON.parse(nft.metadata),
                imageUrl: nft.image_url,
                mintedAt: nft.minted_at,
            };
        }

        return null;
    }

    // Get all NFTs for a user
    static async getNFTsByUserId(userId: string): Promise<NFTRecord[]> {
        // Use mock data if database is not configured
        if (process.env.NODE_ENV === 'development' && !process.env.DB_HOST) {
            return []; // No mock NFTs for now
        }

        const connection = await getConnection();

        const [nfts] = await connection.execute(
            `SELECT nr.* FROM nft_records nr
       JOIN challenges c ON nr.challenge_id = c.id
       WHERE c.user_id = ?
       ORDER BY nr.minted_at DESC`,
            [userId]
        );

        return (nfts as any[]).map(nft => ({
            id: nft.id,
            challengeId: nft.challenge_id,
            tokenId: nft.token_id,
            contractAddress: nft.contract_address,
            metadata: JSON.parse(nft.metadata),
            imageUrl: nft.image_url,
            mintedAt: nft.minted_at,
        }));
    }

    // Update NFT metadata
    static async updateNFTMetadata(
        nftId: string,
        metadata: NFTMetadata
    ): Promise<NFTRecord | null> {
        // Use mock data if database is not configured
        if (process.env.NODE_ENV === 'development' && !process.env.DB_HOST) {
            throw new Error('Update not supported in mock mode');
        }

        const connection = await getConnection();

        await connection.execute(
            'UPDATE nft_records SET metadata = ? WHERE id = ?',
            [JSON.stringify(metadata), nftId]
        );

        return this.getNFTById(nftId);
    }

    // Get NFT by ID
    static async getNFTById(nftId: string): Promise<NFTRecord | null> {
        // Use mock data if database is not configured
        if (process.env.NODE_ENV === 'development' && !process.env.DB_HOST) {
            return null;
        }

        const connection = await getConnection();

        const [nfts] = await connection.execute(
            'SELECT * FROM nft_records WHERE id = ?',
            [nftId]
        );

        if (Array.isArray(nfts) && nfts.length > 0) {
            const nft = nfts[0] as any;
            return {
                id: nft.id,
                challengeId: nft.challenge_id,
                tokenId: nft.token_id,
                contractAddress: nft.contract_address,
                metadata: JSON.parse(nft.metadata),
                imageUrl: nft.image_url,
                mintedAt: nft.minted_at,
            };
        }

        return null;
    }
}