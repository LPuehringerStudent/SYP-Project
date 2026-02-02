import { ServiceBase } from "./service-base";
import { Unit } from "../utils/unit";
import { Player, PlayerRow } from "../model/db-model";

export class PlayerService extends ServiceBase {
    constructor(unit: Unit) {
        super(unit);
    }

    getAllPlayers(): PlayerRow[] {
        const stmt = this.unit.prepare<PlayerRow>(
            "SELECT * FROM Player"
        );
        return stmt.all();
    }

    getInfoByID(id: number): PlayerRow | null {
        const stmt = this.unit.prepare<PlayerRow>(
            "SELECT * FROM Player WHERE playerId = @id",
            { id }
        );
        return stmt.get() ?? null;
    }

    createPlayer(username: string, coins: number = 1000, lootboxCount: number = 10): [boolean, number] {
        const stmt = this.unit.prepare<PlayerRow>(
            `INSERT INTO Player (username, coins, lootboxCount, isAdmin, joinedAt) 
             VALUES (@username, @coins, @lootboxCount, 0, datetime('now'))`,
            { username, coins, lootboxCount }
        );
        return this.executeStmt(stmt);
    }

    updatePlayerCoins(id: number, coins: number): boolean {
        const stmt = this.unit.prepare(
            "UPDATE Player SET coins = @coins WHERE playerId = @id",
            { id, coins }
        );
        const result = stmt.run();
        return result.changes === 1;
    }

    updatePlayerLootboxCount(id: number, lootboxCount: number): boolean {
        const stmt = this.unit.prepare(
            "UPDATE Player SET lootboxCount = @lootboxCount WHERE playerId = @id",
            { id, lootboxCount }
        );
        const result = stmt.run();
        return result.changes === 1;
    }

    deletePlayer(id: number): boolean {
        const stmt = this.unit.prepare(
            "DELETE FROM Player WHERE playerId = @id",
            { id }
        );
        const result = stmt.run();
        return result.changes === 1;
    }

    getPlayerByUsername(username: string): PlayerRow | null {
        const stmt = this.unit.prepare<PlayerRow>(
            "SELECT * FROM Player WHERE username = @username",
            { username }
        );
        return stmt.get() ?? null;
    }
}
