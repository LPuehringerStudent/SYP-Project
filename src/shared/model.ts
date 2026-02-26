export enum Rarity {
    COMMON = "common",
    RARE = "rare",
    EPIC = "epic",
    LEGENDARY = "legendary",
    LIMITED = "limited"
}

// Player
export interface Player {
    username: string;
    password: string;
    email: string;
    coins: number;
    lootboxCount: number;
    isAdmin: boolean;
    joinedAt: Date;
}

export interface PlayerRow extends Player {
    playerId: number;
}

// StoveType
export interface StoveType {
    name: string;
    imageUrl: string;
    rarity: Rarity;
    lootboxWeight: number;
}

export interface StoveTypeRow extends StoveType {
    typeId: number;
}

// Stove
export interface Stove {
    typeId: number;
    currentOwnerId: number;
    mintedAt: Date;
}

export interface StoveRow extends Stove {
    stoveId: number;
}

// LootboxType
export interface LootboxType {
    name: string;
    description: string | null;
    costCoins: number;
    costFree: boolean;
    dailyLimit: number | null;
    isAvailable: boolean;
}

export interface LootboxTypeRow extends LootboxType {
    lootboxTypeId: number;
}

// Lootbox
export interface Lootbox {
    lootboxTypeId: number;
    playerId: number;
    openedAt: Date;
    acquiredHow: "free" | "purchase" | "reward";
}

export interface LootboxRow extends Lootbox {
    lootboxId: number;
}

// LootboxDrop
export interface LootboxDrop {
    lootboxId: number;
    stoveId: number;
}

export interface LootboxDropRow extends LootboxDrop {
    dropId: number;
}

// Listing
export interface Listing {
    sellerId: number;
    stoveId: number;
    price: number;
    listedAt: Date;
    status: "active" | "cancelled" | "sold";
}

export interface ListingRow extends Listing {
    listingId: number;
}

// Trade
export interface Trade {
    listingId: number;
    buyerId: number;
    executedAt: Date;
}

export interface TradeRow extends Trade {
    tradeId: number;
}

// MiniGameSession
export interface MiniGameSession {
    playerId: number;
    gameType: string;
    result: string;
    coinPayout: number;
    finishedAt: Date;
}

export interface MiniGameSessionRow extends MiniGameSession {
    sessionId: number;
}

// PriceHistory
export interface PriceHistory {
    typeId: number;
    salePrice: number;
    saleDate: Date;
}

export interface PriceHistoryRow extends PriceHistory {
    historyId: number;
}

// Ownership
export interface Ownership {
    stoveId: number;
    playerId: number;
    acquiredAt: Date;
    acquiredHow: "lootbox" | "trade" | "mini-game";
}

export interface OwnershipRow extends Ownership {
    ownershipId: number;
}

// ChatMessage
export interface ChatMessage {
    senderId: number;
    receiverId: number | null;
    content: string;
    sentAt: Date;
    isRead: boolean;
}

export interface ChatMessageRow extends ChatMessage {
    messageId: number;
}
