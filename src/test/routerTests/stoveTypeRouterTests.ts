
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), "src", "backend", "db");
const dbPath = path.join(dbDir, "EmberExchange-test-stove-type.db");


if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Remove any existing test database to start fresh
if (fs.existsSync(dbPath)) {
    try {
        fs.unlinkSync(dbPath);
    } catch (e) {

    }
}

process.env.TEST_DB_PATH = dbPath;

import request from "supertest";
import { app } from "../../backend/app";
import Database from "better-sqlite3";

describe("StoveType API Endpoints", () => {
    beforeAll(() => {
        // Creating database schema
        const db = new Database(dbPath, { fileMustExist: false });
        db.pragma("foreign_keys = ON");

        // Creating required tables
        db.exec(`
            CREATE TABLE IF NOT EXISTS StoveType (
                typeId INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                imageUrl TEXT NOT NULL,
                rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'mythic', 'legendary', 'limited')),
                lootboxWeight INTEGER NOT NULL
            ) STRICT
        `);

        db.exec(`
            INSERT INTO StoveType (typeId, name, imageUrl, rarity, lootboxWeight) VALUES 
            (1, 'Standard Stove', '/images/stoves/standard.png', 'common', 100),
            (2, 'Bronze Stove', '/images/stoves/bronze.png', 'rare', 50),
            (3, 'Silver Stove', '/images/stoves/silver.png', 'rare', 40),
            (4, 'Golden Stove', '/images/stoves/golden.png', 'mythic', 20),
            (5, 'Dragon Stove', '/images/stoves/dragon.png', 'legendary', 5),
            (6, 'Unique Stove', '/images/stoves/unique.png', 'limited', 1)
        `);

        db.close();
    });

    afterAll(() => {
        // Cleaning up test database file
        try {
            if (fs.existsSync(dbPath)) {
                fs.unlinkSync(dbPath);
            }
        } catch (e) {

        }
        delete process.env.TEST_DB_PATH;
    });

    describe("GET /api/stove-types", () => {
        it("should return all stove types", async () => {
            const response = await request(app)
                .get("/api/stove-types")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(6);
            expect(response.body[0]).toHaveProperty("typeId");
            expect(response.body[0]).toHaveProperty("name");
            expect(response.body[0]).toHaveProperty("rarity");
            expect(response.body[0]).toHaveProperty("lootboxWeight");
        });
    });

    describe("GET /api/stove-types/:id", () => {
        it("should return a stove type by valid ID", async () => {
            const response = await request(app)
                .get("/api/stove-types/1")
                .expect(200);

            expect(response.body).toHaveProperty("typeId", 1);
            expect(response.body).toHaveProperty("name", "Standard Stove");
            expect(response.body).toHaveProperty("rarity", "common");
            expect(response.body).toHaveProperty("lootboxWeight", 100);
        });

        it("should return 404 for non-existent stove type ID", async () => {
            const response = await request(app)
                .get("/api/stove-types/99999")
                .expect(404);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("not found");
        });

        it("should return 400 for invalid ID (string)", async () => {
            const response = await request(app)
                .get("/api/stove-types/invalid")
                .expect(400);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("valid number");
        });
    });

    describe("GET /api/stove-types/rarity/:rarity", () => {
        it("should return stove types with rarity 'common'", async () => {
            const response = await request(app)
                .get("/api/stove-types/rarity/common")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            response.body.forEach((type: any) => {
                expect(type.rarity).toBe("common");
            });
        });

        it("should return stove types with rarity 'rare'", async () => {
            const response = await request(app)
                .get("/api/stove-types/rarity/rare")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(2);
            response.body.forEach((type: any) => {
                expect(type.rarity).toBe("rare");
            });
        });

        it("should return stove types with rarity 'mythic'", async () => {
            const response = await request(app)
                .get("/api/stove-types/rarity/mythic")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            response.body.forEach((type: any) => {
                expect(type.rarity).toBe("mythic");
            });
        });

        it("should return stove types with rarity 'legendary'", async () => {
            const response = await request(app)
                .get("/api/stove-types/rarity/legendary")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            response.body.forEach((type: any) => {
                expect(type.rarity).toBe("legendary");
            });
        });

        it("should return stove types with rarity 'limited'", async () => {
            const response = await request(app)
                .get("/api/stove-types/rarity/limited")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            response.body.forEach((type: any) => {
                expect(type.rarity).toBe("limited");
            });
        });

        it("should return 400 for invalid rarity", async () => {
            const response = await request(app)
                .get("/api/stove-types/rarity/invalid")
                .expect(400);

            expect(response.body).toHaveProperty("error");
        });
    });

    describe("POST /api/stove-types", () => {
        it("should create a new stove type", async () => {
            const newType = {
                name: "Test Stove",
                imageUrl: "/images/stoves/test.png",
                rarity: "common",
                lootboxWeight: 50
            };

            const response = await request(app)
                .post("/api/stove-types")
                .send(newType)
                .expect(201);

            expect(response.body).toHaveProperty("typeId");
            expect(response.body).toHaveProperty("message", "Stove type created successfully");
        });

        it("should create a legendary stove type", async () => {
            const newType = {
                name: "Golden Dragon Stove",
                imageUrl: "/images/stoves/golden-dragon.png",
                rarity: "legendary",
                lootboxWeight: 5
            };

            const response = await request(app)
                .post("/api/stove-types")
                .send(newType)
                .expect(201);

            expect(response.body).toHaveProperty("typeId");
            expect(response.body).toHaveProperty("message", "Stove type created successfully");
        });

        it("should return 400 for duplicate name", async () => {
            const duplicateType = {
                name: "Standard Stove",
                imageUrl: "/images/stoves/standard.png",
                rarity: "common",
                lootboxWeight: 100
            };

            const response = await request(app)
                .post("/api/stove-types")
                .send(duplicateType)
                .expect(400);

            expect(response.body).toHaveProperty("error");
        });

        it("should return 400 when required fields are missing", async () => {
            const invalidType = {
                name: "Incomplete Stove"
            };

            const response = await request(app)
                .post("/api/stove-types")
                .send(invalidType)
                .expect(400);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("required");
        });

        it("should return 400 for invalid rarity", async () => {
            const invalidType = {
                name: "Invalid Rarity Stove",
                imageUrl: "/images/stoves/invalid.png",
                rarity: "super-rare",
                lootboxWeight: 10
            };

            const response = await request(app)
                .post("/api/stove-types")
                .send(invalidType)
                .expect(400);

            expect(response.body).toHaveProperty("error");
        });
    });

    describe("PATCH /api/stove-types/:id/weight", () => {
        it("should update lootbox weight successfully", async () => {
            const updateData = {
                lootboxWeight: 75
            };

            const response = await request(app)
                .patch("/api/stove-types/1/weight")
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty("message", "Lootbox weight updated");
        });

        it("should return 400 for invalid weight", async () => {
            const updateData = {
                lootboxWeight: -5
            };

            const response = await request(app)
                .patch("/api/stove-types/1/weight")
                .send(updateData)
                .expect(400);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("positive");
        });

        it("should return 404 for non-existent stove type", async () => {
            const updateData = {
                lootboxWeight: 50
            };

            const response = await request(app)
                .patch("/api/stove-types/99999/weight")
                .send(updateData)
                .expect(404);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("not found");
        });
    });

    describe("PATCH /api/stove-types/:id/image", () => {
        it("should update image URL successfully", async () => {
            const updateData = {
                imageUrl: "/images/stoves/updated.png"
            };

            const response = await request(app)
                .patch("/api/stove-types/1/image")
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty("message", "Image URL updated");
        });

        it("should return 400 when imageUrl is missing", async () => {
            const response = await request(app)
                .patch("/api/stove-types/1/image")
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("required");
        });
    });

    describe("DELETE /api/stove-types/:id", () => {
        it("should delete an existing stove type", async () => {
            const response = await request(app)
                .delete("/api/stove-types/2")
                .expect(200);

            expect(response.body).toHaveProperty("message", "Stove type deleted");
        });

        it("should return 404 for non-existent stove type", async () => {
            const response = await request(app)
                .delete("/api/stove-types/99999")
                .expect(404);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error.toLowerCase()).toContain("not found");
        });
    });

    describe("GET /api/stove-types/weight/total", () => {
        it("should return total lootbox weight", async () => {
            const response = await request(app)
                .get("/api/stove-types/weight/total")
                .expect(200);

            expect(response.body).toHaveProperty("totalWeight");
            expect(typeof response.body.totalWeight).toBe("number");
            expect(response.body.totalWeight).toBeGreaterThan(0);
        });
    });
});