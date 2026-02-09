import express from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { Unit, ensureSampleDataInserted } from "./utils/unit";
import { playerRouter } from "./routers/player-router";
import { lootboxRouter } from "./routers/lootbox-router";
import { stoveTypeRouter } from "./routers/stove-type-router";
import { stoveRouter } from "./routers/stove-router";
import { ownershipRouter } from "./routers/ownership-router";
import { priceHistoryRouter } from "./routers/price-history-router";
import { listingRouter } from "./routers/listing-router";
import { tradeRouter } from "./routers/trade-router";
import { swaggerSpec } from "./swagger";

export const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Static files (frontend)
app.use(express.static(path.join(process.cwd(), "src/frontend")));

// API Routes
app.use("/api", playerRouter);
app.use("/api", lootboxRouter);
app.use("/api", stoveTypeRouter);
app.use("/api", stoveRouter);
app.use("/api", ownershipRouter);
app.use("/api", priceHistoryRouter);
app.use("/api", listingRouter);
app.use("/api", tradeRouter);

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
            try { unit.complete(); } catch { /* ignore */ }
        }
        res.status(500).json({ status: "error", message: String(error) });
    }
});

// Start server first, then initialize DB
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 EmberExchange server running on http://localhost:${PORT}`);
        initDb();
    });
}

function initDb(): void {
    let unit: Unit | null = null;
    try {
        unit = new Unit(false);
        const result = ensureSampleDataInserted(unit);
        if (result === "inserted") {
            console.log("Sample data inserted");
            unit.complete(true);
        } else {
            console.log("Sample data skipped (already exists)");
            unit.complete(false);
        }
    } catch (error) {
        console.error("Database initialization failed:", error);
        if (unit) {
            try { unit.complete(false); } catch { /* ignore */ }
        }
    }
}
