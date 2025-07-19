# Marathon Challenge Protocol - ER図詳細

## データベース構造図

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    USERS                                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ PK  id                    VARCHAR(36)    # UUID                                     │
│ UK  wallet_address        VARCHAR(42)    # 0x... ウォレットアドレス                    │
│     display_name          VARCHAR(100)   # 表示名                                    │
│     bio                   TEXT           # 自己紹介                                  │
│     created_at            TIMESTAMP      # 作成日時                                  │
│     updated_at            TIMESTAMP      # 更新日時                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           │ 1:N
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CHALLENGE_TEMPLATES                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ PK  id                    VARCHAR(36)    # UUID                                     │
│     name                  VARCHAR(50)    # テンプレート名 (Marathon, Reading...)      │
│     description           TEXT           # 説明                                      │
│     goal_types            JSON           # 利用可能な目標タイプ                        │
│     validation_rules      JSON           # 検証ルール                                │
│     is_active             BOOLEAN        # 有効フラグ                                │
│     created_at            TIMESTAMP      # 作成日時                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           │ 1:N
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                 CHALLENGES                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ PK  id                    VARCHAR(36)    # UUID                                     │
│ FK  user_id               VARCHAR(36)    # ユーザーID                                │
│ FK  template_id           VARCHAR(36)    # テンプレートID                             │
│     title                 VARCHAR(200)   # チャレンジタイトル                         │
│     goal_type             VARCHAR(50)    # 目標タイプ (completion, sub4, sub3...)    │
│     goal_details          JSON           # 目標詳細 {targetTime: 14400}             │
│     target_date           DATE           # 実施予定日                                │
│     status                ENUM           # declared, in_progress, completed...      │
│     created_at            TIMESTAMP      # 作成日時                                  │
│     updated_at            TIMESTAMP      # 更新日時                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           │ 1:1
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CHALLENGE_RESULTS                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ PK  id                    VARCHAR(36)    # UUID                                     │
│ FK  challenge_id          VARCHAR(36)    # チャレンジID                              │
│     result_data           JSON           # 結果データ {actualTime: 13500, ...}       │
│     evidence_hash         VARCHAR(64)    # 証拠画像のハッシュ                         │
│     evidence_url          VARCHAR(500)   # 証拠画像のURL (IPFS)                      │
│     is_achieved           BOOLEAN        # 目標達成フラグ                            │
│     achievement_level     ENUM           # gold, silver, bronze                     │
│     submitted_at          TIMESTAMP      # 提出日時                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           │ 1:1
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                NFT_RECORDS                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ PK  id                    VARCHAR(36)    # UUID                                     │
│ FK  challenge_id          VARCHAR(36)    # チャレンジID                              │
│     token_id              VARCHAR(100)   # NFTトークンID                             │
│     contract_address      VARCHAR(42)    # コントラクトアドレス                       │
│     metadata              JSON           # NFTメタデータ                             │
│     image_url             VARCHAR(500)   # NFT画像URL                               │
│     minted_at             TIMESTAMP      # 発行日時                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```