# 設計書

## 概要

この設計書では、既存の Henkaku メンバーシップ NFT インターフェースの基本構成を参考に、1から新しく構築するシンプルで洗練された Web アプリケーションの設計を定義します。Foundry を使用したスマートコントラクト開発環境を採用し、Home、Quest、Claim の3つの主要機能に焦点を当て、現代的でミニマルなユーザーインターフェースを提供します。既存システムからの移行ではなく、新規プロジェクトとして最適化された構成を採用します。

## アーキテクチャ

### 技術スタック

**フロントエンド:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS (Chakra UI から移行してよりモダンなスタイリング)
- Framer Motion (アニメーション)
- next-intl (多言語対応)

**ブロックチェーン統合:**
- wagmi v2 (最新版)
- viem (ethers.js から移行)
- RainbowKit (ウォレット接続 UI)

**スマートコントラクト開発:**
- Foundry (forge, cast, anvil)
- Solidity ^0.8.20

**開発・テスト:**
- Vitest (Jest から移行)
- Playwright (Cypress から移行)
- ESLint + Prettier

### プロジェクト構造

```
refined-nft-interface/
├── foundry/                    # Foundry プロジェクト
│   ├── src/                   # スマートコントラクト
│   ├── test/                  # コントラクトテスト
│   ├── script/                # デプロイスクリプト
│   └── foundry.toml           # Foundry 設定
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── [locale]/          # 多言語ルーティング
│   │   │   ├── page.tsx       # Home ページ
│   │   │   ├── quest/         # Quest ページ
│   │   │   └── claim/         # Claim ページ
│   │   ├── globals.css        # グローバルスタイル
│   │   └── layout.tsx         # ルートレイアウト
│   ├── components/            # 再利用可能コンポーネント
│   │   ├── ui/               # 基本 UI コンポーネント
│   │   ├── wallet/           # ウォレット関連
│   │   ├── nft/              # NFT 関連
│   │   └── layout/           # レイアウト関連
│   ├── hooks/                # カスタムフック
│   ├── lib/                  # ユーティリティ
│   ├── types/                # 型定義
│   └── constants/            # 定数
├── public/                   # 静的ファイル
├── messages/                 # 多言語メッセージ
└── package.json
```

## コンポーネントとインターフェース

### 1. レイアウトコンポーネント

#### RootLayout
- グローバルナビゲーション
- ウォレット接続状態の管理
- テーマ切り替え（ダーク/ライトモード）
- 言語切り替え（日本語/英語）

#### Navigation
- ミニマルなヘッダーデザイン
- Home、Quest、Claim への直感的なナビゲーション
- モバイルレスポンシブなハンバーガーメニュー

### 2. ウォレット関連コンポーネント

#### WalletConnect
- RainbowKit を使用した美しいウォレット接続 UI
- MetaMask、WalletConnect、Coinbase Wallet 対応
- 接続状態の視覚的フィードバック

#### NetworkSwitcher
- 適切なネットワーク（Polygon/Goerli）への切り替え促進
- エラー状態の優雅な処理

### 3. NFT 関連コンポーネント

#### NFTDisplay
- NFT 画像の美しい表示
- メタデータ情報の整理された表示
- ローディング状態のスケルトン UI

#### NFTStatus
- NFT 所有状況の確認
- トークン ID とメタデータの表示

### 4. ページコンポーネント

#### HomePage
- ヒーローセクション：プロジェクトの概要
- 機能カード：Quest と Claim への誘導
- 統計情報：総発行数、ホルダー数
- CTA ボタン：主要アクションへの誘導

#### QuestPage
- プログレス表示：クエストの進行状況
- インタラクティブフォーム：キーワード入力
- ステップバイステップ UI：メタデータ更新プロセス
- 成功/エラー状態の明確な表示

#### ClaimPage
- 残高表示：クレーム可能なトークン量
- クレームボタン：直感的なアクション
- 取引状況：リアルタイムフィードバック
- 履歴表示：過去のクレーム記録

## データモデル

### NFT メタデータ
```typescript
interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  external_url?: string
}
```

### ユーザー状態
```typescript
interface UserState {
  address: string | null
  chainId: number | null
  isConnected: boolean
  nftBalance: bigint
  tokenId: bigint | null
  claimableAmount: bigint
}
```

### クエスト状態
```typescript
interface QuestState {
  keyword: string
  isSubmitted: boolean
  isGeneratingMetadata: boolean
  isUpdatingNFT: boolean
  newTokenURI: string | null
}
```

## エラーハンドリング

### エラー分類
1. **ネットワークエラー**: 接続問題、RPC エラー
2. **ウォレットエラー**: 接続拒否、署名拒否
3. **コントラクトエラー**: 取引失敗、ガス不足
4. **バリデーションエラー**: 入力値検証

### エラー表示戦略
- Toast 通知：一時的なエラー
- インライン表示：フォームバリデーション
- エラーページ：致命的なエラー
- 再試行機能：回復可能なエラー

### エラーメッセージの多言語対応
```typescript
const errorMessages = {
  ja: {
    wallet_not_connected: 'ウォレットが接続されていません',
    insufficient_gas: 'ガス代が不足しています',
    transaction_failed: '取引が失敗しました'
  },
  en: {
    wallet_not_connected: 'Wallet not connected',
    insufficient_gas: 'Insufficient gas',
    transaction_failed: 'Transaction failed'
  }
}
```

## テスト戦略

### 単体テスト (Vitest)
- カスタムフックのテスト
- ユーティリティ関数のテスト
- コンポーネントの単体テスト

### 統合テスト (Playwright)
- ウォレット接続フロー
- NFT メタデータ更新フロー
- トークンクレームフロー
- 多言語切り替え

### コントラクトテスト (Foundry)
- スマートコントラクトの単体テスト
- ガス最適化テスト
- セキュリティテスト

### テスト環境
- ローカル開発：Anvil (Foundry のローカルノード)
- CI/CD：GitHub Actions
- テストネット：Goerli
- 本番：Polygon

## デザインシステム

### カラーパレット
```css
:root {
  /* Primary Colors */
  --primary-50: #f0f9ff;
  --primary-500: #3b82f6;
  --primary-900: #1e3a8a;
  
  /* Neutral Colors */
  --neutral-50: #f9fafb;
  --neutral-500: #6b7280;
  --neutral-900: #111827;
  
  /* Success/Error */
  --success-500: #10b981;
  --error-500: #ef4444;
}
```

### タイポグラフィ
- フォント：Inter (システムフォント)
- 見出し：font-weight: 600-700
- 本文：font-weight: 400
- レスポンシブサイズ：clamp() 使用

### スペーシング
- 8px グリッドシステム
- コンポーネント間：16px, 24px, 32px
- セクション間：48px, 64px, 96px

### アニメーション
- ページ遷移：Framer Motion
- ホバーエフェクト：transform + transition
- ローディング：スケルトン UI
- 成功/エラー：マイクロインタラクション

## パフォーマンス最適化

### フロントエンド
- Next.js App Router の活用
- 画像最適化：next/image
- コード分割：dynamic import
- キャッシュ戦略：SWR/React Query

### ブロックチェーン
- バッチリクエスト：multicall
- キャッシュ：wagmi の内蔵キャッシュ
- 最適化されたガス使用量

### SEO・アクセシビリティ
- セマンティック HTML
- ARIA ラベル
- キーボードナビゲーション
- スクリーンリーダー対応

## セキュリティ考慮事項

### フロントエンド
- XSS 対策：入力値のサニタイズ
- CSRF 対策：SameSite Cookie
- 環境変数の適切な管理

### スマートコントラクト
- Reentrancy 攻撃対策
- Integer overflow/underflow 対策
- Access control の実装
- 監査ツールの使用

### ウォレット統合
- 署名検証の実装
- 悪意のある取引の防止
- ユーザー確認の強化

## デプロイメント戦略

### 環境構成
- 開発環境：localhost + Anvil
- ステージング：Vercel + Sepolia
- 本番環境：Vercel + Polygon

### CI/CD パイプライン
1. コードプッシュ
2. 自動テスト実行
3. ビルド検証
4. デプロイメント
5. 動作確認

### モニタリング
- エラー追跡：Sentry
- パフォーマンス：Vercel Analytics
- ユーザー行動：Google Analytics