import { StoveRow as Stove } from '../../../../shared/model';

const API_BASE_URL = '/api';

export type { Stove };

/** Error response from the API */
export interface ApiError {
  error: string;
}

/** Response for creating a stove */
export interface CreateStoveResponse {
  stoveId: number;
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
 * Fetches all stoves from the API.
 */
export async function getAllStoves(): Promise<Stove[]> {
  const response = await fetch(`${API_BASE_URL}/stoves`);

  if (!response.ok) {
    let errorMessage = `Failed to fetch stoves: ${response.status}`;
    try {
      const errorData = await response.json() as ApiError;
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return await response.json() as Stove[];
}

/**
 * Fetches a single stove by its ID.
 */
export async function getStoveById(id: number): Promise<Stove> {
  const response = await fetch(`${API_BASE_URL}/stoves/${id}`);

  if (!response.ok) {
    let errorMessage = `Failed to fetch stove ${id}: ${response.status}`;
    try {
      const errorData = await response.json() as ApiError;
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return await response.json() as Stove;
}

/**
 * Fetches all stoves owned by a specific player.
 */
export async function getStovesByPlayerId(playerId: number): Promise<Stove[]> {
  const response = await fetch(`${API_BASE_URL}/players/${playerId}/stoves`);

  if (!response.ok) {
    let errorMessage = `Failed to fetch stoves for player ${playerId}: ${response.status}`;
    try {
      const errorData = await response.json() as ApiError;
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return await response.json() as Stove[];
}

/**
 * Fetches all stoves of a specific type.
 */
export async function getStovesByTypeId(typeId: number): Promise<Stove[]> {
  const response = await fetch(`${API_BASE_URL}/stove-types/${typeId}/stoves`);

  if (!response.ok) {
    let errorMessage = `Failed to fetch stoves for type ${typeId}: ${response.status}`;
    try {
      const errorData = await response.json() as ApiError;
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return await response.json() as Stove[];
}

/**
 * Creates a new stove (mints a stove instance).
 */
export async function createStove(
  typeId: number,
  currentOwnerId: number
): Promise<CreateStoveResponse> {
  const response = await fetch(`${API_BASE_URL}/stoves`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ typeId, currentOwnerId }),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create stove: ${response.status}`;
    try {
      const errorData = await response.json() as ApiError;
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return await response.json() as CreateStoveResponse;
}

/**
 * Transfers ownership of a stove to a new owner.
 */
export async function transferStoveOwnership(id: number, newOwnerId: number): Promise<SuccessMessage> {
  const response = await fetch(`${API_BASE_URL}/stoves/${id}/owner`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newOwnerId }),
  });

  if (!response.ok) {
    let errorMessage = `Failed to transfer stove ownership: ${response.status}`;
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
 * Deletes a stove from the system.
 */
export async function deleteStove(id: number): Promise<SuccessMessage> {
  const response = await fetch(`${API_BASE_URL}/stoves/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete stove: ${response.status}`;
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
 * Counts the number of stoves owned by a player.
 */
export async function countStovesByPlayer(playerId: number): Promise<CountResponse> {
  const response = await fetch(`${API_BASE_URL}/players/${playerId}/stoves/count`);

  if (!response.ok) {
    let errorMessage = `Failed to count stoves for player ${playerId}: ${response.status}`;
    try {
      const errorData = await response.json() as ApiError;
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return await response.json() as CountResponse;
}

/**
 * Counts the number of stoves of a specific type.
 */
export async function countStovesByType(typeId: number): Promise<CountResponse> {
  const response = await fetch(`${API_BASE_URL}/stove-types/${typeId}/stoves/count`);

  if (!response.ok) {
    let errorMessage = `Failed to count stoves for type ${typeId}: ${response.status}`;
    try {
      const errorData = await response.json() as ApiError;
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return await response.json() as CountResponse;
}
