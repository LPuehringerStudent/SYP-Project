import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Player fetcher
import {
  getAllPlayers, getPlayerById, createPlayer, updatePlayerCoins,
  updatePlayerLootboxCount, deletePlayer, Player
} from '../fetchers/player.fetcher';

// Lootbox fetcher
import {
  getAllLootboxes, getLootboxById, getLootboxesByPlayerId, createLootbox,
  deleteLootbox, getAllLootboxTypes, getAvailableLootboxTypes, getLootboxTypeById,
  getDropsByLootboxId, createLootboxDrop, Lootbox, LootboxType, LootboxDrop
} from '../fetchers/lootbox.fetcher';

// Stove Type fetcher
import {
  getAllStoveTypes, getStoveTypeById, getStoveTypesByRarity, createStoveType,
  updateStoveTypeWeight, updateStoveTypeImage, deleteStoveType, getTotalLootboxWeight,
  StoveType, Rarity
} from '../fetchers/stove-type.fetcher';

// Stove fetcher
import {
  getAllStoves, getStoveById, getStovesByPlayerId, getStovesByTypeId, createStove,
  transferStoveOwnership, deleteStove, countStovesByPlayer, countStovesByType, Stove
} from '../fetchers/stove.fetcher';

// Ownership fetcher
import {
  getAllOwnerships, getOwnershipById, getOwnershipHistoryByStoveId, getOwnershipsByPlayerId,
  createOwnership, getCurrentOwner, deleteOwnership, countOwnershipChanges,
  countStovesAcquiredByPlayer, Ownership
} from '../fetchers/ownership.fetcher';

// Price History fetcher
import {
  getAllPriceHistory, getPriceHistoryById, getPriceHistoryByTypeId, recordSale,
  getPriceStats, getRecentPrices, deletePriceHistory, PriceHistory
} from '../fetchers/price-history.fetcher';

// Listing fetcher
import {
  getAllListings, getActiveListings, getListingById, getListingsBySellerId,
  getActiveListingsBySellerId, getActiveListingByStoveId, createListing,
  updateListingPrice, cancelListing, deleteListing, countActiveListingsBySeller, Listing
} from '../fetchers/listing.fetcher';

// Trade fetcher
import {
  getAllTrades, getTradeById, getTradeByListingId, getTradesByBuyerId, executeTrade,
  getRecentTrades, deleteTrade, countTrades, countTradesByBuyer, Trade
} from '../fetchers/trade.fetcher';

@Component({
  selector: 'app-test-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: monospace;">
      <h1>API Test Page</h1>
      <p>Open browser console to see results</p>
      
      <div style="margin-bottom: 30px;">
        <h2>Player</h2>
        <button (click)="testGetAllPlayers()">getAllPlayers()</button>
        <button (click)="testGetPlayerById()">getPlayerById(1)</button>
        <button (click)="testCreatePlayer()">createPlayer('test')</button>
        <button (click)="testUpdatePlayerCoins()">updatePlayerCoins(1, 999)</button>
        <button (click)="testUpdatePlayerLootboxCount()">updatePlayerLootboxCount(1, 5)</button>
        <button (click)="testDeletePlayer()">deletePlayer(999)</button>
      </div>

      <div style="margin-bottom: 30px;">
        <h2>Lootbox</h2>
        <button (click)="testGetAllLootboxes()">getAllLootboxes()</button>
        <button (click)="testGetLootboxById()">getLootboxById(1)</button>
        <button (click)="testGetLootboxesByPlayerId()">getLootboxesByPlayerId(1)</button>
        <button (click)="testCreateLootbox()">createLootbox(1, 1, 'free')</button>
        <button (click)="testDeleteLootbox()">deleteLootbox(999)</button>
      </div>

      <div style="margin-bottom: 30px;">
        <h2>LootboxType</h2>
        <button (click)="testGetAllLootboxTypes()">getAllLootboxTypes()</button>
        <button (click)="testGetAvailableLootboxTypes()">getAvailableLootboxTypes()</button>
        <button (click)="testGetLootboxTypeById()">getLootboxTypeById(1)</button>
      </div>

      <div style="margin-bottom: 30px;">
        <h2>LootboxDrop</h2>
        <button (click)="testGetDropsByLootboxId()">getDropsByLootboxId(1)</button>
        <button (click)="testCreateLootboxDrop()">createLootboxDrop(1, 1)</button>
      </div>

      <div style="margin-bottom: 30px;">
        <h2>StoveType</h2>
        <button (click)="testGetAllStoveTypes()">getAllStoveTypes()</button>
        <button (click)="testGetStoveTypeById()">getStoveTypeById(1)</button>
        <button (click)="testGetStoveTypesByRarity()">getStoveTypesByRarity('common')</button>
        <button (click)="testCreateStoveType()">createStoveType('Test', '/img.png', 'common', 10)</button>
        <button (click)="testUpdateStoveTypeWeight()">updateStoveTypeWeight(1, 20)</button>
        <button (click)="testUpdateStoveTypeImage()">updateStoveTypeImage(1, '/new.png')</button>
        <button (click)="testDeleteStoveType()">deleteStoveType(999)</button>
        <button (click)="testGetTotalLootboxWeight()">getTotalLootboxWeight()</button>
      </div>

      <div style="margin-bottom: 30px;">
        <h2>Stove</h2>
        <button (click)="testGetAllStoves()">getAllStoves()</button>
        <button (click)="testGetStoveById()">getStoveById(1)</button>
        <button (click)="testGetStovesByPlayerId()">getStovesByPlayerId(1)</button>
        <button (click)="testGetStovesByTypeId()">getStovesByTypeId(1)</button>
        <button (click)="testCreateStove()">createStove(1, 1)</button>
        <button (click)="testTransferStoveOwnership()">transferStoveOwnership(1, 2)</button>
        <button (click)="testDeleteStove()">deleteStove(999)</button>
        <button (click)="testCountStovesByPlayer()">countStovesByPlayer(1)</button>
        <button (click)="testCountStovesByType()">countStovesByType(1)</button>
      </div>

      <div style="margin-bottom: 30px;">
        <h2>Ownership</h2>
        <button (click)="testGetAllOwnerships()">getAllOwnerships()</button>
        <button (click)="testGetOwnershipById()">getOwnershipById(1)</button>
        <button (click)="testGetOwnershipHistoryByStoveId()">getOwnershipHistoryByStoveId(1)</button>
        <button (click)="testGetOwnershipsByPlayerId()">getOwnershipsByPlayerId(1)</button>
        <button (click)="testCreateOwnership()">createOwnership(1, 1, 'lootbox')</button>
        <button (click)="testGetCurrentOwner()">getCurrentOwner(1)</button>
        <button (click)="testDeleteOwnership()">deleteOwnership(999)</button>
        <button (click)="testCountOwnershipChanges()">countOwnershipChanges(1)</button>
        <button (click)="testCountStovesAcquiredByPlayer()">countStovesAcquiredByPlayer(1)</button>
      </div>

      <div style="margin-bottom: 30px;">
        <h2>PriceHistory</h2>
        <button (click)="testGetAllPriceHistory()">getAllPriceHistory()</button>
        <button (click)="testGetPriceHistoryById()">getPriceHistoryById(1)</button>
        <button (click)="testGetPriceHistoryByTypeId()">getPriceHistoryByTypeId(1)</button>
        <button (click)="testRecordSale()">recordSale(1, 5000)</button>
        <button (click)="testGetPriceStats()">getPriceStats(1)</button>
        <button (click)="testGetRecentPrices()">getRecentPrices(1, 5)</button>
        <button (click)="testDeletePriceHistory()">deletePriceHistory(999)</button>
      </div>

      <div style="margin-bottom: 30px;">
        <h2>Listing</h2>
        <button (click)="testGetAllListings()">getAllListings()</button>
        <button (click)="testGetActiveListings()">getActiveListings()</button>
        <button (click)="testGetListingById()">getListingById(1)</button>
        <button (click)="testGetListingsBySellerId()">getListingsBySellerId(1)</button>
        <button (click)="testGetActiveListingsBySellerId()">getActiveListingsBySellerId(1)</button>
        <button (click)="testGetActiveListingByStoveId()">getActiveListingByStoveId(1)</button>
        <button (click)="testCreateListing()">createListing(1, 1, 1000)</button>
        <button (click)="testUpdateListingPrice()">updateListingPrice(1, 2000)</button>
        <button (click)="testCancelListing()">cancelListing(1)</button>
        <button (click)="testDeleteListing()">deleteListing(999)</button>
        <button (click)="testCountActiveListingsBySeller()">countActiveListingsBySeller(1)</button>
      </div>

      <div style="margin-bottom: 30px;">
        <h2>Trade</h2>
        <button (click)="testGetAllTrades()">getAllTrades()</button>
        <button (click)="testGetTradeById()">getTradeById(1)</button>
        <button (click)="testGetTradeByListingId()">getTradeByListingId(1)</button>
        <button (click)="testGetTradesByBuyerId()">getTradesByBuyerId(1)</button>
        <button (click)="testExecuteTrade()">executeTrade(1, 2)</button>
        <button (click)="testGetRecentTrades()">getRecentTrades(5)</button>
        <button (click)="testDeleteTrade()">deleteTrade(999)</button>
        <button (click)="testCountTrades()">countTrades()</button>
        <button (click)="testCountTradesByBuyer()">countTradesByBuyer(1)</button>
      </div>

      <div style="margin-top: 30px; padding: 10px; background: #f0f0f0;">
        <h3>Result:</h3>
        <pre>{{ lastResult | json }}</pre>
      </div>
    </div>
  `,
  styles: [`
    button {
      margin: 5px;
      padding: 8px 12px;
      cursor: pointer;
      font-family: monospace;
      font-size: 12px;
    }
    h2 {
      margin-top: 20px;
      margin-bottom: 10px;
      font-size: 16px;
      border-bottom: 1px solid #ccc;
      padding-bottom: 5px;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  `]
})
export class TestPageComponent {
  lastResult: unknown = null;

  private async call<T>(fn: () => Promise<T>, label: string): Promise<void> {
    console.log(`Calling: ${label}`);
    try {
      const result = await fn();
      console.log('Success:', result);
      this.lastResult = { success: true, data: result };
    } catch (err) {
      console.error('Error:', err);
      this.lastResult = { success: false, error: String(err) };
    }
  }

  // Player
  testGetAllPlayers() { this.call(() => getAllPlayers(), 'getAllPlayers'); }
  testGetPlayerById() { this.call(() => getPlayerById(1), 'getPlayerById(1)'); }
  testCreatePlayer() { this.call(() => createPlayer('test_' + Date.now()), 'createPlayer'); }
  testUpdatePlayerCoins() { this.call(() => updatePlayerCoins(1, 999), 'updatePlayerCoins(1, 999)'); }
  testUpdatePlayerLootboxCount() { this.call(() => updatePlayerLootboxCount(1, 5), 'updatePlayerLootboxCount(1, 5)'); }
  testDeletePlayer() { this.call(() => deletePlayer(999), 'deletePlayer(999)'); }

  // Lootbox
  testGetAllLootboxes() { this.call(() => getAllLootboxes(), 'getAllLootboxes'); }
  testGetLootboxById() { this.call(() => getLootboxById(1), 'getLootboxById(1)'); }
  testGetLootboxesByPlayerId() { this.call(() => getLootboxesByPlayerId(1), 'getLootboxesByPlayerId(1)'); }
  testCreateLootbox() { this.call(() => createLootbox(1, 1, 'free'), 'createLootbox(1, 1, free)'); }
  testDeleteLootbox() { this.call(() => deleteLootbox(999), 'deleteLootbox(999)'); }

  // LootboxType
  testGetAllLootboxTypes() { this.call(() => getAllLootboxTypes(), 'getAllLootboxTypes'); }
  testGetAvailableLootboxTypes() { this.call(() => getAvailableLootboxTypes(), 'getAvailableLootboxTypes'); }
  testGetLootboxTypeById() { this.call(() => getLootboxTypeById(1), 'getLootboxTypeById(1)'); }

  // LootboxDrop
  testGetDropsByLootboxId() { this.call(() => getDropsByLootboxId(1), 'getDropsByLootboxId(1)'); }
  testCreateLootboxDrop() { this.call(() => createLootboxDrop(1, 1), 'createLootboxDrop(1, 1)'); }

  // StoveType
  testGetAllStoveTypes() { this.call(() => getAllStoveTypes(), 'getAllStoveTypes'); }
  testGetStoveTypeById() { this.call(() => getStoveTypeById(1), 'getStoveTypeById(1)'); }
  testGetStoveTypesByRarity() { this.call(() => getStoveTypesByRarity(Rarity.COMMON), 'getStoveTypesByRarity(common)'); }
  testCreateStoveType() { this.call(() => createStoveType('Test_' + Date.now(), '/img.png', Rarity.COMMON, 10), 'createStoveType'); }
  testUpdateStoveTypeWeight() { this.call(() => updateStoveTypeWeight(1, 20), 'updateStoveTypeWeight(1, 20)'); }
  testUpdateStoveTypeImage() { this.call(() => updateStoveTypeImage(1, '/new.png'), 'updateStoveTypeImage(1, /new.png)'); }
  testDeleteStoveType() { this.call(() => deleteStoveType(999), 'deleteStoveType(999)'); }
  testGetTotalLootboxWeight() { this.call(() => getTotalLootboxWeight(), 'getTotalLootboxWeight'); }

  // Stove
  testGetAllStoves() { this.call(() => getAllStoves(), 'getAllStoves'); }
  testGetStoveById() { this.call(() => getStoveById(1), 'getStoveById(1)'); }
  testGetStovesByPlayerId() { this.call(() => getStovesByPlayerId(1), 'getStovesByPlayerId(1)'); }
  testGetStovesByTypeId() { this.call(() => getStovesByTypeId(1), 'getStovesByTypeId(1)'); }
  testCreateStove() { this.call(() => createStove(1, 1), 'createStove(1, 1)'); }
  testTransferStoveOwnership() { this.call(() => transferStoveOwnership(1, 2), 'transferStoveOwnership(1, 2)'); }
  testDeleteStove() { this.call(() => deleteStove(999), 'deleteStove(999)'); }
  testCountStovesByPlayer() { this.call(() => countStovesByPlayer(1), 'countStovesByPlayer(1)'); }
  testCountStovesByType() { this.call(() => countStovesByType(1), 'countStovesByType(1)'); }

  // Ownership
  testGetAllOwnerships() { this.call(() => getAllOwnerships(), 'getAllOwnerships'); }
  testGetOwnershipById() { this.call(() => getOwnershipById(1), 'getOwnershipById(1)'); }
  testGetOwnershipHistoryByStoveId() { this.call(() => getOwnershipHistoryByStoveId(1), 'getOwnershipHistoryByStoveId(1)'); }
  testGetOwnershipsByPlayerId() { this.call(() => getOwnershipsByPlayerId(1), 'getOwnershipsByPlayerId(1)'); }
  testCreateOwnership() { this.call(() => createOwnership(1, 1, 'lootbox'), 'createOwnership(1, 1, lootbox)'); }
  testGetCurrentOwner() { this.call(() => getCurrentOwner(1), 'getCurrentOwner(1)'); }
  testDeleteOwnership() { this.call(() => deleteOwnership(999), 'deleteOwnership(999)'); }
  testCountOwnershipChanges() { this.call(() => countOwnershipChanges(1), 'countOwnershipChanges(1)'); }
  testCountStovesAcquiredByPlayer() { this.call(() => countStovesAcquiredByPlayer(1), 'countStovesAcquiredByPlayer(1)'); }

  // PriceHistory
  testGetAllPriceHistory() { this.call(() => getAllPriceHistory(), 'getAllPriceHistory'); }
  testGetPriceHistoryById() { this.call(() => getPriceHistoryById(1), 'getPriceHistoryById(1)'); }
  testGetPriceHistoryByTypeId() { this.call(() => getPriceHistoryByTypeId(1), 'getPriceHistoryByTypeId(1)'); }
  testRecordSale() { this.call(() => recordSale(1, 5000), 'recordSale(1, 5000)'); }
  testGetPriceStats() { this.call(() => getPriceStats(1), 'getPriceStats(1)'); }
  testGetRecentPrices() { this.call(() => getRecentPrices(1, 5), 'getRecentPrices(1, 5)'); }
  testDeletePriceHistory() { this.call(() => deletePriceHistory(999), 'deletePriceHistory(999)'); }

  // Listing
  testGetAllListings() { this.call(() => getAllListings(), 'getAllListings'); }
  testGetActiveListings() { this.call(() => getActiveListings(), 'getActiveListings'); }
  testGetListingById() { this.call(() => getListingById(1), 'getListingById(1)'); }
  testGetListingsBySellerId() { this.call(() => getListingsBySellerId(1), 'getListingsBySellerId(1)'); }
  testGetActiveListingsBySellerId() { this.call(() => getActiveListingsBySellerId(1), 'getActiveListingsBySellerId(1)'); }
  testGetActiveListingByStoveId() { this.call(() => getActiveListingByStoveId(1), 'getActiveListingByStoveId(1)'); }
  testCreateListing() { this.call(() => createListing(1, 1, 1000), 'createListing(1, 1, 1000)'); }
  testUpdateListingPrice() { this.call(() => updateListingPrice(1, 2000), 'updateListingPrice(1, 2000)'); }
  testCancelListing() { this.call(() => cancelListing(1), 'cancelListing(1)'); }
  testDeleteListing() { this.call(() => deleteListing(999), 'deleteListing(999)'); }
  testCountActiveListingsBySeller() { this.call(() => countActiveListingsBySeller(1), 'countActiveListingsBySeller(1)'); }

  // Trade
  testGetAllTrades() { this.call(() => getAllTrades(), 'getAllTrades'); }
  testGetTradeById() { this.call(() => getTradeById(1), 'getTradeById(1)'); }
  testGetTradeByListingId() { this.call(() => getTradeByListingId(1), 'getTradeByListingId(1)'); }
  testGetTradesByBuyerId() { this.call(() => getTradesByBuyerId(1), 'getTradesByBuyerId(1)'); }
  testExecuteTrade() { this.call(() => executeTrade(1, 2), 'executeTrade(1, 2)'); }
  testGetRecentTrades() { this.call(() => getRecentTrades(5), 'getRecentTrades(5)'); }
  testDeleteTrade() { this.call(() => deleteTrade(999), 'deleteTrade(999)'); }
  testCountTrades() { this.call(() => countTrades(), 'countTrades'); }
  testCountTradesByBuyer() { this.call(() => countTradesByBuyer(1), 'countTradesByBuyer(1)'); }
}
