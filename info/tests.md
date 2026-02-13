# Sprint 1 Test Plan

## Unit Tests (Bun Test Runner)

### Test File: `src/backend/services/player-service.spec.ts`
- [ ] Test: Create player with valid data succeeds
- [ ] Test: Create player with duplicate ID fails
- [ ] Test: Get player by ID returns correct player
- [ ] Test: Get player with invalid ID returns null
- [ ] Test: Update player currency succeeds
- [ ] Test: Update player with negative currency fails validation

### Test File: `src/backend/services/lootbox-service.spec.ts`
- [ ] Test: Open lootbox returns item from loot table
- [ ] Test: Open lootbox with empty inventory fails
- [ ] Test: Lootbox drop rates match configured weights
- [ ] Test: Random seed produces deterministic results for testing

### Test File: `src/backend/services/service-base.spec.ts`
- [ ] Test: Service base initializes correctly
- [ ] Test: Database connection established on init
- [ ] Test: Error handling works for failed connections

### Test File: `src/backend/utils/unit.spec.ts`
- [ ] Test: Unit conversion functions work correctly
- [ ] Test: Edge cases handled properly

### Test File: `src/backend/utils/util.spec.ts`
- [ ] Test: Utility functions return expected values
- [ ] Test: Input validation works correctly

---

## Router/Integration Tests

### Test File: `test/routerTests/playerDBTests.ts`
- [ ] Test: POST /player creates player in database
- [ ] Test: POST /player with duplicate ID returns 409
- [ ] Test: GET /player/:id returns player data
- [ ] Test: GET /player/:id with invalid ID returns 404
- [ ] Test: PATCH /player/:id/currency updates balance
- [ ] Test: Protected route without token returns 401
- [ ] Test: Protected route with valid token returns 200

### Test File: `test/routerTests/lootboxTests.ts`
- [ ] Test: POST /lootbox/open with valid lootbox returns item
- [ ] Test: POST /lootbox/open without lootbox returns 400
- [ ] Test: POST /lootbox/open deducts lootbox from inventory
- [ ] Test: POST /lootbox/open adds item to inventory
- [ ] Test: GET /lootbox/odds returns rarity percentages

---

## Database Tests

### Test File: `src/backend/db/db.spec.ts`
- [ ] Test: Database client connects successfully
- [ ] Test: Can insert player into database
- [ ] Test: Can query player data
- [ ] Test: Foreign key constraints enforced
- [ ] Test: Seed script creates loot tables without errors
- [ ] Test: Seed script creates item definitions
- [ ] Test: Running seed twice doesn't cause duplicate errors

---

## Manual Testing Checklist

- [ ] Main menu displays on launch
- [ ] Main menu "Start Game" button navigates to game
- [ ] Main menu "Exit" button closes application
- [ ] Player can view current currency balance
- [ ] Lootbox appears as item in inventory with correct icon
- [ ] Opening lootbox plays animation before revealing item
- [ ] Received item appears in inventory after opening
- [ ] Insufficient currency shows clear error message
- [ ] 1h free lootbox timer counts down correctly
- [ ] Free lootbox claimable after timer expires
- [ ] Database shows correct player-inventory relationships
- [ ] Logs show structured JSON for lootbox opens
- [ ] Error responses follow consistent format

---

## Sprint 1 Success Metrics

- [ ] All 13 backlog items completed (DoD met)
- [ ] 100% of unit tests passing
- [ ] 100% of integration tests passing
- [ ] Code coverage ≥80% for player, lootbox, and database modules
- [ ] No critical ESLint errors
- [ ] All code formatted with Prettier
- [ ] API documentation updated (Swagger)
- [ ] Sprint demo conducted with team
- [ ] Sprint retrospective held with action items documented