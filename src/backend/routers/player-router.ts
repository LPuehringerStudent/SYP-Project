import express from "express";
import { Unit } from "../utils/unit";
import { PlayerService } from "../services/player-service";
import { StatusCodes } from "http-status-codes";
import { isNullOrWhiteSpace } from "../utils/util";

export const playerRouter = express.Router();

// Get all players
playerRouter.get("/players", (_req, res) => {
    const unit = new Unit(true);
    const service = new PlayerService(unit);

    try {
        const response = service.getAllPlayers();
        res.status(StatusCodes.OK).json(response);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: String(err) });
    } finally {
        unit.complete();
    }
});

// Get player by ID
playerRouter.get("/players/:id", (req, res) => {
    const unit = new Unit(true);
    const service = new PlayerService(unit);
    const id = req.params.id;

    try {
        if (isNullOrWhiteSpace(id) || isNaN(Number(id))) {
            res.status(StatusCodes.BAD_REQUEST).json({
                error: "ID must be a valid number"
            });
            return;
        }

        const response = service.getInfoByID(Number(id));
        if (response === null) {
            res.status(StatusCodes.NOT_FOUND).json({ error: "Player not found" });
        } else {
            res.status(StatusCodes.OK).json(response);
        }
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: String(err) });
    } finally {
        unit.complete();
    }
});

// Create new player
playerRouter.post("/players", (req, res) => {
    const unit = new Unit(false);
    const service = new PlayerService(unit);

    try {
        const { username, coins, lootboxCount } = req.body;

        if (isNullOrWhiteSpace(username)) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: "Username is required" });
            return;
        }

        // Check if username already exists
        const existing = service.getPlayerByUsername(username);
        if (existing !== null) {
            res.status(StatusCodes.CONFLICT).json({ error: "Username already exists" });
            return;
        }

        const [success, id] = service.createPlayer(
            username,
            coins ?? 1000,
            lootboxCount ?? 10
        );

        if (success) {
            unit.complete(true);
            res.status(StatusCodes.CREATED).json({ playerId: id, username });
        } else {
            unit.complete(false);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to create player" });
        }
    } catch (err) {
        unit.complete(false);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: String(err) });
    }
});

// Update player coins
playerRouter.patch("/players/:id/coins", (req, res) => {
    const unit = new Unit(false);
    const service = new PlayerService(unit);
    const id = req.params.id;

    try {
        if (isNullOrWhiteSpace(id) || isNaN(Number(id))) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: "ID must be a valid number" });
            return;
        }

        const { coins } = req.body;
        if (typeof coins !== "number" || coins < 0) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: "Coins must be a non-negative number" });
            return;
        }

        const success = service.updatePlayerCoins(Number(id), coins);
        if (success) {
            unit.complete(true);
            res.status(StatusCodes.OK).json({ message: "Coins updated" });
        } else {
            unit.complete(false);
            res.status(StatusCodes.NOT_FOUND).json({ error: "Player not found" });
        }
    } catch (err) {
        unit.complete(false);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: String(err) });
    }
});

// Update player lootbox count
playerRouter.patch("/players/:id/lootboxes", (req, res) => {
    const unit = new Unit(false);
    const service = new PlayerService(unit);
    const id = req.params.id;

    try {
        if (isNullOrWhiteSpace(id) || isNaN(Number(id))) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: "ID must be a valid number" });
            return;
        }

        const { lootboxCount } = req.body;
        if (typeof lootboxCount !== "number" || lootboxCount < 0) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: "LootboxCount must be a non-negative number" });
            return;
        }

        const success = service.updatePlayerLootboxCount(Number(id), lootboxCount);
        if (success) {
            unit.complete(true);
            res.status(StatusCodes.OK).json({ message: "Lootbox count updated" });
        } else {
            unit.complete(false);
            res.status(StatusCodes.NOT_FOUND).json({ error: "Player not found" });
        }
    } catch (err) {
        unit.complete(false);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: String(err) });
    }
});

// Delete player
playerRouter.delete("/players/:id", (req, res) => {
    const unit = new Unit(false);
    const service = new PlayerService(unit);
    const id = req.params.id;

    try {
        if (isNullOrWhiteSpace(id) || isNaN(Number(id))) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: "ID must be a valid number" });
            return;
        }

        const success = service.deletePlayer(Number(id));
        if (success) {
            unit.complete(true);
            res.status(StatusCodes.OK).json({ message: "Player deleted" });
        } else {
            unit.complete(false);
            res.status(StatusCodes.NOT_FOUND).json({ error: "Player not found" });
        }
    } catch (err) {
        unit.complete(false);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: String(err) });
    }
});
