# Refined NFT Interface

このプロジェクトは [Kiro](https://kiro.ai) を使用して開発されました。
Kiro は AI アシスタントによる効率的な開発を可能にするツールです。
シンプルで洗練された NFT インターフェース。美しく直感的なデザインで、NFT の管理、クエストの実行、トークンのクレームを体験できます。

## 🌟 特徴

- **モダンなデザイン**: Tailwind CSS を使用した美しく洗練されたUI
- **レスポンシブ対応**: デスクトップ・モバイル両対応
- **直感的な操作**: ユーザーフレンドリーなインターフェース
- **アニメーション**: 滑らかなトランジションとマイクロインタラクション
- **日本語対応**: 完全日本語ローカライゼーション

## 🚀 主な機能

### 🏠 ホーム
- プロジェクト概要の表示
- 主要機能への直感的なナビゲーション

### 🎯 クエスト
- 管理者が設定した合言葉システム
- 正解者に $REFINED トークンを配布
- ステップバイステップの進行表示
- リアルタイムフィードバック

### 💰 クレーム
- $REFINED トークンの残高表示
- ワンクリックでのトークンクレーム
- クレーム履歴の確認
- 詳細な取引情報

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 15, React 18, TypeScript
- **スタイリング**: Tailwind CSS
- **UI コンポーネント**: カスタム設計
- **アニメーション**: CSS Transitions & Animations
- **開発環境**: ESLint, Prettier

## 📦 インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/refined-nft-interface.git
cd refined-nft-interface

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local
# .env.local を編集して必要な値を設定

# 開発サーバーを起動
npm run dev
```

## 🔧 環境変数

`.env.example` を参考に以下の環境変数を設定してください：

- `NEXT_PUBLIC_CHAIN_ID`: 使用するブロックチェーンのチェーンID
- `NEXT_PUBLIC_RPC_URL`: RPC エンドポイント
- `QUEST_PASSPHRASE`: クエスト用の合言葉
- `QUEST_REWARD_AMOUNT`: クエスト報酬額

## 🎮 使用方法

### 管理者向け - 合言葉設定

1. `.env.local` の `QUEST_PASSPHRASE` を設定
2. `QUEST_REWARD_AMOUNT` で報酬額を調整
3. アプリケーションを再起動

### ユーザー向け

1. **ホームページ**: 機能概要を確認
2. **クエスト**: 合言葉を入力してトークンを獲得
3. **クレーム**: 獲得したトークンをクレーム

## 🏗️ プロジェクト構造

```
src/
├── app/                 # Next.js App Router
│   ├── page.tsx        # ホームページ
│   ├── quest/          # クエストページ
│   └── claim/          # クレームページ
├── components/         # 再利用可能コンポーネント
│   ├── ui/            # 基本UIコンポーネント
│   └── layout/        # レイアウトコンポーネント
├── hooks/             # カスタムフック
├── lib/               # ユーティリティ
└── types/             # 型定義
```

## 🎨 デザインシステム

- **カラーパレット**: Blue, Green, Gray ベース
- **タイポグラフィ**: Inter フォント
- **コンポーネント**: Card, Button, Input など
- **アニメーション**: Fade-in, Slide-up, Bounce-in

## 🔮 今後の予定

- [ ] ブロックチェーン統合 (Foundry)
- [ ] ウォレット接続機能
- [ ] 実際のトークン配布機能
- [ ] 管理者ダッシュボード
- [ ] 多言語対応拡張

## 🤝 開発について

このプロジェクトは [Kiro](https://kiro.ai) を使用して開発されました。
Kiro は AI アシスタントによる効率的な開発を可能にするツールです。

## 📄 ライセンス

MIT License

## 🙋‍♂️ サポート

質問や問題がある場合は、GitHub Issues でお気軽にお問い合わせください。

---

**Refined NFT Interface** - シンプルで洗練された NFT 体験を提供します。