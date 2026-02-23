// Set test database to use a unique file for test isolation
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'src', 'backend', 'db');
const dbPath = path.join(dbDir, 'EmberExchange-test.db');

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
import request from 'supertest';
import { app } from '../../backend/app';
import Database from 'better-sqlite3';

describe('Player API Endpoints', () => {
    beforeAll(() => {
        // Create database schema by initializing the database
        const db = new Database(dbPath, { fileMustExist: false });
        db.pragma('foreign_keys = ON');
        
        // Create Player table
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
        
        // Insert admin test data
        db.exec(`
            INSERT INTO Player (playerId, username, coins, lootboxCount, isAdmin, joinedAt)
            VALUES (1, 'admin', 999999, 100, 1, datetime('now'))
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

    describe('GET /api/players', () => {
        it('should return all players', async () => {
            const response = await request(app)
                .get('/api/players')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(1);
            expect(response.body[0]).toHaveProperty('playerId');
            expect(response.body[0]).toHaveProperty('username');
            expect(response.body[0]).toHaveProperty('coins');
            expect(response.body[0]).toHaveProperty('lootboxCount');
        });
    });

    describe('GET /api/players/:id', () => {
        it('should return a player by valid ID', async () => {
            const response = await request(app)
                .get('/api/players/1')
                .expect(200);

            expect(response.body).toHaveProperty('playerId', 1);
            expect(response.body).toHaveProperty('username', 'admin');
            expect(response.body).toHaveProperty('coins', 999999);
            expect(response.body).toHaveProperty('lootboxCount', 100);
            expect(response.body).toHaveProperty('isAdmin', 1);
        });

        it('should return 404 for non-existent player ID', async () => {
            const response = await request(app)
                .get('/api/players/99999')
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('not found');
        });

        it('should return 400 for invalid ID (string)', async () => {
            const response = await request(app)
                .get('/api/players/invalid')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('valid number');
        });

        it('should return 404 for negative ID (treated as non-existent)', async () => {
            // The router accepts negative numbers as valid IDs (they're still numbers)
            // and returns 404 because no player exists with that ID
            const response = await request(app)
                .get('/api/players/-1')
                .expect(404);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/players', () => {
        it('should create a new player with valid data', async () => {
            const newPlayer = {
                username: 'testplayer',
                coins: 500,
                lootboxCount: 5
            };

            const response = await request(app)
                .post('/api/players')
                .send(newPlayer)
                .expect(201);

            expect(response.body).toHaveProperty('playerId');
            expect(response.body).toHaveProperty('username', 'testplayer');
            expect(typeof response.body.playerId).toBe('number');
        });

        it('should create a player with default values when optional fields omitted', async () => {
            const newPlayer = {
                username: 'defaultplayer'
            };

            const response = await request(app)
                .post('/api/players')
                .send(newPlayer)
                .expect(201);

            expect(response.body).toHaveProperty('playerId');
            expect(response.body).toHaveProperty('username', 'defaultplayer');
        });

        it('should return 409 for duplicate username', async () => {
            const duplicatePlayer = {
                username: 'admin',
                coins: 1000
            };

            const response = await request(app)
                .post('/api/players')
                .send(duplicatePlayer)
                .expect(409);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('already exists');
        });

        it('should return 400 when username is missing', async () => {
            const invalidPlayer = {
                coins: 1000
            };

            const response = await request(app)
                .post('/api/players')
                .send(invalidPlayer)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Username is required');
        });

        it('should return 400 when username is empty string', async () => {
            const invalidPlayer = {
                username: '',
                coins: 1000
            };

            const response = await request(app)
                .post('/api/players')
                .send(invalidPlayer)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 when username is whitespace only', async () => {
            const invalidPlayer = {
                username: '   ',
                coins: 1000
            };

            const response = await request(app)
                .post('/api/players')
                .send(invalidPlayer)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('PATCH /api/players/:id/coins', () => {
        it('should update player coins successfully', async () => {
            // Use the existing admin player (ID 1) for the update
            const updateData = {
                coins: 500000
            };

            const response = await request(app)
                .patch('/api/players/1/coins')
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Coins updated');
        });

        it('should return 404 for non-existent player', async () => {
            const updateData = {
                coins: 100
            };

            const response = await request(app)
                .patch('/api/players/99999/coins')
                .send(updateData)
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('not found');
        });

        it('should return 400 for invalid ID', async () => {
            const updateData = {
                coins: 100
            };

            const response = await request(app)
                .patch('/api/players/invalid/coins')
                .send(updateData)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 when coins is negative', async () => {
            const updateData = {
                coins: -100
            };

            const response = await request(app)
                .patch('/api/players/1/coins')
                .send(updateData)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('non-negative');
        });

        it('should return 400 when coins is not a number', async () => {
            const updateData = {
                coins: 'not-a-number'
            };

            const response = await request(app)
                .patch('/api/players/1/coins')
                .send(updateData)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 when coins field is missing', async () => {
            const updateData = {};

            const response = await request(app)
                .patch('/api/players/1/coins')
                .send(updateData)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('PATCH /api/players/:id/lootboxes', () => {
        it('should update player lootbox count successfully', async () => {
            // Use the existing admin player (ID 1) for the update
            const updateData = {
                lootboxCount: 50
            };

            const response = await request(app)
                .patch('/api/players/1/lootboxes')
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Lootbox count updated');
        });

        it('should return 404 for non-existent player', async () => {
            const updateData = {
                lootboxCount: 10
            };

            const response = await request(app)
                .patch('/api/players/99999/lootboxes')
                .send(updateData)
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('not found');
        });

        it('should return 400 for invalid ID', async () => {
            const updateData = {
                lootboxCount: 10
            };

            const response = await request(app)
                .patch('/api/players/invalid/lootboxes')
                .send(updateData)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 when lootboxCount is negative', async () => {
            const updateData = {
                lootboxCount: -5
            };

            const response = await request(app)
                .patch('/api/players/1/lootboxes')
                .send(updateData)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('non-negative');
        });

        it('should return 400 when lootboxCount is not a number', async () => {
            const updateData = {
                lootboxCount: 'ten'
            };

            const response = await request(app)
                .patch('/api/players/1/lootboxes')
                .send(updateData)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should return 400 when lootboxCount field is missing', async () => {
            const updateData = {};

            const response = await request(app)
                .patch('/api/players/1/lootboxes')
                .send(updateData)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('DELETE /api/players/:id', () => {
        it('should delete an existing player', async () => {
            // First create a test player using the API
            const createResponse = await request(app)
                .post('/api/players')
                .send({ username: 'deletetest', coins: 1000, lootboxCount: 10 });
            
            const playerId = createResponse.body.playerId;

            const response = await request(app)
                .delete(`/api/players/${playerId}`)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Player deleted');
        });

        it('should return 404 for non-existent player', async () => {
            const response = await request(app)
                .delete('/api/players/99999')
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('not found');
        });

        it('should return 400 for invalid ID', async () => {
            const response = await request(app)
                .delete('/api/players/invalid')
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should return 404 for negative ID (treated as non-existent)', async () => {
            // The router accepts negative numbers as valid IDs (they're still numbers)
            // and returns 404 because no player exists with that ID
            const response = await request(app)
                .delete('/api/players/-1')
                .expect(404);

            expect(response.body).toHaveProperty('error');
        });
    });
});
