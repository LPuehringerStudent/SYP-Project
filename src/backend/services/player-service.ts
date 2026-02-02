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
}
