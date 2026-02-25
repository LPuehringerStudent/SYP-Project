import path from 'path';
import fs from 'fs';


const dbDir = path.join(process.cwd(), 'src', 'backend', 'db');
const dbPath = path.join(dbDir, 'EmberExchange-test-listing.db');

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

// Import app after setting TEST_DB_PATH
import { app } from '../../backend/app';
import request from 'supertest';
import Database from 'better-sqlite3';

describe('Listing API Endpoints', () => {
    beforeAll(() => {
        // Create database schema by initializing the database
        const db = new Database(dbPath, { fileMustExist: false });
        db.pragma('foreign_keys = ON');

        // Create all required tables
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

        // Insert test data
        db.exec(`
            INSERT INTO Player (playerId, username, password, email, coins, lootboxCount, isAdmin, joinedAt) VALUES 
            (1, 'seller1', 'password123', 'seller1@test.com', 5000, 10, 0, datetime('now')),
            (2, 'seller2', 'password123', 'seller2@test.com', 3000, 5, 0, datetime('now')),
            (3, 'buyer1', 'password123', 'buyer1@test.com', 10000, 0, 0, datetime('now'))
        `);

        db.exec(`
            INSERT INTO StoveType (typeId, name, imageUrl, rarity, lootboxWeight) VALUES 
            (1, 'Test Stove', '/images/test.png', 'common', 100)
        `);

        db.exec(`
            INSERT INTO Stove (stoveId, typeId, currentOwnerId, mintedAt) VALUES 
            (1, 1, 1, datetime('now')),
            (2, 1, 1, datetime('now')),
            (3, 1, 2, datetime('now')),
            (4, 1, 1, datetime('now'))
        `);

        // Insert test listings
        db.exec(`
            INSERT INTO Listing (listingId, sellerId, stoveId, price, listedAt, status) VALUES 
            (1, 1, 1, 5000, datetime('now'), 'active'),
            (2, 1, 2, 10000, datetime('now'), 'active'),
            (3, 2, 3, 7500, datetime('now'), 'sold'),
            (4, 1, 4, 3000, datetime('now', '-1 day'), 'cancelled')
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

    describe('GET /api/listings', () => {
        it('should return all listings', async () => {
            const response = await request(app)
                .get('/api/listings')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(4);
            expect(response.body[0]).toHaveProperty('listingId');
            expect(response.body[0]).toHaveProperty('sellerId');
            expect(response.body[0]).toHaveProperty('stoveId');
            expect(response.body[0]).toHaveProperty('price');
            expect(response.body[0]).toHaveProperty('status');
        });
    });

    describe('GET /api/listings/active', () => {
        it('should return only active listings', async () => {
            const response = await request(app)
                .get('/api/listings/active')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(2);
            response.body.forEach((listing: any) => {
                expect(listing.status).toBe('active');
            });
        });
    });

    describe('GET /api/listings/:id', () => {
        it('should return a listing by valid ID', async () => {
            const response = await request(app)
                .get('/api/listings/1')
                .expect(200);

            expect(response.body).toHaveProperty('listingId', 1);
            expect(response.body).toHaveProperty('sellerId', 1);
            expect(response.body).toHaveProperty('stoveId', 1);
            expect(response.body).toHaveProperty('price', 5000);
            expect(response.body).toHaveProperty('status', 'active');
        });

        it('should return 404 for non-existent listing ID', async () => {
            const response = await request(app)
                .get('/api/listings/99999')
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('not found');
        });

        it('should return 400 for invalid ID (string)', async () => {
            const response = await request(app)
                .get('/api/listings/invalid')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('valid number');
        });
    });

    describe('GET /api/players/:sellerId/listings', () => {
        it('should return all listings for a specific seller', async () => {
            const response = await request(app)
                .get('/api/players/1/listings')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(3);
            response.body.forEach((listing: any) => {
                expect(listing.sellerId).toBe(1);
            });
        });

        it('should return empty array for seller with no listings', async () => {
            const response = await request(app)
                .get('/api/players/3/listings')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        it('should return 400 for invalid seller ID', async () => {
            const response = await request(app)
                .get('/api/players/invalid/listings')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('valid number');
        });
    });

    describe('GET /api/players/:sellerId/listings/active', () => {
        it('should return only active listings for a specific seller', async () => {
            const response = await request(app)
                .get('/api/players/1/listings/active')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(2);
            response.body.forEach((listing: any) => {
                expect(listing.sellerId).toBe(1);
                expect(listing.status).toBe('active');
            });
        });
    });

    describe('GET /api/stoves/:stoveId/listing', () => {
        it('should return active listing for a stove', async () => {
            const response = await request(app)
                .get('/api/stoves/1/listing')
                .expect(200);

            expect(response.body).toHaveProperty('stoveId', 1);
            expect(response.body).toHaveProperty('status', 'active');
        });

        it('should return 404 for stove with no active listing', async () => {
            const response = await request(app)
                .get('/api/stoves/99999/listing')
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('no active listing');
        });

        it('should return 400 for invalid stove ID', async () => {
            const response = await request(app)
                .get('/api/stoves/invalid/listing')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('valid number');
        });
    });

    describe('POST /api/listings', () => {
        it('should create a new listing with valid data', async () => {
            const newListing = {
                sellerId: 1,
                stoveId: 4,
                price: 4500
            };

            const response = await request(app)
                .post('/api/listings')
                .send(newListing)
                .expect(201);

            expect(response.body).toHaveProperty('listingId');
            expect(response.body).toHaveProperty('message', 'Listing created successfully');
            expect(typeof response.body.listingId).toBe('number');
        });

        it('should return 400 when required fields are missing', async () => {
            const invalidListing = {
                sellerId: 1
            };

            const response = await request(app)
                .post('/api/listings')
                .send(invalidListing)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('required');
        });

        it('should return 400 when price is negative', async () => {
            const invalidListing = {
                sellerId: 1,
                stoveId: 2,
                price: -100
            };

            const response = await request(app)
                .post('/api/listings')
                .send(invalidListing)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('positive');
        });

        it('should return 400 when price is zero', async () => {
            const invalidListing = {
                sellerId: 1,
                stoveId: 2,
                price: 0
            };

            const response = await request(app)
                .post('/api/listings')
                .send(invalidListing)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('positive');
        });

        it('should return 400 when stove is already listed', async () => {
            const duplicateListing = {
                sellerId: 1,
                stoveId: 1,
                price: 3000
            };

            const response = await request(app)
                .post('/api/listings')
                .send(duplicateListing)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('already listed');
        });
    });

    describe('PATCH /api/listings/:id/price', () => {
        it('should update listing price successfully', async () => {
            const updateData = {
                price: 6000
            };

            const response = await request(app)
                .patch('/api/listings/1/price')
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Price updated');
        });

        it('should return 404 for non-existent listing', async () => {
            const updateData = {
                price: 5000
            };

            const response = await request(app)
                .patch('/api/listings/99999/price')
                .send(updateData)
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('not found');
        });

        it('should return 400 for invalid ID', async () => {
            const updateData = {
                price: 5000
            };

            const response = await request(app)
                .patch('/api/listings/invalid/price')
                .send(updateData)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('valid number');
        });

        it('should return 400 when price is negative', async () => {
            const updateData = {
                price: -50
            };

            const response = await request(app)
                .patch('/api/listings/1/price')
                .send(updateData)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('positive');
        });

        it('should return 400 when price is missing', async () => {
            const response = await request(app)
                .patch('/api/listings/1/price')
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('PATCH /api/listings/:id/cancel', () => {
        it('should cancel an active listing', async () => {
            const response = await request(app)
                .patch('/api/listings/2/cancel')
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Listing cancelled');
        });

        it('should return 404 for non-existent listing', async () => {
            const response = await request(app)
                .patch('/api/listings/99999/cancel')
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('not found');
        });

        it('should return 400 for invalid ID', async () => {
            const response = await request(app)
                .patch('/api/listings/invalid/cancel')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('valid number');
        });
    });

    describe('DELETE /api/listings/:id', () => {
        it('should delete an existing listing', async () => {
            const createResponse = await request(app)
                .post('/api/listings')
                .send({ sellerId: 2, stoveId: 3, price: 2000 });

            const listingId = createResponse.body.listingId;

            const response = await request(app)
                .delete(`/api/listings/${listingId}`)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Listing deleted');
        });

        it('should return 404 for non-existent listing', async () => {
            const response = await request(app)
                .delete('/api/listings/99999')
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('not found');
        });

        it('should return 400 for invalid ID', async () => {
            const response = await request(app)
                .delete('/api/listings/invalid')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('valid number');
        });
    });

    describe('GET /api/players/:sellerId/active-listings/count', () => {
        it('should return count of active listings for a seller', async () => {
            const response = await request(app)
                .get('/api/players/1/active-listings/count')
                .expect(200);

            expect(response.body).toHaveProperty('count');
            expect(typeof response.body.count).toBe('number');
            expect(response.body.count).toBeGreaterThanOrEqual(0);
        });

        it('should return 400 for invalid seller ID', async () => {
            const response = await request(app)
                .get('/api/players/invalid/active-listings/count')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.toLowerCase()).toContain('valid number');
        });
    });
});