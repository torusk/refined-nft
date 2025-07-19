// 日本語テキスト定数
export const TEXTS = {
  nav: {
    home: 'ホーム',
    quest: 'クエスト',
    claim: 'クレーム'
  },
  home: {
    title: 'シンプルで洗練された NFT インターフェース',
    subtitle: 'Henkaku メンバーシップ NFT の管理、クエストの実行、トークンのクレームを美しく直感的なインターフェースで体験してください。',
    stats: {
      totalSupply: '総発行数',
      holders: 'ホルダー数',
      completedQuests: '完了クエスト'
    }
  },
  quest: {
    title: 'クエスト',
    description: 'NFT のメタデータを更新するクエスト機能。キーワードを入力してあなたの NFT をカスタマイズしましょう。',
    startButton: 'クエストを開始'
  },
  claim: {
    title: 'クレーム',
    description: '$REFINED トークンをクレームする機能。あなたの活動に対する報酬を受け取りましょう。',
    startButton: 'クレームを開始'
  }
} as const;