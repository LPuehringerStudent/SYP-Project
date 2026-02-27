import { ITypedStatement, Unit } from "../utils/unit";

export abstract class ServiceBase {

    protected constructor(protected readonly unit: Unit) {}

    protected executeStmt(stmt: ITypedStatement): [success: boolean, id: number] {
        const result = stmt.run();
        const id: number = Number(result.lastInsertRowid);
        return [result.changes === 1, id];
    }
}