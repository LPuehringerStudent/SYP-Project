import { ServiceBase } from "./service-base";
import { Unit } from "../utils/unit";
import { ListingRow } from "../../shared/model";

export class ListingService extends ServiceBase {
    constructor(unit: Unit) {
        super(unit);
    }

    /**
     * Retrieves all listings from the database.
     * @returns An array of all ListingRow objects.
     */
    getAllListings(): ListingRow[] {
        const stmt = this.unit.prepare<ListingRow>(
            "SELECT * FROM Listing"
        );
        return stmt.all();
    }

    /**
     * Retrieves a listing by its unique ID.
     * @param id - The unique listing ID.
     * @returns The ListingRow object if found, otherwise null.
     */
    getListingById(id: number): ListingRow | null {
        const stmt = this.unit.prepare<ListingRow>(
            "SELECT * FROM Listing WHERE listingId = @id",
            { id }
        );
        return stmt.get() ?? null;
    }

    /**
     * Retrieves all active listings.
     * @returns An array of active ListingRow objects.
     */
    getActiveListings(): ListingRow[] {
        const stmt = this.unit.prepare<ListingRow>(
            "SELECT * FROM Listing WHERE status = 'active' ORDER BY listedAt DESC"
        );
        return stmt.all();
    }

    /**
     * Retrieves listings by seller ID.
     * @param sellerId - The seller's unique player ID.
     * @returns An array of ListingRow objects for the seller.
     */
    getListingsBySellerId(sellerId: number): ListingRow[] {
        const stmt = this.unit.prepare<ListingRow>(
            "SELECT * FROM Listing WHERE sellerId = @sellerId ORDER BY listedAt DESC",
            { sellerId }
        );
        return stmt.all();
    }

    /**
     * Retrieves active listings by seller ID.
     * @param sellerId - The seller's unique player ID.
     * @returns An array of active ListingRow objects for the seller.
     */
    getActiveListingsBySellerId(sellerId: number): ListingRow[] {
        const stmt = this.unit.prepare<ListingRow>(
            "SELECT * FROM Listing WHERE sellerId = @sellerId AND status = 'active' ORDER BY listedAt DESC",
            { sellerId }
        );
        return stmt.all();
    }

    /**
     * Retrieves the listing for a specific stove if active.
     * @param stoveId - The stove's unique ID.
     * @returns The active ListingRow object if found, otherwise null.
     */
    getActiveListingByStoveId(stoveId: number): ListingRow | null {
        const stmt = this.unit.prepare<ListingRow>(
            "SELECT * FROM Listing WHERE stoveId = @stoveId AND status = 'active'",
            { stoveId }
        );
        return stmt.get() ?? null;
    }

    /**
     * Creates a new listing for a stove.
     * @param sellerId - The seller's player ID.
     * @param stoveId - The stove being listed.
     * @param price - The asking price in coins.
     * @returns A tuple where the first element indicates success,
     *          and the second element is the new listing's ID (if successful).
     */
    createListing(sellerId: number, stoveId: number, price: number): [boolean, number] {
        const stmt = this.unit.prepare<ListingRow>(
            `INSERT INTO Listing (sellerId, stoveId, price, listedAt, status) 
             VALUES (@sellerId, @stoveId, @price, datetime('now'), 'active')`,
            { sellerId, stoveId, price }
        );
        return this.executeStmt(stmt);
    }

    /**
     * Updates the price of an active listing.
     * @param id - The listing's unique ID.
     * @param price - The new price.
     * @returns True if exactly one listing was updated, false otherwise.
     */
    updatePrice(id: number, price: number): boolean {
        const stmt = this.unit.prepare(
            "UPDATE Listing SET price = @price WHERE listingId = @id AND status = 'active'",
            { id, price }
        );
        const result = stmt.run();
        return result.changes === 1;
    }

    /**
     * Marks a listing as sold.
     * @param id - The listing's unique ID.
     * @returns True if exactly one listing was updated, false otherwise.
     */
    markAsSold(id: number): boolean {
        const stmt = this.unit.prepare(
            "UPDATE Listing SET status = 'sold' WHERE listingId = @id",
            { id }
        );
        const result = stmt.run();
        return result.changes === 1;
    }

    /**
     * Cancels an active listing.
     * @param id - The listing's unique ID.
     * @returns True if exactly one listing was updated, false otherwise.
     */
    cancelListing(id: number): boolean {
        const stmt = this.unit.prepare(
            "UPDATE Listing SET status = 'cancelled' WHERE listingId = @id AND status = 'active'",
            { id }
        );
        const result = stmt.run();
        return result.changes === 1;
    }

    /**
     * Deletes a listing from the database.
     * @param id - The listing's unique ID.
     * @returns True if exactly one listing was deleted, false otherwise.
     */
    deleteListing(id: number): boolean {
        const stmt = this.unit.prepare(
            "DELETE FROM Listing WHERE listingId = @id",
            { id }
        );
        const result = stmt.run();
        return result.changes === 1;
    }

    /**
     * Checks if a stove is currently listed as active.
     * @param stoveId - The stove's unique ID.
     * @returns True if the stove has an active listing.
     */
    isStoveListed(stoveId: number): boolean {
        const stmt = this.unit.prepare<{ count: number }>(
            "SELECT COUNT(*) as count FROM Listing WHERE stoveId = @stoveId AND status = 'active'",
            { stoveId }
        );
        const result = stmt.get();
        return (result?.count ?? 0) > 0;
    }

    /**
     * Counts active listings for a seller.
     * @param sellerId - The seller's player ID.
     * @returns The count of active listings.
     */
    countActiveListingsBySeller(sellerId: number): number {
        const stmt = this.unit.prepare<{ count: number }>(
            "SELECT COUNT(*) as count FROM Listing WHERE sellerId = @sellerId AND status = 'active'",
            { sellerId }
        );
        const result = stmt.get();
        return result?.count ?? 0;
    }
}
