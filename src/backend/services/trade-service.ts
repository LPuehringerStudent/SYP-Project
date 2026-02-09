import { ServiceBase } from "./service-base";
import { Unit } from "../utils/unit";
import { TradeRow } from "../../shared/model";

export class TradeService extends ServiceBase {
    constructor(unit: Unit) {
        super(unit);
    }

    /**
     * Retrieves all trades from the database.
     * @returns An array of all TradeRow objects.
     */
    getAllTrades(): TradeRow[] {
        const stmt = this.unit.prepare<TradeRow>(
            "SELECT * FROM Trade"
        );
        return stmt.all();
    }

    /**
     * Retrieves a trade by its unique ID.
     * @param id - The unique trade ID.
     * @returns The TradeRow object if found, otherwise null.
     */
    getTradeById(id: number): TradeRow | null {
        const stmt = this.unit.prepare<TradeRow>(
            "SELECT * FROM Trade WHERE tradeId = @id",
            { id }
        );
        return stmt.get() ?? null;
    }

    /**
     * Retrieves trades by listing ID.
     * @param listingId - The listing's unique ID.
     * @returns The TradeRow object if found, otherwise null.
     */
    getTradeByListingId(listingId: number): TradeRow | null {
        const stmt = this.unit.prepare<TradeRow>(
            "SELECT * FROM Trade WHERE listingId = @listingId",
            { listingId }
        );
        return stmt.get() ?? null;
    }

    /**
     * Retrieves all trades where a player was the buyer.
     * @param buyerId - The buyer's unique player ID.
     * @returns An array of TradeRow objects.
     */
    getTradesByBuyerId(buyerId: number): TradeRow[] {
        const stmt = this.unit.prepare<TradeRow>(
            "SELECT * FROM Trade WHERE buyerId = @buyerId ORDER BY executedAt DESC",
            { buyerId }
        );
        return stmt.all();
    }

    /**
     * Creates a new trade record.
     * @param listingId - The listing that was purchased.
     * @param buyerId - The buyer's player ID.
     * @returns A tuple where the first element indicates success,
     *          and the second element is the new trade's ID (if successful).
     */
    createTrade(listingId: number, buyerId: number): [boolean, number] {
        const stmt = this.unit.prepare<TradeRow>(
            `INSERT INTO Trade (listingId, buyerId, executedAt) 
             VALUES (@listingId, @buyerId, datetime('now'))`,
            { listingId, buyerId }
        );
        return this.executeStmt(stmt);
    }

    /**
     * Retrieves recent trades.
     * @param limit - Maximum number of records to return (default: 10).
     * @returns An array of recent TradeRow objects.
     */
    getRecentTrades(limit: number = 10): TradeRow[] {
        const stmt = this.unit.prepare<TradeRow>(
            "SELECT * FROM Trade ORDER BY executedAt DESC LIMIT @limit",
            { limit }
        );
        return stmt.all();
    }

    /**
     * Deletes a trade record from the database.
     * @param id - The trade's unique ID.
     * @returns True if exactly one trade was deleted, false otherwise.
     */
    deleteTrade(id: number): boolean {
        const stmt = this.unit.prepare(
            "DELETE FROM Trade WHERE tradeId = @id",
            { id }
        );
        const result = stmt.run();
        return result.changes === 1;
    }

    /**
     * Counts total number of trades.
     * @returns The total count of trades.
     */
    countTrades(): number {
        const stmt = this.unit.prepare<{ count: number }>(
            "SELECT COUNT(*) as count FROM Trade"
        );
        const result = stmt.get();
        return result?.count ?? 0;
    }

    /**
     * Counts trades for a specific buyer.
     * @param buyerId - The buyer's player ID.
     * @returns The count of trades by the buyer.
     */
    countTradesByBuyer(buyerId: number): number {
        const stmt = this.unit.prepare<{ count: number }>(
            "SELECT COUNT(*) as count FROM Trade WHERE buyerId = @buyerId",
            { buyerId }
        );
        const result = stmt.get();
        return result?.count ?? 0;
    }
}
