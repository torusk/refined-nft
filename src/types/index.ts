// NFT メタデータの型定義
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
}

// ユーザー状態の型定義
export interface UserState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  nftBalance: bigint;
  tokenId: bigint | null;
  claimableAmount: bigint;
}

// クエスト状態の型定義
export interface QuestState {
  keyword: string;
  isSubmitted: boolean;
  isGeneratingMetadata: boolean;
  isUpdatingNFT: boolean;
  newTokenURI: string | null;
}