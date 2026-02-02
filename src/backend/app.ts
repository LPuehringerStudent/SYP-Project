import express from "express";
import path from "path";
import { Unit, ensureSampleDataInserted, resetDatabase } from "./utils/unit";
import { playerRouter } from "./routers/player-router";

// Set to true to reset database on next startup
const RESET_DB = process.env.RESET_DB === "true";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (frontend)
app.use(express.static(path.join(process.cwd(), "src/frontend")));

// API Routes
app.use("/api", playerRouter);

// Health check endpoint
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Test database connection endpoint
app.get("/api/db-test", (_req, res) => {
    let unit: Unit | null = null;
    try {
        unit = new Unit(true);
        const stmt = unit.prepare<{ count: number }>("select count(*) as count from sqlite_master");
        const result = stmt.get();
        unit.complete();
        res.json({ status: "connected", tables: result?.count ?? 0 });
    } catch (error) {
        if (unit) {
            try {
                unit.complete();
            } catch {
                // Ignore close error
            }
        }
        res.status(500).json({ status: "error", message: String(error) });
    }
});

// Initialize database and sample data before starting server
function initializeDatabase(): boolean {
    let unit: Unit | null = null;
    try {
        unit = new Unit(false);
        
        // Reset database if requested
        if (RESET_DB) {
            console.log("🔄 Resetting database...");
            resetDatabase(unit.getConnection());
            console.log("✅ Database reset complete");
        }
        
        const result = ensureSampleDataInserted(unit);
        unit.complete(true);
        console.log(`📊 Sample data: ${result}`);
        return true;
    } catch (error) {
        console.error("❌ Failed to initialize database:", error);
        if (unit) {
            try {
                unit.complete(false);
            } catch {
                // Ignore rollback error
            }
        }
        return false;
    }
}

// Start server only if database initialization succeeds
if (initializeDatabase()) {
    app.listen(PORT, () => {
        console.log(`🚀 EmberExchange server running on http://localhost:${PORT}`);
        console.log(`📁 Database: ${path.join(process.cwd(), "src", "backend", "db", "EmberExchange.db")}`);
    });
} else {
    console.error("❌ Server failed to start due to database initialization error");
    process.exit(1);
}
