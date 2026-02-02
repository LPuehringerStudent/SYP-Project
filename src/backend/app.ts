import express from "express";
import path from "path";
import { Unit, ensureSampleDataInserted } from "./utils/unit";
import { playerRouter } from "./routers/player-router";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (frontend)
app.use(express.static(path.join(process.cwd(), "src/frontend")));

// API Routes
app.use(playerRouter);

// Health check endpoint
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Test database connection endpoint
app.get("/api/db-test", (_req, res) => {
    try {
        const unit = new Unit(true);
        const stmt = unit.prepare<{ count: number }>("select count(*) as count from sqlite_master");
        const result = stmt.get();
        unit.complete();
        res.json({ status: "connected", tables: result?.count ?? 0 });
    } catch (error) {
        res.status(500).json({ status: "error", message: String(error) });
    }
});

// Initialize sample data (admin account)
const unit = new Unit(false);
const result = ensureSampleDataInserted(unit);
unit.complete(true);
console.log(`📊 Sample data: ${result}`);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 EmberExchange server running on http://localhost:${PORT}`);
    console.log(`📁 Database: ${path.join(process.cwd(), "src", "backend", "db", "EmberExchange.db")}`);
});
