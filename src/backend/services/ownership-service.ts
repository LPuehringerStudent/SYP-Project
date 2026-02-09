import { ServiceBase } from "./service-base";
import { Unit } from "../utils/unit";
import { OwnershipRow } from "../../shared/model";

export class OwnershipService extends ServiceBase {
    constructor(unit: Unit) {
        super(unit);
    }

    /**
     * Retrieves all ownership records from the database.
     * @returns An array of all OwnershipRow objects.
     */
    getAllOwnerships(): OwnershipRow[] {
        const stmt = this.unit.prepare<OwnershipRow>(
            "SELECT * FROM Ownership"
        );
        return stmt.all();
    }

    /**
     * Retrieves an ownership record by its unique ID.
     * @param id - The unique ownership ID.
     * @returns The OwnershipRow object if found, otherwise null.
     */
    getOwnershipById(id: number): OwnershipRow | null {
        const stmt = this.unit.prepare<OwnershipRow>(
            "SELECT * FROM Ownership WHERE ownershipId = @id",
            { id }
        );
        return stmt.get() ?? null;
    }

    /**
     * Retrieves ownership history for a specific stove.
     * @param stoveId - The stove's unique ID.
     * @returns An array of OwnershipRow objects for the stove, ordered by acquisition date.
     */
    getOwnershipHistoryByStoveId(stoveId: number): OwnershipRow[] {
        const stmt = this.unit.prepare<OwnershipRow>(
            "SELECT * FROM Ownership WHERE stoveId = @stoveId ORDER BY acquiredAt ASC",
            { stoveId }
        );
        return stmt.all();
    }

    /**
     * Retrieves ownership records for a specific player.
     * @param playerId - The player's unique ID.
     * @returns An array of OwnershipRow objects where the player acquired the stove.
     */
    getOwnershipsByPlayerId(playerId: number): OwnershipRow[] {
        const stmt = this.unit.prepare<OwnershipRow>(
            "SELECT * FROM Ownership WHERE playerId = @playerId ORDER BY acquiredAt DESC",
            { playerId }
        );
        return stmt.all();
    }

    /**
     * Creates a new ownership record.
     * @param stoveId - The stove's unique ID.
     * @param playerId - The player who acquired the stove.
     * @param acquiredHow - How the stove was acquired ("lootbox" | "trade" | "mini-game").
     * @returns A tuple where the first element indicates success,
     *          and the second element is the new ownership record's ID (if successful).
     */
    createOwnership(
        stoveId: number,
        playerId: number,
        acquiredHow: "lootbox" | "trade" | "mini-game"
    ): [boolean, number] {
        const stmt = this.unit.prepare<OwnershipRow>(
            `INSERT INTO Ownership (stoveId, playerId, acquiredAt, acquiredHow) 
             VALUES (@stoveId, @playerId, datetime('now'), @acquiredHow)`,
            { stoveId, playerId, acquiredHow }
        );
        return this.executeStmt(stmt);
    }

    /**
     * Retrieves the current owner of a stove.
     * @param stoveId - The stove's unique ID.
     * @returns The ownership record of the current owner, or null if not found.
     */
    getCurrentOwnership(stoveId: number): OwnershipRow | null {
        const stmt = this.unit.prepare<OwnershipRow>(
            "SELECT * FROM Ownership WHERE stoveId = @stoveId ORDER BY acquiredAt DESC LIMIT 1",
            { stoveId }
        );
        return stmt.get() ?? null;
    }

    /**
     * Deletes an ownership record from the database.
     * @param id - The ownership record's unique ID.
     * @returns True if exactly one ownership record was deleted, false otherwise.
     */
    deleteOwnership(id: number): boolean {
        const stmt = this.unit.prepare(
            "DELETE FROM Ownership WHERE ownershipId = @id",
            { id }
        );
        const result = stmt.run();
        return result.changes === 1;
    }

    /**
     * Counts how many times a stove has changed owners.
     * @param stoveId - The stove's unique ID.
     * @returns The count of ownership records for the stove.
     */
    countOwnershipChanges(stoveId: number): number {
        const stmt = this.unit.prepare<{ count: number }>(
            "SELECT COUNT(*) as count FROM Ownership WHERE stoveId = @stoveId",
            { stoveId }
        );
        const result = stmt.get();
        return result?.count ?? 0;
    }

    /**
     * Counts how many stoves a player has acquired.
     * @param playerId - The player's unique ID.
     * @returns The count of stoves acquired by the player.
     */
    countStovesAcquiredByPlayer(playerId: number): number {
        const stmt = this.unit.prepare<{ count: number }>(
            "SELECT COUNT(*) as count FROM Ownership WHERE playerId = @playerId",
            { playerId }
        );
        const result = stmt.get();
        return result?.count ?? 0;
    }
}
