import path from 'path';
import fs from 'fs';


const dbDir = path.join(process.cwd(), 'src', 'backend', 'db');
const dbPath = path.join(dbDir, 'EmberExchange-test-ownership.db');

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

if (fs.existsSync(dbPath)) {
    try {
        fs.unlinkSync(dbPath);
    } catch (e) {
        // Ignore errors
    }
}

process.env.TEST_DB_PATH = dbPath;

import { app } from '../../backend/app';
import request from 'supertest';
import Database from 'better-sqlite3';

describe('Ownership API Endpoints', () => {
    beforeAll(() => {
        const db = new Database(dbPath, { fileMustExist: false });
        db.pragma('foreign_keys = ON');

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
            CREATE TABLE IF NOT EXISTS Ownership (
                ownershipId INTEGER PRIMARY KEY AUTOINCREMENT,
                stoveId INTEGER NOT NULL REFERENCES Stove(stoveId),
                playerId INTEGER NOT NULL REFERENCES Player(playerId),
                acquiredAt TEXT NOT NULL,
                acquiredHow TEXT NOT NULL CHECK (acquiredHow IN ('lootbox', 'trade', 'mini-game'))
            ) STRICT
        `);

        db.exec(`
            INSERT INTO Player (playerId, username, coins, lootboxCount, isAdmin, joinedAt) VALUES 
            (1, 'player1', 5000, 10, 0, datetime('now')),
            (2, 'player2', 3000, 5, 0, datetime('now')),
            (3, 'player3', 10000, 0, 0, datetime('now'))
        `);

        db.exec(`
            INSERT INTO StoveType (typeId, name, imageUrl, rarity, lootboxWeight) VALUES 
            (1, 'Test Stove', '/images/test.png', 'common', 100)
        `);

        db.exec(`
            INSERT INTO Stove (stoveId, typeId, currentOwnerId, mintedAt) VALUES 
            (1, 1, 1, datetime('now')),
            (2, 1, 2, datetime('now')),
            (3, 1, 1, datetime('now')),
            (4, 1, 3, datetime('now'))
        `);

        db.exec(`
            INSERT INTO Ownership (ownershipId, stoveId, playerId, acquiredAt, acquiredHow) VALUES 
            (1, 1, 1, datetime('now', '-5 days'), 'lootbox'),
            (2, 1, 2, datetime('now', '-3 days'), 'trade'),
            (3, 1, 1, datetime('now', '-1 day'), 'trade'),
            (4, 2, 2, datetime('now', '-2 days'), 'lootbox'),
            (5, 3, 1, datetime('now'), 'mini-game'),
            (6, 4, 3, datetime('now'), 'lootbox')
        `);

        db.close();
    });

    afterAll(() => {
        try {
            if (fs.existsSync(dbPath)) {
                fs.unlinkSync(dbPath);
            }
        } catch (e) {
            // Ignore cleanup errors
        }
        delete process.env.TEST_DB_PATH;
    });

    describe('GET /api/ownerships', () => {
        it('should return all ownership records', async () => {
            const response = await request(app)
                .get('/api/ownerships')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(6);
            expect(response.body[0]).toHaveProperty('ownershipId');
            expect(response.body[0]).toHaveProperty('stoveId');
            expect(response.body[0]).toHaveProperty('playerId');
            expect(response.body[0]).toHaveProperty('acquiredHow');
        });
    });

    describe('GET /api/ownerships/:id', () => {
        it('should return an ownership record by valid ID', async () => {
            const response = await request(app)
                .get('/api/ownerships/1')
                .expect(200);

            expect(response.body).toHaveProperty('ownershipId', 1);
            expect(response.body).toHaveProperty('stoveId');
            expect(response.body).toHaveProperty('playerId');
            expect(response.body).toHaveProperty('acquiredHow');
        });

        it('should return 404 for non-existent ownership ID', async () => {
            const response = await request(app)
                .get('/api/ownerships/99999')
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('not found');
        });

        it('should return 400 for invalid ID (string)', async () => {
            const response = await request(app)
                .get('/api/ownerships/invalid')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('valid number');
        });
    });

    describe('GET /api/stoves/:stoveId/ownership-history', () => {
        it('should return ownership history for a stove', async () => {
            const response = await request(app)
                .get('/api/stoves/1/ownership-history')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(3);
            expect(response.body[0].ownershipId).toBe(1);
            expect(response.body[1].ownershipId).toBe(2);
            expect(response.body[2].ownershipId).toBe(3);
        });

        it('should return empty array for stove with no ownership history', async () => {
            const response = await request(app)
                .get('/api/stoves/99999/ownership-history')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        it('should return 400 for invalid stove ID', async () => {
            const response = await request(app)
                .get('/api/stoves/invalid/ownership-history')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('valid number');
        });
    });

    describe('GET /api/players/:playerId/ownerships', () => {
        it('should return all ownership records for a player', async () => {
            const response = await request(app)
                .get('/api/players/1/ownerships')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(3);
            response.body.forEach((ownership: any) => {
                expect(ownership.playerId).toBe(1);
            });
        });

        it('should return empty array for player with no ownerships', async () => {
            const db = new Database(dbPath);
            db.exec(`INSERT INTO Player (playerId, username, coins, lootboxCount, isAdmin, joinedAt) 
                     VALUES (99, 'emptyplayer', 0, 0, 0, datetime('now'))`);
            db.close();

            const response = await request(app)
                .get('/api/players/99/ownerships')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        it('should return 400 for invalid player ID', async () => {
            const response = await request(app)
                .get('/api/players/invalid/ownerships')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('valid number');
        });
    });

    describe('POST /api/ownerships', () => {
        it('should create ownership record with acquiredHow=lootbox', async () => {
            const newOwnership = {
                stoveId: 4,
                playerId: 1,
                acquiredHow: 'lootbox'
            };

            const response = await request(app)
                .post('/api/ownerships')
                .send(newOwnership)
                .expect(201);

            expect(response.body).toHaveProperty('ownershipId');
            expect(response.body).toHaveProperty('message', 'Ownership recorded successfully');
        });

        it('should create ownership record with acquiredHow=trade', async () => {
            const newOwnership = {
                stoveId: 4,
                playerId: 2,
                acquiredHow: 'trade'
            };

            const response = await request(app)
                .post('/api/ownerships')
                .send(newOwnership)
                .expect(201);

            expect(response.body).toHaveProperty('ownershipId');
            expect(response.body).toHaveProperty('message', 'Ownership recorded successfully');
        });

        it('should create ownership record with acquiredHow=mini-game', async () => {
            const newOwnership = {
                stoveId: 4,
                playerId: 3,
                acquiredHow: 'mini-game'
            };

            const response = await request(app)
                .post('/api/ownerships')
                .send(newOwnership)
                .expect(201);

            expect(response.body).toHaveProperty('ownershipId');
            expect(response.body).toHaveProperty('message', 'Ownership recorded successfully');
        });

        it('should return 400 for invalid acquiredHow value', async () => {
            const invalidOwnership = {
                stoveId: 1,
                playerId: 1,
                acquiredHow: 'stolen'
            };

            const response = await request(app)
                .post('/api/ownerships')
                .send(invalidOwnership)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('lootbox');
        });

        it('should return 400 when required fields are missing', async () => {
            const invalidOwnership = {
                playerId: 1,
                acquiredHow: 'lootbox'
            };

            const response = await request(app)
                .post('/api/ownerships')
                .send(invalidOwnership)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 when stoveId is not a number', async () => {
            const invalidOwnership = {
                stoveId: 'not-a-number',
                playerId: 1,
                acquiredHow: 'lootbox'
            };

            const response = await request(app)
                .post('/api/ownerships')
                .send(invalidOwnership)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/stoves/:stoveId/current-owner', () => {
        it('should return current owner of a stove', async () => {
            const response = await request(app)
                .get('/api/stoves/1/current-owner')
                .expect(200);

            expect(response.body).toHaveProperty('stoveId', 1);
            expect(response.body).toHaveProperty('playerId', 1);
            expect(response.body).toHaveProperty('ownershipId', 3);
        });

        it('should return 404 for stove with no ownership record', async () => {
            const response = await request(app)
                .get('/api/stoves/99999/current-owner')
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('not found');
        });

        it('should return 400 for invalid stove ID', async () => {
            const response = await request(app)
                .get('/api/stoves/invalid/current-owner')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('valid number');
        });
    });

    describe('DELETE /api/ownerships/:id', () => {
        it('should delete an existing ownership record', async () => {
            const createResponse = await request(app)
                .post('/api/ownerships')
                .send({ stoveId: 2, playerId: 3, acquiredHow: 'trade' });

            const ownershipId = createResponse.body.ownershipId;

            const response = await request(app)
                .delete(`/api/ownerships/${ownershipId}`)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Ownership record deleted');
        });

        it('should return 404 for non-existent ownership record', async () => {
            const response = await request(app)
                .delete('/api/ownerships/99999')
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('not found');
        });

        it('should return 400 for invalid ID', async () => {
            const response = await request(app)
                .delete('/api/ownerships/invalid')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('valid number');
        });
    });

    describe('GET /api/stoves/:stoveId/ownership-changes/count', () => {
        it('should return count of ownership changes for a stove', async () => {
            const response = await request(app)
                .get('/api/stoves/1/ownership-changes/count')
                .expect(200);

            expect(response.body).toHaveProperty('count', 3);
        });

        it('should return 0 for stove with no ownership changes', async () => {
            const response = await request(app)
                .get('/api/stoves/99999/ownership-changes/count')
                .expect(200);

            expect(response.body).toHaveProperty('count', 0);
        });

        it('should return 400 for invalid stove ID', async () => {
            const response = await request(app)
                .get('/api/stoves/invalid/ownership-changes/count')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('valid number');
        });
    });

    describe('GET /api/players/:playerId/acquired-stoves/count', () => {
        it('should return count of stoves acquired by a player', async () => {
            const response = await request(app)
                .get('/api/players/1/acquired-stoves/count')
                .expect(200);

            expect(response.body).toHaveProperty('count');
            expect(typeof response.body.count).toBe('number');
            expect(response.body.count).toBeGreaterThanOrEqual(3);
        });

        it('should return 0 for player with no acquired stoves', async () => {
            const db = new Database(dbPath);
            db.exec(`INSERT INTO Player (playerId, username, coins, lootboxCount, isAdmin, joinedAt) 
                     VALUES (98, 'nostoves', 0, 0, 0, datetime('now'))`);
            db.close();

            const response = await request(app)
                .get('/api/players/98/acquired-stoves/count')
                .expect(200);

            expect(response.body).toHaveProperty('count', 0);
        });

        it('should return 400 for invalid player ID', async () => {
            const response = await request(app)
                .get('/api/players/invalid/acquired-stoves/count')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('valid number');
        });
    });
});