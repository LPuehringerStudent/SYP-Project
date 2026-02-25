// Set test database to use a unique file for test isolation
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), "src", "backend", "db");
const dbPath = path.join(dbDir, "EmberExchange-test-trade.db");

// Ensure test database directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Remove any existing test database to start fresh
if (fs.existsSync(dbPath)) {
    try {
        fs.unlinkSync(dbPath);
    } catch (e) {
        // Ignore errors
    }
}

// Set environment variable to use test database
process.env.TEST_DB_PATH = dbPath;

// Now import the app and other modules
import request from "supertest";
import { app } from "../../backend/app";
import Database from "better-sqlite3";

describe("Trade API Endpoints", () => {
    beforeAll(() => {
        // Create database schema
        const db = new Database(dbPath, { fileMustExist: false });
        db.pragma("foreign_keys = ON");

        // Create required tables
        db.exec(`
            CREATE TABLE IF NOT EXISTS Player (
                playerId INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                coins INTEGER NOT NULL DEFAULT 0,
                lootboxCount INTEGER NOT NULL DEFAULT 0,
                isAdmin INTEGER NOT NULL DEFAULT 0,
                joinedAt TEXT NOT NULL
            ) STRICT
        `);

        db.exec(`
            CREATE TABLE IF NOT EXISTS StoveType (
                typeId INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                imageUrl TEXT NOT NULL,
                rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'mythic', 'legendary', 'limited')),
                lootboxWeight INTEGER NOT NULL
            ) STRICT
        `);

        db.exec(`
            CREATE TABLE IF NOT EXISTS Stove (
                stoveId INTEGER PRIMARY KEY AUTOINCREMENT,
                typeId INTEGER NOT NULL REFERENCES StoveType(typeId),
                currentOwnerId INTEGER NOT NULL REFERENCES Player(playerId),
                mintedAt TEXT NOT NULL
            ) STRICT
        `);

        db.exec(`
            CREATE TABLE IF NOT EXISTS Listing (
                listingId INTEGER PRIMARY KEY AUTOINCREMENT,
                sellerId INTEGER NOT NULL REFERENCES Player(playerId),
                stoveId INTEGER NOT NULL REFERENCES Stove(stoveId),
                price INTEGER NOT NULL CHECK (price >= 1),
                listedAt TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'sold'))
            ) STRICT
        `);

        db.exec(`
            CREATE TABLE IF NOT EXISTS Trade (
                tradeId INTEGER PRIMARY KEY AUTOINCREMENT,
                listingId INTEGER NOT NULL UNIQUE REFERENCES Listing(listingId),
                buyerId INTEGER NOT NULL REFERENCES Player(playerId),
                executedAt TEXT NOT NULL
            ) STRICT
        `);

        // Insert test data
        db.exec(`
            INSERT INTO Player (playerId, username, coins, lootboxCount, isAdmin, joinedAt) VALUES 
            (1, 'seller1', 5000, 10, 0, datetime('now')),
            (2, 'buyer1', 10000, 0, 0, datetime('now')),
            (3, 'buyer2', 8000, 0, 0, datetime('now'))
        `);

        db.exec(`
            INSERT INTO StoveType (typeId, name, imageUrl, rarity, lootboxWeight) VALUES 
            (1, 'Test Stove', '/images/test.png', 'common', 100)
        `);

        db.exec(`
            INSERT INTO Stove (stoveId, typeId, currentOwnerId, mintedAt) VALUES 
            (1, 1, 1, datetime('now')),
            (2, 1, 1, datetime('now')),
            (3, 1, 2, datetime('now'))
        `);

        // Insert active listings
        db.exec(`
            INSERT INTO Listing (listingId, sellerId, stoveId, price, listedAt, status) VALUES 
            (1, 1, 1, 5000, datetime('now'), 'active'),
            (2, 1, 2, 7500, datetime('now'), 'active'),
            (3, 2, 3, 6000, datetime('now'), 'active')
        `);

        // Insert completed trades
        db.exec(`
            INSERT INTO Trade (tradeId, listingId, buyerId, executedAt) VALUES 
            (1, 1, 2, datetime('now', '-5 days')),
            (2, 2, 3, datetime('now', '-2 days'))
        `);

        // Update listings to sold
        db.exec(`UPDATE Listing SET status = 'sold' WHERE listingId IN (1, 2)`);

        db.close();
    });

    afterAll(() => {
        // Clean up test database file
        try {
            if (fs.existsSync(dbPath)) {
                fs.unlinkSync(dbPath);
            }
        } catch (e) {
            // Ignore cleanup errors
        }
        delete process.env.TEST_DB_PATH;
    });

    describe("GET /api/trades", () => {
        it("should return all trades", async () => {
            const response = await request(app)
                .get("/api/trades")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(2);
            expect(response.body[0]).toHaveProperty("tradeId");
            expect(response.body[0]).toHaveProperty("listingId");
            expect(response.body[0]).toHaveProperty("buyerId");
            expect(response.body[0]).toHaveProperty("executedAt");
        });
    });

    describe("GET /api/trades/:id", () => {
        it("should return a trade by valid ID", async () => {
            const response = await request(app)
                .get("/api/trades/1")
                .expect(200);

            expect(response.body).toHaveProperty("tradeId", 1);
            expect(response.body).toHaveProperty("listingId", 1);
            expect(response.body).toHaveProperty("buyerId", 2);
            expect(response.body).toHaveProperty("executedAt");
        });

        it("should return 404 for non-existent trade ID", async () => {
            const response = await request(app)
                .get("/api/trades/99999")
                .expect(404);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("not found");
        });

        it("should return 400 for invalid ID (string)", async () => {
            const response = await request(app)
                .get("/api/trades/invalid")
                .expect(400);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("valid number");
        });
    });

    describe("GET /api/listings/:listingId/trade", () => {
        it("should return trade for a specific listing", async () => {
            const response = await request(app)
                .get("/api/listings/1/trade")
                .expect(200);

            expect(response.body).toHaveProperty("tradeId");
            expect(response.body).toHaveProperty("listingId", 1);
            expect(response.body).toHaveProperty("buyerId");
        });

        it("should return 404 for listing with no trade", async () => {
            const response = await request(app)
                .get("/api/listings/99999/trade")
                .expect(404);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("no trade found");
        });
    });

    describe("GET /api/players/:buyerId/trades", () => {
        it("should return all trades for a specific buyer", async () => {
            const response = await request(app)
                .get("/api/players/2/trades")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(1);
            response.body.forEach((trade: any) => {
                expect(trade.buyerId).toBe(2);
            });
        });

        it("should return empty array for buyer with no trades", async () => {
            const response = await request(app)
                .get("/api/players/99999/trades")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        it("should return 400 for invalid buyer ID", async () => {
            const response = await request(app)
                .get("/api/players/invalid/trades")
                .expect(400);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("valid number");
        });
    });

    describe("POST /api/trades", () => {
        it("should execute a trade successfully", async () => {
            // First create a new active listing to trade
            const db = new Database(dbPath);
            db.exec(`INSERT INTO Listing (listingId, sellerId, stoveId, price, listedAt, status) 
                     VALUES (10, 1, 1, 5000, datetime('now'), 'active')`);
            db.close();

            const tradeData = {
                listingId: 10,
                buyerId: 2
            };

            const response = await request(app)
                .post("/api/trades")
                .send(tradeData)
                .expect(201);

            expect(response.body).toHaveProperty("tradeId");
            expect(response.body).toHaveProperty("message", "Trade executed successfully");
        });

        it("should return 400 when required fields are missing", async () => {
            const invalidTrade = {
                buyerId: 2
            };

            const response = await request(app)
                .post("/api/trades")
                .send(invalidTrade)
                .expect(400);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("required");
        });

        it("should return 404 for non-existent listing", async () => {
            const invalidTrade = {
                listingId: 99999,
                buyerId: 2
            };

            const response = await request(app)
                .post("/api/trades")
                .send(invalidTrade)
                .expect(404);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("not found");
        });

        it("should return 400 when buyer tries to buy own listing", async () => {
            // Create a listing where seller is also the buyer
            const db = new Database(dbPath);
            db.exec(`INSERT INTO Listing (listingId, sellerId, stoveId, price, listedAt, status) 
                     VALUES (11, 1, 1, 5000, datetime('now'), 'active')`);
            db.close();

            const invalidTrade = {
                listingId: 11,
                buyerId: 1
            };

            const response = await request(app)
                .post("/api/trades")
                .send(invalidTrade)
                .expect(400);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("own listing");
        });
    });

    describe("GET /api/trades/recent", () => {
        it("should return recent trades with default limit", async () => {
            const response = await request(app)
                .get("/api/trades/recent")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it("should return recent trades with specified limit", async () => {
            const response = await request(app)
                .get("/api/trades/recent?limit=5")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe("DELETE /api/trades/:id", () => {
        it("should delete an existing trade", async () => {
            // First create a trade to delete
            const db = new Database(dbPath);
            db.exec(`INSERT INTO Listing (listingId, sellerId, stoveId, price, listedAt, status) 
                     VALUES (20, 1, 1, 5000, datetime('now'), 'sold')`);
            db.exec(`INSERT INTO Trade (tradeId, listingId, buyerId, executedAt) 
                     VALUES (100, 20, 2, datetime('now'))`);
            db.close();

            const response = await request(app)
                .delete("/api/trades/100")
                .expect(200);

            expect(response.body).toHaveProperty("message", "Trade deleted");
        });

        it("should return 404 for non-existent trade", async () => {
            const response = await request(app)
                .delete("/api/trades/99999")
                .expect(404);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("not found");
        });
    });

    describe("GET /api/trades/count", () => {
        it("should return total count of trades", async () => {
            const response = await request(app)
                .get("/api/trades/count")
                .expect(200);

            expect(response.body).toHaveProperty("count");
            expect(typeof response.body.count).toBe("number");
            expect(response.body.count).toBeGreaterThanOrEqual(2);
        });
    });

    describe("GET /api/players/:buyerId/trades/count", () => {
        it("should return count of trades for a specific buyer", async () => {
            const response = await request(app)
                .get("/api/players/2/trades/count")
                .expect(200);

            expect(response.body).toHaveProperty("count");
            expect(typeof response.body.count).toBe("number");
            expect(response.body.count).toBeGreaterThanOrEqual(1);
        });

        it("should return 400 for invalid buyer ID", async () => {
            const response = await request(app)
                .get("/api/players/invalid/trades/count")
                .expect(400);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("valid number");
        });
    });
});