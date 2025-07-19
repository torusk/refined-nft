-- Marathon Challenge Protocol Database Schema

-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Challenge Templates table
CREATE TABLE challenge_templates (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    goal_types JSON NOT NULL,
    validation_rules JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Challenges table
CREATE TABLE challenges (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    template_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    goal_type VARCHAR(50) NOT NULL,
    goal_details JSON,
    target_date DATE NOT NULL,
    status ENUM('declared', 'in_progress', 'completed', 'cancelled') DEFAULT 'declared',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES challenge_templates(id)
);

-- Challenge Results table
CREATE TABLE challenge_results (
    id VARCHAR(36) PRIMARY KEY,
    challenge_id VARCHAR(36) NOT NULL,
    result_data JSON NOT NULL,
    evidence_hash VARCHAR(64) NOT NULL,
    evidence_url VARCHAR(500) NOT NULL,
    is_achieved BOOLEAN NOT NULL,
    achievement_level ENUM('gold', 'silver', 'bronze') NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

-- NFT Records table
CREATE TABLE nft_records (
    id VARCHAR(36) PRIMARY KEY,
    challenge_id VARCHAR(36) NOT NULL,
    token_id VARCHAR(100) NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    metadata JSON NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    minted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_challenges_user ON challenges(user_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_date ON challenges(target_date);
CREATE INDEX idx_results_challenge ON challenge_results(challenge_id);
CREATE INDEX idx_nft_challenge ON nft_records(challenge_id);

-- Insert initial Marathon template
INSERT INTO challenge_templates (id, name, description, goal_types, validation_rules, is_active) VALUES (
    'marathon-template-001',
    'Marathon',
    'フルマラソン（42.195km）チャレンジテンプレート',
    JSON_ARRAY(
        JSON_OBJECT('id', 'completion', 'name', '完走', 'description', 'とにかく完走することが目標'),
        JSON_OBJECT('id', 'sub4', 'name', 'サブ4', 'description', '4時間以内での完走', 'targetValue', 14400),
        JSON_OBJECT('id', 'sub3_5', 'name', 'サブ3.5', 'description', '3時間30分以内での完走', 'targetValue', 12600),
        JSON_OBJECT('id', 'sub3', 'name', 'サブ3', 'description', '3時間以内での完走', 'targetValue', 10800),
        JSON_OBJECT('id', 'custom', 'name', 'カスタム', 'description', '自分で設定した目標タイム')
    ),
    JSON_ARRAY(
        JSON_OBJECT('field', 'title', 'rule', 'required', 'message', '大会名は必須です'),
        JSON_OBJECT('field', 'targetDate', 'rule', 'future', 'message', '開催日は未来の日付である必要があります')
    ),
    TRUE
);