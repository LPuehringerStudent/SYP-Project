import { TradeRow as Trade } from '../../../../shared/model';

const API_BASE_URL = '/api';

export type { Trade };

/** Error response from the API */
export interface ApiError {
  error: string;
}

/** Response for executing a trade */
export interface ExecuteTradeResponse {
  tradeId: number;
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
 * Fetches all trades from the API.
 */
export async function getAllTrades(): Promise<Trade[]> {
  const response = await fetch(`${API_BASE_URL}/trades`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch trades: ${response.status}`);
  }

  return await response.json() as Trade[];
}

/**
 * Fetches a single trade by its ID.
 */
export async function getTradeById(id: number): Promise<Trade> {
  const response = await fetch(`${API_BASE_URL}/trades/${id}`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch trade ${id}: ${response.status}`);
  }

  return await response.json() as Trade;
}

/**
 * Fetches the trade associated with a specific listing.
 */
export async function getTradeByListingId(listingId: number): Promise<Trade> {
  const response = await fetch(`${API_BASE_URL}/listings/${listingId}/trade`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch trade for listing ${listingId}: ${response.status}`);
  }

  return await response.json() as Trade;
}

/**
 * Fetches all trades where the player was the buyer.
 */
export async function getTradesByBuyerId(buyerId: number): Promise<Trade[]> {
  const response = await fetch(`${API_BASE_URL}/players/${buyerId}/trades`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch trades for buyer ${buyerId}: ${response.status}`);
  }

  return await response.json() as Trade[];
}

/**
 * Executes a trade (completes a purchase of a listed stove).
 */
export async function executeTrade(
  listingId: number,
  buyerId: number
): Promise<ExecuteTradeResponse> {
  const response = await fetch(`${API_BASE_URL}/trades`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ listingId, buyerId }),
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to execute trade: ${response.status}`);
  }

  return await response.json() as ExecuteTradeResponse;
}

/**
 * Fetches recent trades.
 */
export async function getRecentTrades(limit?: number): Promise<Trade[]> {
  const url = limit !== undefined
    ? `${API_BASE_URL}/trades/recent?limit=${limit}`
    : `${API_BASE_URL}/trades/recent`;
  
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch recent trades: ${response.status}`);
  }

  return await response.json() as Trade[];
}

/**
 * Deletes a trade record from the system.
 */
export async function deleteTrade(id: number): Promise<SuccessMessage> {
  const response = await fetch(`${API_BASE_URL}/trades/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to delete trade: ${response.status}`);
  }

  return await response.json() as SuccessMessage;
}

/**
 * Counts the total number of trades in the system.
 */
export async function countTrades(): Promise<CountResponse> {
  const response = await fetch(`${API_BASE_URL}/trades/count`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to count trades: ${response.status}`);
  }

  return await response.json() as CountResponse;
}

/**
 * Counts the number of trades for a specific buyer.
 */
export async function countTradesByBuyer(buyerId: number): Promise<CountResponse> {
  const response = await fetch(`${API_BASE_URL}/players/${buyerId}/trades/count`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to count trades for buyer ${buyerId}: ${response.status}`);
  }

  return await response.json() as CountResponse;
}
