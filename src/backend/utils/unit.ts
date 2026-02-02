import BetterSqlite3 from "better-sqlite3";
import { Database, Statement } from "better-sqlite3";

import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "db");
const dbFileName = path.join(dbDir, "EmberExchange.db");

// Ensure the db directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

export class Unit {

    private readonly db: Database;
    private completed: boolean;

    public constructor(public readonly readOnly: boolean) {
        this.completed = false;
        this.db = DB.createDBConnection();
        if (!this.readOnly) {
            DB.beginTransaction(this.db);
        }
    }

    public prepare<TResult, TParams extends Record<string, unknown> = Record<string, unknown>>(
        sql: string,
        bindings?: TParams
    ): ITypedStatement<TResult, TParams> {
        const stmt = this.db.prepare<unknown[], TResult>(sql);
        if (bindings != null) {
            stmt.bind(bindings as unknown);
        }
        return stmt as unknown as ITypedStatement<TResult, TParams>;
    }

    public getLastRowId(): number {
        const stmt = this.prepare<{ id: number }>("SELECT last_insert_rowid() as \"id\"");
        const result = stmt.get();
        if (!result) {
            throw new Error("Unable to retrieve last inserted row id");
        }
        return result.id;
    }

    public complete(commit: boolean | null = null): void {
        if (this.completed) {
            return;
        }
        this.completed = true;

        if (commit !== null) {
            (commit ? DB.commitTransaction(this.db) : DB.rollbackTransaction(this.db));
        } else if (!this.readOnly) {
            throw new Error("transaction has been opened, requires information if commit or rollback needed");
        }
        this.db.close();
    }
}

export function ensureSampleDataInserted(unit: Unit): "inserted" | "skipped" {
    function alreadyPresent(): boolean {
        const checkStmt = unit.prepare<{ cnt: number }>(
            'select count(*) as "cnt" from Player where isAdmin = 1'
        );
        const result = checkStmt.get()?.cnt ?? 0;
        return result > 0;
    }

    function insert(): void {
        const stmt = unit.prepare<
            unknown,
            { username: string; coins: number; lootboxCount: number; isAdmin: number; joinedAt: string }
        >(
            `insert into Player (username, coins, lootboxCount, isAdmin, joinedAt) 
             values (@username, @coins, @lootboxCount, @isAdmin, @joinedAt)`,
            {
                username: "admin",
                coins: 999999,
                lootboxCount: 100,
                isAdmin: 1,
                joinedAt: new Date().toISOString()
            }
        );
        stmt.run();
    }

    if (!(alreadyPresent())) {
        insert();
        return "inserted";
    }
    return "skipped";
}

class DB {
    public static createDBConnection(): Database {
        const db = new BetterSqlite3(dbFileName, {
            fileMustExist: false,
            verbose: (s: unknown) => DB.logStatement(s)
        });
        db.pragma("foreign_keys = ON");

        DB.ensureTablesCreated(db);

        return db;
    }

    public static beginTransaction(connection: Database): void {
        connection.exec("begin transaction;");
    }

    public static commitTransaction(connection: Database): void {
        connection.exec("commit;");
    }

    public static rollbackTransaction(connection: Database): void {
        connection.exec("rollback;");
    }

    private static logStatement(statement: string | unknown): void {
        if (typeof statement !== "string") {
            return;
        }
        const start = statement.slice(0, 6).trim().toLowerCase();
        if (start.startsWith("pragma") || start.startsWith("create")) {
            return;
        }
        console.log(`SQL: ${statement}`);
    }

    private static ensureTablesCreated(connection: Database): void {
        connection.exec(`
            create table if not exists Player (
                playerId integer primary key autoincrement,
                username text not null unique,
                coins integer not null default 0,
                lootboxCount integer not null default 0,
                isAdmin integer not null default 0,
                joinedAt text not null
            ) strict
        `);

        connection.exec(`
            create table if not exists StoveType (
                typeId integer primary key autoincrement,
                name text not null,
                imageUrl text not null,
                rarity text not null check (rarity in ('common', 'rare', 'mythic', 'legendary', 'limited')),
                lootboxWeight integer not null
            ) strict
        `);

        connection.exec(`
            create table if not exists Stove (
                stoveId integer primary key autoincrement,
                typeId integer not null references StoveType(typeId),
                currentOwnerId integer not null references Player(playerId),
                mintedAt text not null
            ) strict
        `);

        connection.exec(`
            create table if not exists Lootbox (
                lootboxId integer primary key autoincrement,
                playerId integer not null references Player(playerId),
                openedAt text not null,
                costFree integer not null default 1
            ) strict
        `);

        connection.exec(`
            create table if not exists LootboxDrop (
                dropId integer primary key autoincrement,
                lootboxId integer not null unique references Lootbox(lootboxId),
                stoveId integer not null unique references Stove(stoveId)
            ) strict
        `);

        connection.exec(`
            create table if not exists Listing (
                listingId integer primary key autoincrement,
                sellerId integer not null references Player(playerId),
                stoveId integer not null references Stove(stoveId),
                price integer not null check (price >= 1),
                listedAt text not null,
                status text not null default 'active' check (status in ('active', 'cancelled', 'sold'))
            ) strict
        `);

        connection.exec(`
            create table if not exists Trade (
                tradeId integer primary key autoincrement,
                listingId integer not null unique references Listing(listingId),
                buyerId integer not null references Player(playerId),
                executedAt text not null
            ) strict
        `);

        connection.exec(`
            create table if not exists MiniGameSession (
                sessionId integer primary key autoincrement,
                playerId integer not null references Player(playerId),
                gameType text not null,
                result text not null,
                coinPayout integer not null default 0,
                finishedAt text not null
            ) strict
        `);

        connection.exec(`
            create table if not exists PriceHistory (
                historyId integer primary key autoincrement,
                typeId integer not null references StoveType(typeId),
                salePrice integer not null,
                saleDate text not null
            ) strict
        `);

        connection.exec(`
            create table if not exists Ownership (
                ownershipId integer primary key autoincrement,
                stoveId integer not null references Stove(stoveId),
                playerId integer not null references Player(playerId),
                acquiredAt text not null,
                acquiredHow text not null check (acquiredHow in ('lootbox', 'trade', 'mini-game'))
            ) strict
        `);

        connection.exec(`
            create table if not exists ChatMessage (
                messageId integer primary key autoincrement,
                senderId integer not null references Player(playerId),
                receiverId integer references Player(playerId),
                content text not null,
                sentAt text not null,
                isRead integer not null default 0
            ) strict
        `);

        // Create indexes for better query performance
        connection.exec(`create index if not exists idx_stove_owner on Stove(currentOwnerId)`);
        connection.exec(`create index if not exists idx_stove_type on Stove(typeId)`);
        connection.exec(`create index if not exists idx_listing_seller on Listing(sellerId)`);
        connection.exec(`create index if not exists idx_listing_stove on Listing(stoveId)`);
        connection.exec(`create index if not exists idx_listing_status on Listing(status)`);
        connection.exec(`create index if not exists idx_trade_buyer on Trade(buyerId)`);
        connection.exec(`create index if not exists idx_ownership_stove on Ownership(stoveId)`);
        connection.exec(`create index if not exists idx_ownership_player on Ownership(playerId)`);
        connection.exec(`create index if not exists idx_pricehistory_type on PriceHistory(typeId)`);
        connection.exec(`create index if not exists idx_chat_sender on ChatMessage(senderId)`);
        connection.exec(`create index if not exists idx_chat_receiver on ChatMessage(receiverId)`);
        connection.exec(`create index if not exists idx_lootbox_player on Lootbox(playerId)`);
        connection.exec(`create index if not exists idx_minigame_player on MiniGameSession(playerId)`);
    }
}

type RawStatement<TResult> = BetterSqlite3.Statement<unknown[], TResult>;
type RunResult = ReturnType<RawStatement<unknown>["run"]>;

export interface ITypedStatement<TResult = unknown, TParams = unknown> {
    // phantom type, just carries the params type for tooling
    readonly _params?: TParams;

    get(): TResult | undefined;

    all(): TResult[];

    run(): RunResult;
}
