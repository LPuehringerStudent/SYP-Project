import { ServiceBase } from "./service-base";
import { Unit } from "../utils/unit";
import { Player, PlayerRow } from "../model/db-model";

export class PlayerService extends ServiceBase {
    constructor(unit: Unit) {
        super(unit);
    }

    /**
     * Retrieves all players from the database.
     * @returns An array of all PlayerRow objects in the database.
     */
    getAllPlayers(): PlayerRow[] {
        const stmt = this.unit.prepare<PlayerRow>(
            "SELECT * FROM Player"
        );
        return stmt.all();
    }

    /**
     * Retrieves a player by their unique ID.
     * @param id - The unique player ID.
     * @returns The PlayerRow object if found, otherwise null.
     */
    getInfoByID(id: number): PlayerRow | null {
        const stmt = this.unit.prepare<PlayerRow>(
            "SELECT * FROM Player WHERE playerId = @id",
            { id }
        );
        return stmt.get() ?? null;
    }

    /**
     * Creates a new player with the specified username and optional initial values.
     * New players are created as non-admins with the current timestamp as join date.
     * @param username - The unique username for the player.
     * @param coins - Initial coin amount (default: 1000).
     * @param lootboxCount - Initial lootbox count (default: 10).
     * @returns A tuple where the first element indicates success,
     *          and the second element is the new player's ID (if successful).
     */
    createPlayer(username: string, coins: number = 1000, lootboxCount: number = 10): [boolean, number] {
        const stmt = this.unit.prepare<PlayerRow>(
            `INSERT INTO Player (username, coins, lootboxCount, isAdmin, joinedAt) 
             VALUES (@username, @coins, @lootboxCount, 0, datetime('now'))`,
            { username, coins, lootboxCount }
        );
        return this.executeStmt(stmt);
    }

    /**
     * Updates the coin balance of a player.
     * @param id - The player's unique ID.
     * @param coins - The new coin amount to set.
     * @returns True if exactly one player was updated, false otherwise.
     */
    updatePlayerCoins(id: number, coins: number): boolean {
        const stmt = this.unit.prepare(
            "UPDATE Player SET coins = @coins WHERE playerId = @id",
            { id, coins }
        );
        const result = stmt.run();
        return result.changes === 1;
    }

    /**
     * Updates the lootbox count of a player.
     * @param id - The player's unique ID.
     * @param lootboxCount - The new lootbox count to set.
     * @returns True if exactly one player was updated, false otherwise.
     */
    updatePlayerLootboxCount(id: number, lootboxCount: number): boolean {
        const stmt = this.unit.prepare(
            "UPDATE Player SET lootboxCount = @lootboxCount WHERE playerId = @id",
            { id, lootboxCount }
        );
        const result = stmt.run();
        return result.changes === 1;
    }

    /**
     * Deletes a player from the database.
     * @param id - The player's unique ID.
     * @returns True if exactly one player was deleted, false otherwise.
     */
    deletePlayer(id: number): boolean {
        const stmt = this.unit.prepare(
            "DELETE FROM Player WHERE playerId = @id",
            { id }
        );
        const result = stmt.run();
        return result.changes === 1;
    }

    /**
     * Retrieves a player by their username.
     * @param username - The username to search for.
     * @returns The PlayerRow object if found, otherwise null.
     */
    getPlayerByUsername(username: string): PlayerRow | null {
        const stmt = this.unit.prepare<PlayerRow>(
            "SELECT * FROM Player WHERE username = @username",
            { username }
        );
        return stmt.get() ?? null;
    }
}
