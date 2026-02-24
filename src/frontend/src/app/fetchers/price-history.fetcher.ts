import { PriceHistoryRow as PriceHistory } from '../../../../shared/model';

const API_BASE_URL = '/api';

export type { PriceHistory };

/** Error response from the API */
export interface ApiError {
  error: string;
}

/** Response for recording a sale */
export interface RecordSaleResponse {
  historyId: number;
  message: string;
}

/** Response for price statistics */
export interface PriceStatsResponse {
  average: number | null;
  min: number | null;
  max: number | null;
  count: number;
}

/** Generic success message response */
export interface SuccessMessage {
  message: string;
}

/**
 * Fetches all price history records from the API.
 */
export async function getAllPriceHistory(): Promise<PriceHistory[]> {
  const response = await fetch(`${API_BASE_URL}/price-history`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch price history: ${response.status}`);
  }

  return await response.json() as PriceHistory[];
}

/**
 * Fetches a single price history record by its ID.
 */
export async function getPriceHistoryById(id: number): Promise<PriceHistory> {
  const response = await fetch(`${API_BASE_URL}/price-history/${id}`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch price history ${id}: ${response.status}`);
  }

  return await response.json() as PriceHistory;
}

/**
 * Fetches price history for a specific stove type.
 */
export async function getPriceHistoryByTypeId(typeId: number): Promise<PriceHistory[]> {
  const response = await fetch(`${API_BASE_URL}/stove-types/${typeId}/price-history`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch price history for type ${typeId}: ${response.status}`);
  }

  return await response.json() as PriceHistory[];
}

/**
 * Records a new sale price for a stove type.
 */
export async function recordSale(typeId: number, salePrice: number): Promise<RecordSaleResponse> {
  const response = await fetch(`${API_BASE_URL}/price-history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ typeId, salePrice }),
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to record sale: ${response.status}`);
  }

  return await response.json() as RecordSaleResponse;
}

/**
 * Fetches price statistics for a stove type.
 */
export async function getPriceStats(typeId: number): Promise<PriceStatsResponse> {
  const response = await fetch(`${API_BASE_URL}/stove-types/${typeId}/price-stats`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch price stats for type ${typeId}: ${response.status}`);
  }

  return await response.json() as PriceStatsResponse;
}

/**
 * Fetches recent prices for a stove type.
 */
export async function getRecentPrices(typeId: number, limit?: number): Promise<PriceHistory[]> {
  const url = limit !== undefined
    ? `${API_BASE_URL}/stove-types/${typeId}/recent-prices?limit=${limit}`
    : `${API_BASE_URL}/stove-types/${typeId}/recent-prices`;
  
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch recent prices for type ${typeId}: ${response.status}`);
  }

  return await response.json() as PriceHistory[];
}

/**
 * Deletes a price history record from the system.
 */
export async function deletePriceHistory(id: number): Promise<SuccessMessage> {
  const response = await fetch(`${API_BASE_URL}/price-history/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to delete price history record: ${response.status}`);
  }

  return await response.json() as SuccessMessage;
}
