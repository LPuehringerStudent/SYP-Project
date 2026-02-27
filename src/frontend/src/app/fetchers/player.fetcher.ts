import { PlayerRow as Player } from '../../../../shared/model';

const API_BASE_URL = '/api';

export type { Player };

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
 */
export async function getAllPlayers(): Promise<Player[]> {
  const response = await fetch(`${API_BASE_URL}/players`);

  if (!response.ok) {
    let errorMessage = `Failed to fetch players: ${response.status}`;
    try {
      const errorData = await response.json() as ApiError;
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return await response.json() as Player[];
}

/**
 * Fetches a single player by their ID.
 */
export async function getPlayerById(id: number): Promise<Player> {
  const response = await fetch(`${API_BASE_URL}/players/${id}`);

  if (!response.ok) {
    let errorMessage = `Failed to fetch player ${id}: ${response.status}`;
    try {
      const errorData = await response.json() as ApiError;
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return await response.json() as Player;
}

/**
 * Creates a new player.
 */
export async function createPlayer(
  username: string,
  password?: string,
  email?: string,
  coins?: number,
  lootboxCount?: number
): Promise<CreatePlayerResponse> {
  const body: { username: string; password?: string; email?: string; coins?: number; lootboxCount?: number } = { username };

  if (password !== undefined) body.password = password;
  if (email !== undefined) body.email = email;
  if (coins !== undefined) body.coins = coins;
  if (lootboxCount !== undefined) body.lootboxCount = lootboxCount;

  const response = await fetch(`${API_BASE_URL}/players`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create player: ${response.status}`;
    try {
      const errorData = await response.json() as ApiError;
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return await response.json() as CreatePlayerResponse;
}

/**
 * Updates a player's coin balance.
 */
export async function updatePlayerCoins(id: number, coins: number): Promise<SuccessMessage> {
  const response = await fetch(`${API_BASE_URL}/players/${id}/coins`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ coins }),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update coins: ${response.status}`;
    try {
      const errorData = await response.json() as ApiError;
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return await response.json() as SuccessMessage;
}

/**
 * Updates a player's lootbox count.
 */
export async function updatePlayerLootboxCount(id: number, lootboxCount: number): Promise<SuccessMessage> {
  const response = await fetch(`${API_BASE_URL}/players/${id}/lootboxes`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lootboxCount }),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update lootbox count: ${response.status}`;
    try {
      const errorData = await response.json() as ApiError;
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return await response.json() as SuccessMessage;
}

/**
 * Deletes a player from the system.
 */
export async function deletePlayer(id: number): Promise<SuccessMessage> {
  const response = await fetch(`${API_BASE_URL}/players/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete player: ${response.status}`;
    try {
      const errorData = await response.json() as ApiError;
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return await response.json() as SuccessMessage;
}
