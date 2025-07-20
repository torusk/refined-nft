// 🔒 セキュリティ設定 - サーバーサイドのみ
if (typeof window !== 'undefined') {
    throw new Error('Security config should only be used on server side');
}

// 環境変数の検証
function validateEnvVar(name: string, value: string | undefined): string {
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

// セキュリティ設定
export const SecurityConfig = {
    // JWT設定
    jwt: {
        secret: validateEnvVar('JWT_SECRET', process.env.JWT_SECRET),
        expiresIn: '7d',
    },

    // ブロックチェーン設定（秘匿情報）
    blockchain: {
        privateKey: validateEnvVar('MINTING_PRIVATE_KEY', process.env.MINTING_PRIVATE_KEY),
        alchemyApiKey: validateEnvVar('ALCHEMY_API_KEY', process.env.ALCHEMY_API_KEY),
        rpcUrl: validateEnvVar('ALCHEMY_RPC_URL', process.env.ALCHEMY_RPC_URL),
    },

    // IPFS設定（秘匿情報）
    ipfs: {
        pinataApiKey: validateEnvVar('PINATA_API_KEY', process.env.PINATA_API_KEY),
        pinataSecretKey: validateEnvVar('PINATA_SECRET_API_KEY', process.env.PINATA_SECRET_API_KEY),
    },

    // データベース設定（秘匿情報）
    database: {
        host: validateEnvVar('DB_HOST', process.env.DB_HOST),
        user: validateEnvVar('DB_USER', process.env.DB_USER),
        password: validateEnvVar('DB_PASSWORD', process.env.DB_PASSWORD),
        name: validateEnvVar('DB_NAME', process.env.DB_NAME),
    },
};

// セキュリティチェック
export function performSecurityCheck(): void {
    const checks = [
        {
            name: 'JWT Secret Length',
            check: () => SecurityConfig.jwt.secret.length >= 32,
            message: 'JWT secret must be at least 32 characters long',
        },
        {
            name: 'Private Key Format',
            check: () => SecurityConfig.blockchain.privateKey.startsWith('0x'),
            message: 'Private key must start with 0x',
        },
        {
            name: 'Environment',
            check: () => process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://'),
            message: 'Production environment must use HTTPS',
        },
    ];

    const failedChecks = checks.filter(check => !check.check());

    if (failedChecks.length > 0) {
        console.error('🚨 Security checks failed:');
        failedChecks.forEach(check => {
            console.error(`❌ ${check.name}: ${check.message}`);
        });
        throw new Error('Security validation failed');
    }

    console.log('✅ All security checks passed');
}

// 開発環境でのみセキュリティチェックを実行
if (process.env.NODE_ENV === 'development') {
    try {
        performSecurityCheck();
    } catch (error) {
        console.warn('⚠️ Security check skipped in development mode');
    }
}