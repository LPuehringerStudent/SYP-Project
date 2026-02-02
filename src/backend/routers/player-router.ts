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
