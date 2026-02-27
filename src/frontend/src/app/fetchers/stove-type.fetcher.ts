import { StoveTypeRow as StoveType, Rarity } from '../../../../shared/model';

const API_BASE_URL = '/api';

export type { StoveType };
export { Rarity };

/** Error response from the API */
export interface ApiError {
  error: string;
}

/** Response for creating a stove type */
export interface CreateStoveTypeResponse {
  typeId: number;
  message: string;
}

/** Response for total weight */
export interface TotalWeightResponse {
  totalWeight: number;
}

/** Generic success message response */
export interface SuccessMessage {
  message: string;
}

/**
 * Fetches all stove types from the API.
 */
export async function getAllStoveTypes(): Promise<StoveType[]> {
  const response = await fetch(`${API_BASE_URL}/stove-types`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch stove types: ${response.status}`);
  }

  return await response.json() as StoveType[];
}

/**
 * Fetches a single stove type by its ID.
 */
export async function getStoveTypeById(id: number): Promise<StoveType> {
  const response = await fetch(`${API_BASE_URL}/stove-types/${id}`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch stove type ${id}: ${response.status}`);
  }

  return await response.json() as StoveType;
}

/**
 * Fetches stove types by rarity.
 */
export async function getStoveTypesByRarity(rarity: Rarity): Promise<StoveType[]> {
  const response = await fetch(`${API_BASE_URL}/stove-types/rarity/${rarity}`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch stove types by rarity ${rarity}: ${response.status}`);
  }

  return await response.json() as StoveType[];
}

/**
 * Creates a new stove type.
 */
export async function createStoveType(
  name: string,
  imageUrl: string,
  rarity: Rarity,
  lootboxWeight: number
): Promise<CreateStoveTypeResponse> {
  const response = await fetch(`${API_BASE_URL}/stove-types`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, imageUrl, rarity, lootboxWeight }),
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to create stove type: ${response.status}`);
  }

  return await response.json() as CreateStoveTypeResponse;
}

/**
 * Updates a stove type's lootbox weight.
 */
export async function updateStoveTypeWeight(id: number, lootboxWeight: number): Promise<SuccessMessage> {
  const response = await fetch(`${API_BASE_URL}/stove-types/${id}/weight`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lootboxWeight }),
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to update stove type weight: ${response.status}`);
  }

  return await response.json() as SuccessMessage;
}

/**
 * Updates a stove type's image URL.
 */
export async function updateStoveTypeImage(id: number, imageUrl: string): Promise<SuccessMessage> {
  const response = await fetch(`${API_BASE_URL}/stove-types/${id}/image`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to update stove type image: ${response.status}`);
  }

  return await response.json() as SuccessMessage;
}

/**
 * Deletes a stove type from the system.
 */
export async function deleteStoveType(id: number): Promise<SuccessMessage> {
  const response = await fetch(`${API_BASE_URL}/stove-types/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to delete stove type: ${response.status}`);
  }

  return await response.json() as SuccessMessage;
}

/**
 * Gets the total lootbox weight of all stove types.
 */
export async function getTotalLootboxWeight(): Promise<TotalWeightResponse> {
  const response = await fetch(`${API_BASE_URL}/stove-types/weight/total`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch total lootbox weight: ${response.status}`);
  }

  return await response.json() as TotalWeightResponse;
}
