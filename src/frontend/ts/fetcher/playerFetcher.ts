import { PlayerRow as Player } from "../../../shared/model";

const API_BASE_URL = "http://localhost:3000/api";

export { Player };

/** Error response from the API */
export interface ApiError {
    error: string;
}

/** Response for creating a player */
export interface CreatePlayerResponse {
    playerId: number;
    username: string;
}

/** Generic success message response */
export interface SuccessMessage {
    message: string;
}

/**
 * Fetches all players from the API.
 * @returns Promise resolving to an array of Player objects
 * @throws Error if the request fails
 */
export async function getAllPlayers(): Promise<Player[]> {
    const response = await fetch(`${API_BASE_URL}/players`);
    
    if (!response.ok) {
        const errorData = await response.json() as ApiError;
        throw new Error(errorData.error || `Failed to fetch players: ${response.status}`);
    }
    
    return await response.json() as Player[];
}

/**
 * Fetches a single player by their ID.
 * @param id - The player's unique ID
 * @returns Promise resolving to the Player object
 * @throws Error if the player is not found or request fails
 */
export async function getPlayerById(id: number): Promise<Player> {
    const response = await fetch(`${API_BASE_URL}/players/${id}`);
    
    if (!response.ok) {
        const errorData = await response.json() as ApiError;
        throw new Error(errorData.error || `Failed to fetch player ${id}: ${response.status}`);
    }
    
    return await response.json() as Player;
}

/**
 * Creates a new player.
 * @param username - The unique username for the player
 * @param coins - Optional initial coin amount (default: 1000)
 * @param lootboxCount - Optional initial lootbox count (default: 10)
 * @returns Promise resolving to the created player's ID and username
 * @throws Error if username is taken or request fails
 */
export async function createPlayer(
    username: string,
    coins?: number,
    lootboxCount?: number
): Promise<CreatePlayerResponse> {
    const body: { username: string; coins?: number; lootboxCount?: number } = { username };
    
    if (coins !== undefined) body.coins = coins;
    if (lootboxCount !== undefined) body.lootboxCount = lootboxCount;
    
    const response = await fetch(`${API_BASE_URL}/players`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    
    if (!response.ok) {
        const errorData = await response.json() as ApiError;
        throw new Error(errorData.error || `Failed to create player: ${response.status}`);
    }
    
    return await response.json() as CreatePlayerResponse;
}

/**
 * Updates a player's coin balance.
 * @param id - The player's unique ID
 * @param coins - The new coin amount (must be non-negative)
 * @returns Promise resolving to success message
 * @throws Error if player not found or request fails
 */
export async function updatePlayerCoins(id: number, coins: number): Promise<SuccessMessage> {
    const response = await fetch(`${API_BASE_URL}/players/${id}/coins`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ coins }),
    });
    
    if (!response.ok) {
        const errorData = await response.json() as ApiError;
        throw new Error(errorData.error || `Failed to update coins: ${response.status}`);
    }
    
    return await response.json() as SuccessMessage;
}

/**
 * Updates a player's lootbox count.
 * @param id - The player's unique ID
 * @param lootboxCount - The new lootbox count (must be non-negative)
 * @returns Promise resolving to success message
 * @throws Error if player not found or request fails
 */
export async function updatePlayerLootboxCount(id: number, lootboxCount: number): Promise<SuccessMessage> {
    const response = await fetch(`${API_BASE_URL}/players/${id}/lootboxes`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ lootboxCount }),
    });
    
    if (!response.ok) {
        const errorData = await response.json() as ApiError;
        throw new Error(errorData.error || `Failed to update lootbox count: ${response.status}`);
    }
    
    return await response.json() as SuccessMessage;
}

/**
 * Deletes a player from the system.
 * @param id - The player's unique ID to delete
 * @returns Promise resolving to success message
 * @throws Error if player not found or request fails
 */
export async function deletePlayer(id: number): Promise<SuccessMessage> {
    const response = await fetch(`${API_BASE_URL}/players/${id}`, {
        method: "DELETE",
    });
    
    if (!response.ok) {
        const errorData = await response.json() as ApiError;
        throw new Error(errorData.error || `Failed to delete player: ${response.status}`);
    }
    
    return await response.json() as SuccessMessage;
}
