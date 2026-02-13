import { ListingRow as Listing } from '../../../../shared/model';

const API_BASE_URL = '/api';

export type { Listing };

/** Error response from the API */
export interface ApiError {
  error: string;
}

/** Response for creating a listing */
export interface CreateListingResponse {
  listingId: number;
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
 * Fetches all listings from the API.
 */
export async function getAllListings(): Promise<Listing[]> {
  const response = await fetch(`${API_BASE_URL}/listings`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch listings: ${response.status}`);
  }

  return await response.json() as Listing[];
}

/**
 * Fetches all active listings.
 */
export async function getActiveListings(): Promise<Listing[]> {
  const response = await fetch(`${API_BASE_URL}/listings/active`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch active listings: ${response.status}`);
  }

  return await response.json() as Listing[];
}

/**
 * Fetches a single listing by its ID.
 */
export async function getListingById(id: number): Promise<Listing> {
  const response = await fetch(`${API_BASE_URL}/listings/${id}`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch listing ${id}: ${response.status}`);
  }

  return await response.json() as Listing;
}

/**
 * Fetches all listings by a specific seller.
 */
export async function getListingsBySellerId(sellerId: number): Promise<Listing[]> {
  const response = await fetch(`${API_BASE_URL}/players/${sellerId}/listings`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch listings for seller ${sellerId}: ${response.status}`);
  }

  return await response.json() as Listing[];
}

/**
 * Fetches all active listings by a specific seller.
 */
export async function getActiveListingsBySellerId(sellerId: number): Promise<Listing[]> {
  const response = await fetch(`${API_BASE_URL}/players/${sellerId}/listings/active`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch active listings for seller ${sellerId}: ${response.status}`);
  }

  return await response.json() as Listing[];
}

/**
 * Fetches the active listing for a specific stove.
 */
export async function getActiveListingByStoveId(stoveId: number): Promise<Listing> {
  const response = await fetch(`${API_BASE_URL}/stoves/${stoveId}/listing`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to fetch listing for stove ${stoveId}: ${response.status}`);
  }

  return await response.json() as Listing;
}

/**
 * Creates a new marketplace listing.
 */
export async function createListing(
  sellerId: number,
  stoveId: number,
  price: number
): Promise<CreateListingResponse> {
  const response = await fetch(`${API_BASE_URL}/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sellerId, stoveId, price }),
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to create listing: ${response.status}`);
  }

  return await response.json() as CreateListingResponse;
}

/**
 * Updates the price of a listing.
 */
export async function updateListingPrice(id: number, price: number): Promise<SuccessMessage> {
  const response = await fetch(`${API_BASE_URL}/listings/${id}/price`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ price }),
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to update listing price: ${response.status}`);
  }

  return await response.json() as SuccessMessage;
}

/**
 * Cancels a marketplace listing.
 */
export async function cancelListing(id: number): Promise<SuccessMessage> {
  const response = await fetch(`${API_BASE_URL}/listings/${id}/cancel`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to cancel listing: ${response.status}`);
  }

  return await response.json() as SuccessMessage;
}

/**
 * Deletes a listing from the system.
 */
export async function deleteListing(id: number): Promise<SuccessMessage> {
  const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to delete listing: ${response.status}`);
  }

  return await response.json() as SuccessMessage;
}

/**
 * Counts the number of active listings for a seller.
 */
export async function countActiveListingsBySeller(sellerId: number): Promise<CountResponse> {
  const response = await fetch(`${API_BASE_URL}/players/${sellerId}/active-listings/count`);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || `Failed to count active listings for seller ${sellerId}: ${response.status}`);
  }

  return await response.json() as CountResponse;
}
