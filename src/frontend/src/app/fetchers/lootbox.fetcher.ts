import {
  LootboxRow as Lootbox,
  LootboxTypeRow as LootboxType,
  LootboxDropRow as LootboxDrop,
} from '../../../../shared/model';

const API_BASE_URL = '/api';

export type { Lootbox, LootboxType, LootboxDrop };

/** Error response from the API */
export interface ApiError {
  error: string;
}

/** Response for creating a lootbox */
export interface CreateLootboxResponse {
  lootboxId: number;
  message: string;
}

/** Response for creating a lootbox drop */
export interface CreateLootboxDropResponse {
  dropId: number;
  message: string;
}

/** Generic success message response */
export interface SuccessMessage {
  message: string;
}

/**
 * Fetches all lootboxes from the API.
 */
export async function getAllLootboxes(): Promise<Lootbox[]> {
  const response = await fetch(`${API_BASE_URL}/lootboxes`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch lootboxes: ${response.status}`);
  }

  return await response.json() as Lootbox[];
}

/**
 * Fetches a single lootbox by its ID.
 */
export async function getLootboxById(id: number): Promise<Lootbox> {
  const response = await fetch(`${API_BASE_URL}/lootboxes/${id}`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch lootbox ${id}: ${response.status}`);
  }

  return await response.json() as Lootbox;
}

/**
 * Fetches all lootboxes opened by a specific player.
 */
export async function getLootboxesByPlayerId(playerId: number): Promise<Lootbox[]> {
  const response = await fetch(`${API_BASE_URL}/players/${playerId}/lootboxes`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch lootboxes for player ${playerId}: ${response.status}`);
  }

  return await response.json() as Lootbox[];
}

/**
 * Creates a new lootbox (records a lootbox opening).
 */
export async function createLootbox(
  lootboxTypeId: number,
  playerId: number,
  acquiredHow: 'free' | 'purchase' | 'reward'
): Promise<CreateLootboxResponse> {
  const response = await fetch(`${API_BASE_URL}/lootboxes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lootboxTypeId, playerId, acquiredHow }),
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to create lootbox: ${response.status}`);
  }

  return await response.json() as CreateLootboxResponse;
}

/**
 * Deletes a lootbox from the system.
 */
export async function deleteLootbox(id: number): Promise<SuccessMessage> {
  const response = await fetch(`${API_BASE_URL}/lootboxes/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to delete lootbox: ${response.status}`);
  }

  return await response.json() as SuccessMessage;
}

// LootboxType functions

/**
 * Fetches all lootbox types.
 */
export async function getAllLootboxTypes(): Promise<LootboxType[]> {
  const response = await fetch(`${API_BASE_URL}/lootbox-types`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch lootbox types: ${response.status}`);
  }

  return await response.json() as LootboxType[];
}

/**
 * Fetches all available lootbox types.
 */
export async function getAvailableLootboxTypes(): Promise<LootboxType[]> {
  const response = await fetch(`${API_BASE_URL}/lootbox-types/available`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch available lootbox types: ${response.status}`);
  }

  return await response.json() as LootboxType[];
}

/**
 * Fetches a lootbox type by its ID.
 */
export async function getLootboxTypeById(id: number): Promise<LootboxType> {
  const response = await fetch(`${API_BASE_URL}/lootbox-types/${id}`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch lootbox type ${id}: ${response.status}`);
  }

  return await response.json() as LootboxType;
}

// LootboxDrop functions

/**
 * Fetches all drops for a specific lootbox.
 */
export async function getDropsByLootboxId(lootboxId: number): Promise<LootboxDrop[]> {
  const response = await fetch(`${API_BASE_URL}/lootboxes/${lootboxId}/drops`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch drops for lootbox ${lootboxId}: ${response.status}`);
  }

  return await response.json() as LootboxDrop[];
}

/**
 * Creates a new lootbox drop (records a stove drop from a lootbox).
 */
export async function createLootboxDrop(
  lootboxId: number,
  stoveId: number
): Promise<CreateLootboxDropResponse> {
  const response = await fetch(`${API_BASE_URL}/lootbox-drops`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lootboxId, stoveId }),
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to create lootbox drop: ${response.status}`);
  }

  return await response.json() as CreateLootboxDropResponse;
}
