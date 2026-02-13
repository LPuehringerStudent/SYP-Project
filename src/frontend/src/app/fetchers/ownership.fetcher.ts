import { OwnershipRow as Ownership } from '../../../../shared/model';

const API_BASE_URL = '/api';

export type { Ownership };

/** Error response from the API */
export interface ApiError {
  error: string;
}

/** Response for creating an ownership record */
export interface CreateOwnershipResponse {
  ownershipId: number;
  message: string;
}

/** Response for count */
export interface CountResponse {
  count: number;
}

/** Generic success message response */
export interface SuccessMessage {
  message: string;
}

/**
 * Fetches all ownership records from the API.
 */
export async function getAllOwnerships(): Promise<Ownership[]> {
  const response = await fetch(`${API_BASE_URL}/ownerships`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch ownerships: ${response.status}`);
  }

  return await response.json() as Ownership[];
}

/**
 * Fetches a single ownership record by its ID.
 */
export async function getOwnershipById(id: number): Promise<Ownership> {
  const response = await fetch(`${API_BASE_URL}/ownerships/${id}`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch ownership ${id}: ${response.status}`);
  }

  return await response.json() as Ownership;
}

/**
 * Fetches the ownership history for a specific stove.
 */
export async function getOwnershipHistoryByStoveId(stoveId: number): Promise<Ownership[]> {
  const response = await fetch(`${API_BASE_URL}/stoves/${stoveId}/ownership-history`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch ownership history for stove ${stoveId}: ${response.status}`);
  }

  return await response.json() as Ownership[];
}

/**
 * Fetches all ownership records for a specific player.
 */
export async function getOwnershipsByPlayerId(playerId: number): Promise<Ownership[]> {
  const response = await fetch(`${API_BASE_URL}/players/${playerId}/ownerships`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch ownerships for player ${playerId}: ${response.status}`);
  }

  return await response.json() as Ownership[];
}

/**
 * Creates a new ownership record.
 */
export async function createOwnership(
  stoveId: number,
  playerId: number,
  acquiredHow: 'lootbox' | 'trade' | 'mini-game'
): Promise<CreateOwnershipResponse> {
  const response = await fetch(`${API_BASE_URL}/ownerships`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ stoveId, playerId, acquiredHow }),
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to create ownership record: ${response.status}`);
  }

  return await response.json() as CreateOwnershipResponse;
}

/**
 * Fetches the current ownership record for a stove.
 */
export async function getCurrentOwner(stoveId: number): Promise<Ownership> {
  const response = await fetch(`${API_BASE_URL}/stoves/${stoveId}/current-owner`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch current owner for stove ${stoveId}: ${response.status}`);
  }

  return await response.json() as Ownership;
}

/**
 * Deletes an ownership record from the system.
 */
export async function deleteOwnership(id: number): Promise<SuccessMessage> {
  const response = await fetch(`${API_BASE_URL}/ownerships/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to delete ownership record: ${response.status}`);
  }

  return await response.json() as SuccessMessage;
}

/**
 * Counts the number of ownership changes for a stove.
 */
export async function countOwnershipChanges(stoveId: number): Promise<CountResponse> {
  const response = await fetch(`${API_BASE_URL}/stoves/${stoveId}/ownership-changes/count`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to count ownership changes for stove ${stoveId}: ${response.status}`);
  }

  return await response.json() as CountResponse;
}

/**
 * Counts the number of stoves acquired by a player.
 */
export async function countStovesAcquiredByPlayer(playerId: number): Promise<CountResponse> {
  const response = await fetch(`${API_BASE_URL}/players/${playerId}/acquired-stoves/count`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to count acquired stoves for player ${playerId}: ${response.status}`);
  }

  return await response.json() as CountResponse;
}
