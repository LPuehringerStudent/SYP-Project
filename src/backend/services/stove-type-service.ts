import { ServiceBase } from "./service-base";
import { Unit } from "../utils/unit";
import { StoveTypeRow, Rarity } from "../../shared/model";

export class StoveTypeService extends ServiceBase {
    constructor(unit: Unit) {
        super(unit);
    }

    /**
     * Retrieves all stove types from the database.
     * @returns An array of all StoveTypeRow objects.
     */
    getAllStoveTypes(): StoveTypeRow[] {
        const stmt = this.unit.prepare<StoveTypeRow>(
            "SELECT * FROM StoveType"
        );
        return stmt.all();
    }

    /**
     * Retrieves a stove type by its unique ID.
     * @param id - The unique stove type ID.
     * @returns The StoveTypeRow object if found, otherwise null.
     */
    getStoveTypeById(id: number): StoveTypeRow | null {
        const stmt = this.unit.prepare<StoveTypeRow>(
            "SELECT * FROM StoveType WHERE typeId = @id",
            { id }
        );
        return stmt.get() ?? null;
    }

    /**
     * Retrieves stove types by rarity.
     * @param rarity - The rarity level to filter by ("common" | "rare" | "mythic" | "legendary" | "limited").
     * @returns An array of StoveTypeRow objects with the specified rarity.
     */
    getStoveTypesByRarity(rarity: Rarity): StoveTypeRow[] {
        const stmt = this.unit.prepare<StoveTypeRow>(
            "SELECT * FROM StoveType WHERE rarity = @rarity",
            { rarity }
        );
        return stmt.all();
    }

    /**
     * Creates a new stove type.
     * @param name - The unique name for the stove type.
     * @param imageUrl - URL to the stove's image.
     * @param rarity - The rarity level ("common" | "rare" | "mythic" | "legendary" | "limited").
     * @param lootboxWeight - Weight used for lootbox drop probability calculation.
     * @returns A tuple where the first element indicates success,
     *          and the second element is the new stove type's ID (if successful).
     */
    createStoveType(
        name: string,
        imageUrl: string,
        rarity: Rarity,
        lootboxWeight: number
    ): [boolean, number] {
        const stmt = this.unit.prepare<StoveTypeRow>(
            `INSERT INTO StoveType (name, imageUrl, rarity, lootboxWeight) 
             VALUES (@name, @imageUrl, @rarity, @lootboxWeight)`,
            { name, imageUrl, rarity, lootboxWeight }
        );
        return this.executeStmt(stmt);
    }

    /**
     * Updates the lootbox weight of a stove type.
     * @param id - The stove type's unique ID.
     * @param lootboxWeight - The new lootbox weight to set.
     * @returns True if exactly one stove type was updated, false otherwise.
     */
    updateLootboxWeight(id: number, lootboxWeight: number): boolean {
        const stmt = this.unit.prepare(
            "UPDATE StoveType SET lootboxWeight = @lootboxWeight WHERE typeId = @id",
            { id, lootboxWeight }
        );
        const result = stmt.run();
        return result.changes === 1;
    }

    /**
     * Updates the image URL of a stove type.
     * @param id - The stove type's unique ID.
     * @param imageUrl - The new image URL to set.
     * @returns True if exactly one stove type was updated, false otherwise.
     */
    updateImageUrl(id: number, imageUrl: string): boolean {
        const stmt = this.unit.prepare(
            "UPDATE StoveType SET imageUrl = @imageUrl WHERE typeId = @id",
            { id, imageUrl }
        );
        const result = stmt.run();
        return result.changes === 1;
    }

    /**
     * Deletes a stove type from the database.
     * @param id - The stove type's unique ID.
     * @returns True if exactly one stove type was deleted, false otherwise.
     */
    deleteStoveType(id: number): boolean {
        const stmt = this.unit.prepare(
            "DELETE FROM StoveType WHERE typeId = @id",
            { id }
        );
        const result = stmt.run();
        return result.changes === 1;
    }

    /**
     * Retrieves a stove type by its name.
     * @param name - The name to search for.
     * @returns The StoveTypeRow object if found, otherwise null.
     */
    getStoveTypeByName(name: string): StoveTypeRow | null {
        const stmt = this.unit.prepare<StoveTypeRow>(
            "SELECT * FROM StoveType WHERE name = @name",
            { name }
        );
        return stmt.get() ?? null;
    }

    /**
     * Calculates the total lootbox weight for all stove types.
     * Used for probability calculations when rolling drops.
     * @returns The sum of all lootbox weights.
     */
    getTotalLootboxWeight(): number {
        const stmt = this.unit.prepare<{ total: number }>(
            "SELECT SUM(lootboxWeight) as total FROM StoveType"
        );
        const result = stmt.get();
        return result?.total ?? 0;
    }
}
