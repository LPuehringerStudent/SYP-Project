// Set test database to use a unique file for test isolation
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), "src", "backend", "db");
const dbPath = path.join(dbDir, "EmberExchange-test-stove.db");

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

describe("Stove API Endpoints", () => {
    beforeAll(() => {
        // Create database schema
        const db = new Database(dbPath, { fileMustExist: false });
        db.pragma("foreign_keys = ON");

        // Create required tables
        db.exec(`
            CREATE TABLE IF NOT EXISTS Player (
                playerId INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
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
                rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary', 'limited')),
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

        // Insert test data
        db.exec(`
            INSERT INTO Player (playerId, username, password, email, coins, lootboxCount, isAdmin, joinedAt) VALUES 
            (1, 'player1', 'pass1', 'player1@test.com', 5000, 10, 0, datetime('now')),
            (2, 'player2', 'pass2', 'player2@test.com', 3000, 5, 0, datetime('now')),
            (3, 'player3', 'pass3', 'player3@test.com', 10000, 0, 0, datetime('now'))
        `);

        db.exec(`
            INSERT INTO StoveType (typeId, name, imageUrl, rarity, lootboxWeight) VALUES 
            (1, 'Test Stove Common', '/images/test1.png', 'common', 100),
            (2, 'Test Stove Rare', '/images/test2.png', 'rare', 50)
        `);

        // Insert test stoves
        db.exec(`
            INSERT INTO Stove (stoveId, typeId, currentOwnerId, mintedAt) VALUES 
            (1, 1, 1, datetime('now', '-10 days')),
            (2, 1, 1, datetime('now', '-5 days')),
            (3, 2, 2, datetime('now', '-3 days')),
            (4, 1, 2, datetime('now', '-1 day'))
        `);

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

    describe("GET /api/stoves", () => {
        it("should return all stoves", async () => {
            const response = await request(app)
                .get("/api/stoves")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(4);
            expect(response.body[0]).toHaveProperty("stoveId");
            expect(response.body[0]).toHaveProperty("typeId");
            expect(response.body[0]).toHaveProperty("currentOwnerId");
            expect(response.body[0]).toHaveProperty("mintedAt");
        });
    });

    describe("GET /api/stoves/:id", () => {
        it("should return a stove by valid ID", async () => {
            const response = await request(app)
                .get("/api/stoves/1")
                .expect(200);

            expect(response.body).toHaveProperty("stoveId", 1);
            expect(response.body).toHaveProperty("typeId", 1);
            expect(response.body).toHaveProperty("currentOwnerId", 1);
            expect(response.body).toHaveProperty("mintedAt");
        });

        it("should return 404 for non-existent stove ID", async () => {
            const response = await request(app)
                .get("/api/stoves/99999")
                .expect(404);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("not found");
        });

        it("should return 400 for invalid ID (string)", async () => {
            const response = await request(app)
                .get("/api/stoves/invalid")
                .expect(400);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("valid number");
        });
    });

    describe("GET /api/players/:playerId/stoves", () => {
        it("should return all stoves for a specific player", async () => {
            const response = await request(app)
                .get("/api/players/1/stoves")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(2);
            response.body.forEach((stove: any) => {
                expect(stove.currentOwnerId).toBe(1);
            });
        });

        it("should return empty array for player with no stoves", async () => {
            const response = await request(app)
                .get("/api/players/3/stoves")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        it("should return 400 for invalid player ID", async () => {
            const response = await request(app)
                .get("/api/players/invalid/stoves")
                .expect(400);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("valid number");
        });
    });

    describe("GET /api/stove-types/:typeId/stoves", () => {
        it("should return all stoves of a specific type", async () => {
            const response = await request(app)
                .get("/api/stove-types/1/stoves")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(3);
            response.body.forEach((stove: any) => {
                expect(stove.typeId).toBe(1);
            });
        });

        it("should return empty array for type with no stoves", async () => {
            const response = await request(app)
                .get("/api/stove-types/99999/stoves")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        it("should return 400 for invalid type ID", async () => {
            const response = await request(app)
                .get("/api/stove-types/invalid/stoves")
                .expect(400);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("valid number");
        });
    });

    describe("POST /api/stoves", () => {
        it("should create a new stove (mint)", async () => {
            const newStove = {
                typeId: 1,
                currentOwnerId: 1
            };

            const response = await request(app)
                .post("/api/stoves")
                .send(newStove)
                .expect(201);

            expect(response.body).toHaveProperty("stoveId");
            expect(response.body).toHaveProperty("message", "Stove minted successfully");
        });

        it("should return 400 when required fields are missing", async () => {
            const invalidStove = {
                typeId: 1
            };

            const response = await request(app)
                .post("/api/stoves")
                .send(invalidStove)
                .expect(400);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("required");
        });
    });

    describe("PATCH /api/stoves/:id/owner", () => {
        it("should transfer ownership successfully", async () => {
            const transferData = {
                newOwnerId: 2
            };

            const response = await request(app)
                .patch("/api/stoves/1/owner")
                .send(transferData)
                .expect(200);

            expect(response.body).toHaveProperty("message", "Ownership transferred");
        });

        it("should return 400 when newOwnerId is missing", async () => {
            const response = await request(app)
                .patch("/api/stoves/1/owner")
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("required");
        });

        it("should return 404 for non-existent stove", async () => {
            const transferData = {
                newOwnerId: 2
            };

            const response = await request(app)
                .patch("/api/stoves/99999/owner")
                .send(transferData)
                .expect(404);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("not found");
        });
    });

    describe("DELETE /api/stoves/:id", () => {
        it("should delete an existing stove", async () => {
            // First create a stove to delete
            const createResponse = await request(app)
                .post("/api/stoves")
                .send({ typeId: 1, currentOwnerId: 1 });

            const stoveId = createResponse.body.stoveId;

            const response = await request(app)
                .delete(`/api/stoves/${stoveId}`)
                .expect(200);

            expect(response.body).toHaveProperty("message", "Stove deleted");
        });

        it("should return 404 for non-existent stove", async () => {
            const response = await request(app)
                .delete("/api/stoves/99999")
                .expect(404);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("not found");
        });
    });

    describe("GET /api/players/:playerId/stoves/count", () => {
        it("should return count of stoves for a player", async () => {
            const response = await request(app)
                .get("/api/players/1/stoves/count")
                .expect(200);

            expect(response.body).toHaveProperty("count");
            expect(typeof response.body.count).toBe("number");
        });

        it("should return 400 for invalid player ID", async () => {
            const response = await request(app)
                .get("/api/players/invalid/stoves/count")
                .expect(400);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("valid number");
        });
    });

    describe("GET /api/stove-types/:typeId/stoves/count", () => {
        it("should return count of stoves for a type", async () => {
            const response = await request(app)
                .get("/api/stove-types/1/stoves/count")
                .expect(200);

            expect(response.body).toHaveProperty("count");
            expect(typeof response.body.count).toBe("number");
            expect(response.body.count).toBeGreaterThanOrEqual(3);
        });

        it("should return 400 for invalid type ID", async () => {
            const response = await request(app)
                .get("/api/stove-types/invalid/stoves/count")
                .expect(400);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("valid number");
        });
    });
});