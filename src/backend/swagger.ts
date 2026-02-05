import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "EmberExchange API",
            version: "1.0.0",
            description: "REST API for EmberExchange - Virtual Stove Market Game",
        },
        servers: [
            {
                url: "http://localhost:3000/api",
                description: "Development server",
            },
        ],
        components: {
            schemas: {
                Player: {
                    type: "object",
                    properties: {
                        playerId: { type: "integer", description: "Unique player ID" },
                        username: { type: "string", description: "Player username" },
                        coins: { type: "integer", description: "Player coin balance" },
                        lootboxCount: { type: "integer", description: "Number of lootboxes owned" },
                        isAdmin: { type: "integer", description: "Admin flag (0 = false, 1 = true)" },
                        joinedAt: { type: "string", format: "date-time", description: "Join timestamp" },
                    },
                    required: ["playerId", "username", "coins", "lootboxCount", "isAdmin", "joinedAt"],
                },
                Error: {
                    type: "object",
                    properties: {
                        error: { type: "string", description: "Error message" },
                    },
                },
            },
        },
    },
    apis: ["./src/backend/routers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
