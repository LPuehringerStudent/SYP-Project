import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

interface TestResult {
  timestamp: string;
  endpoint: string;
  success: boolean;
  data?: unknown;
  error?: string;
  duration: number;
}

interface ApiCategory {
  name: string;
  icon: string;
  expanded: boolean;
  endpoints: ApiEndpoint[];
}

interface ApiEndpoint {
  name: string;
  method: () => Promise<unknown>;
  label: string;
  description?: string;
}

@Component({
  selector: 'app-test-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="test-page">
      <header class="page-header">
        <h1>🔧 API Test Console</h1>
        <p class="subtitle">Test all backend endpoints with live feedback</p>
      </header>

      <div class="main-layout">
        <!-- Sidebar with categories -->
        <aside class="sidebar">
          <div class="search-box">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Search endpoints..."
              class="search-input">
          </div>

          <div class="category-list">
            <div 
              *ngFor="let category of filteredCategories" 
              class="category-item"
              [class.expanded]="category.expanded">
              <button class="category-header" (click)="toggleCategory(category)">
                <span class="category-icon">{{ category.icon }}</span>
                <span class="category-name">{{ category.name }}</span>
                <span class="toggle-icon">{{ category.expanded ? '▼' : '▶' }}</span>
              </button>
              
              <div class="endpoint-list" *ngIf="category.expanded">
                <button
                  *ngFor="let endpoint of category.endpoints"
                  class="endpoint-btn"
                  [class.running]="runningEndpoint === endpoint.label"
                  (click)="runTest(endpoint)"
                  [title]="endpoint.description">
                  <span class="btn-text">{{ endpoint.name }}</span>
                  <span class="spinner" *ngIf="runningEndpoint === endpoint.label">⟳</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        <!-- Results panel -->
        <main class="results-panel">
          <div class="panel-header">
            <h2>Response</h2>
            <div class="actions">
              <button class="action-btn" (click)="clearResults()" [disabled]="results.length === 0">
                Clear All
              </button>
              <button class="action-btn" (click)="copyLastResult()" [disabled]="!lastResult">
                Copy Last
              </button>
            </div>
          </div>

          <div class="results-list" *ngIf="results.length > 0">
            <div 
              *ngFor="let result of results; let i = index" 
              class="result-card"
              [class.success]="result.success"
              [class.error]="!result.success">
              <div class="result-header">
                <span class="badge" [class.success]="result.success" [class.error]="!result.success">
                  {{ result.success ? '✓' : '✗' }}
                </span>
                <span class="endpoint-name">{{ result.endpoint }}</span>
                <span class="timestamp">{{ result.timestamp }}</span>
                <span class="duration" [class.fast]="result.duration < 100" [class.slow]="result.duration > 500">
                  {{ result.duration }}ms
                </span>
                <button class="delete-btn" (click)="removeResult(i)">×</button>
              </div>
              <div class="result-body">
                <pre *ngIf="result.success">{{ result.data | json }}</pre>
                <pre *ngIf="!result.success" class="error-text">{{ result.error }}</pre>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="results.length === 0">
            <div class="empty-icon">📡</div>
            <p>Click any endpoint button to see results here</p>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .test-page {
      min-height: 100vh;
      background: #f5f7fa;
    }

    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px 32px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .page-header h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
    }

    .subtitle {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }

    .main-layout {
      display: flex;
      height: calc(100vh - 100px);
    }

    .sidebar {
      width: 320px;
      background: white;
      border-right: 1px solid #e0e0e0;
      overflow-y: auto;
      padding: 16px;
    }

    .search-box {
      margin-bottom: 16px;
    }

    .search-input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .category-item {
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e0e0e0;
    }

    .category-header {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: #f8f9fa;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
    }

    .category-header:hover {
      background: #e9ecef;
    }

    .category-icon {
      font-size: 18px;
    }

    .category-name {
      flex: 1;
      text-align: left;
    }

    .toggle-icon {
      font-size: 10px;
      color: #666;
    }

    .endpoint-list {
      padding: 8px;
      background: white;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .endpoint-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
      text-align: left;
    }

    .endpoint-btn:hover {
      background: #f0f4ff;
      border-color: #667eea;
    }

    .endpoint-btn.running {
      background: #fff3cd;
      border-color: #ffc107;
    }

    .btn-text {
      flex: 1;
    }

    .spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .results-panel {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .panel-header h2 {
      margin: 0;
      font-size: 20px;
      color: #333;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      padding: 8px 16px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
    }

    .action-btn:hover:not(:disabled) {
      background: #f0f4ff;
      border-color: #667eea;
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .results-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .result-card {
      background: white;
      border-radius: 12px;
      border: 1px solid #e0e0e0;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .result-card.success {
      border-left: 4px solid #28a745;
    }

    .result-card.error {
      border-left: 4px solid #dc3545;
    }

    .result-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    .badge {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 12px;
      font-weight: bold;
    }

    .badge.success {
      background: #d4edda;
      color: #155724;
    }

    .badge.error {
      background: #f8d7da;
      color: #721c24;
    }

    .endpoint-name {
      flex: 1;
      font-weight: 500;
      color: #333;
    }

    .timestamp {
      font-size: 12px;
      color: #666;
    }

    .duration {
      font-size: 12px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 4px;
      background: #e9ecef;
    }

    .duration.fast {
      background: #d4edda;
      color: #155724;
    }

    .duration.slow {
      background: #fff3cd;
      color: #856404;
    }

    .delete-btn {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      color: #999;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .delete-btn:hover {
      background: #f8d7da;
      color: #dc3545;
    }

    .result-body {
      padding: 16px;
    }

    .result-body pre {
      margin: 0;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      font-size: 13px;
      overflow-x: auto;
      max-height: 400px;
      overflow-y: auto;
    }

    .error-text {
      color: #dc3545;
      background: #f8d7da !important;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      color: #666;
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state p {
      font-size: 16px;
    }
  `]
})
export class TestPageComponent {
  searchQuery = '';
  runningEndpoint: string | null = null;
  results: TestResult[] = [];
  lastResult: TestResult | null = null;

  categories: ApiCategory[] = [
    {
      name: 'Player',
      icon: '👤',
      expanded: false,
      endpoints: [
        { name: 'Get All', method: () => getAllPlayers(), label: 'getAllPlayers()', description: 'Fetch all players' },
        { name: 'Get by ID', method: () => getPlayerById(1), label: 'getPlayerById(1)', description: 'Fetch player #1' },
        { name: 'Create', method: () => createPlayer('test_' + Date.now()), label: 'createPlayer()', description: 'Create new test player' },
        { name: 'Update Coins', method: () => updatePlayerCoins(1, 999), label: 'updatePlayerCoins(1, 999)', description: 'Set player coins to 999' },
        { name: 'Update Lootboxes', method: () => updatePlayerLootboxCount(1, 5), label: 'updatePlayerLootboxCount(1, 5)', description: 'Set lootbox count' },
        { name: 'Delete', method: () => deletePlayer(999), label: 'deletePlayer(999)', description: 'Delete player #999 (may fail)' }
      ]
    },
    {
      name: 'Lootbox',
      icon: '🎁',
      expanded: false,
      endpoints: [
        { name: 'Get All', method: () => getAllLootboxes(), label: 'getAllLootboxes()', description: 'Fetch all lootboxes' },
        { name: 'Get by ID', method: () => getLootboxById(1), label: 'getLootboxById(1)', description: 'Fetch lootbox #1' },
        { name: 'Get by Player', method: () => getLootboxesByPlayerId(1), label: 'getLootboxesByPlayerId(1)', description: 'Fetch player #1 lootboxes' },
        { name: 'Create', method: () => createLootbox(1, 1, 'free'), label: 'createLootbox(1, 1, free)', description: 'Create free lootbox' },
        { name: 'Delete', method: () => deleteLootbox(999), label: 'deleteLootbox(999)', description: 'Delete lootbox #999' }
      ]
    },
    {
      name: 'Lootbox Type',
      icon: '📦',
      expanded: false,
      endpoints: [
        { name: 'Get All', method: () => getAllLootboxTypes(), label: 'getAllLootboxTypes()', description: 'Fetch all lootbox types' },
        { name: 'Get Available', method: () => getAvailableLootboxTypes(), label: 'getAvailableLootboxTypes()', description: 'Fetch available types' },
        { name: 'Get by ID', method: () => getLootboxTypeById(1), label: 'getLootboxTypeById(1)', description: 'Fetch type #1' }
      ]
    },
    {
      name: 'Lootbox Drop',
      icon: '🎲',
      expanded: false,
      endpoints: [
        { name: 'Get by Lootbox', method: () => getDropsByLootboxId(1), label: 'getDropsByLootboxId(1)', description: 'Fetch drops for lootbox #1' },
        { name: 'Create', method: () => createLootboxDrop(1, 1), label: 'createLootboxDrop(1, 1)', description: 'Create drop linking lootbox to stove' }
      ]
    },
    {
      name: 'Stove Type',
      icon: '🔥',
      expanded: false,
      endpoints: [
        { name: 'Get All', method: () => getAllStoveTypes(), label: 'getAllStoveTypes()', description: 'Fetch all stove types' },
        { name: 'Get by ID', method: () => getStoveTypeById(1), label: 'getStoveTypeById(1)', description: 'Fetch stove type #1' },
        { name: 'Get by Rarity', method: () => getStoveTypesByRarity(Rarity.COMMON), label: 'getStoveTypesByRarity(common)', description: 'Fetch common stoves' },
        { name: 'Create', method: () => createStoveType('Test_' + Date.now(), '/img.png', Rarity.COMMON, 10), label: 'createStoveType()', description: 'Create new stove type' },
        { name: 'Update Weight', method: () => updateStoveTypeWeight(1, 20), label: 'updateStoveTypeWeight(1, 20)', description: 'Update drop weight' },
        { name: 'Update Image', method: () => updateStoveTypeImage(1, '/new.png'), label: 'updateStoveTypeImage(1, /new.png)', description: 'Update image URL' },
        { name: 'Delete', method: () => deleteStoveType(999), label: 'deleteStoveType(999)', description: 'Delete stove type #999' },
        { name: 'Total Weight', method: () => getTotalLootboxWeight(), label: 'getTotalLootboxWeight()', description: 'Get total drop weight' }
      ]
    },
    {
      name: 'Stove',
      icon: '🍳',
      expanded: false,
      endpoints: [
        { name: 'Get All', method: () => getAllStoves(), label: 'getAllStoves()', description: 'Fetch all stoves' },
        { name: 'Get by ID', method: () => getStoveById(1), label: 'getStoveById(1)', description: 'Fetch stove #1' },
        { name: 'Get by Player', method: () => getStovesByPlayerId(1), label: 'getStovesByPlayerId(1)', description: 'Fetch player #1 stoves' },
        { name: 'Get by Type', method: () => getStovesByTypeId(1), label: 'getStovesByTypeId(1)', description: 'Fetch stoves of type #1' },
        { name: 'Create', method: () => createStove(1, 1), label: 'createStove(1, 1)', description: 'Create new stove' },
        { name: 'Transfer', method: () => transferStoveOwnership(1, 2), label: 'transferStoveOwnership(1, 2)', description: 'Transfer stove #1 to player #2' },
        { name: 'Delete', method: () => deleteStove(999), label: 'deleteStove(999)', description: 'Delete stove #999' },
        { name: 'Count by Player', method: () => countStovesByPlayer(1), label: 'countStovesByPlayer(1)', description: 'Count player #1 stoves' },
        { name: 'Count by Type', method: () => countStovesByType(1), label: 'countStovesByType(1)', description: 'Count stoves of type #1' }
      ]
    },
    {
      name: 'Ownership',
      icon: '📋',
      expanded: false,
      endpoints: [
        { name: 'Get All', method: () => getAllOwnerships(), label: 'getAllOwnerships()', description: 'Fetch all ownership records' },
        { name: 'Get by ID', method: () => getOwnershipById(1), label: 'getOwnershipById(1)', description: 'Fetch ownership #1' },
        { name: 'Get by Stove', method: () => getOwnershipHistoryByStoveId(1), label: 'getOwnershipHistoryByStoveId(1)', description: 'Fetch stove #1 history' },
        { name: 'Get by Player', method: () => getOwnershipsByPlayerId(1), label: 'getOwnershipsByPlayerId(1)', description: 'Fetch player #1 ownerships' },
        { name: 'Create', method: () => createOwnership(1, 1, 'lootbox'), label: 'createOwnership(1, 1, lootbox)', description: 'Create ownership record' },
        { name: 'Get Current', method: () => getCurrentOwner(1), label: 'getCurrentOwner(1)', description: 'Get current owner of stove #1' },
        { name: 'Delete', method: () => deleteOwnership(999), label: 'deleteOwnership(999)', description: 'Delete ownership #999' },
        { name: 'Count Changes', method: () => countOwnershipChanges(1), label: 'countOwnershipChanges(1)', description: 'Count ownership changes for stove' },
        { name: 'Count Acquired', method: () => countStovesAcquiredByPlayer(1), label: 'countStovesAcquiredByPlayer(1)', description: 'Count stoves acquired by player' }
      ]
    },
    {
      name: 'Price History',
      icon: '💰',
      expanded: false,
      endpoints: [
        { name: 'Get All', method: () => getAllPriceHistory(), label: 'getAllPriceHistory()', description: 'Fetch all price history' },
        { name: 'Get by ID', method: () => getPriceHistoryById(1), label: 'getPriceHistoryById(1)', description: 'Fetch price history #1' },
        { name: 'Get by Type', method: () => getPriceHistoryByTypeId(1), label: 'getPriceHistoryByTypeId(1)', description: 'Fetch price history for type #1' },
        { name: 'Record Sale', method: () => recordSale(1, 5000), label: 'recordSale(1, 5000)', description: 'Record sale of 5000 coins' },
        { name: 'Get Stats', method: () => getPriceStats(1), label: 'getPriceStats(1)', description: 'Get price statistics' },
        { name: 'Get Recent', method: () => getRecentPrices(1, 5), label: 'getRecentPrices(1, 5)', description: 'Get 5 recent prices' },
        { name: 'Delete', method: () => deletePriceHistory(999), label: 'deletePriceHistory(999)', description: 'Delete price history #999' }
      ]
    },
    {
      name: 'Listing',
      icon: '📜',
      expanded: false,
      endpoints: [
        { name: 'Get All', method: () => getAllListings(), label: 'getAllListings()', description: 'Fetch all listings' },
        { name: 'Get Active', method: () => getActiveListings(), label: 'getActiveListings()', description: 'Fetch active listings' },
        { name: 'Get by ID', method: () => getListingById(1), label: 'getListingById(1)', description: 'Fetch listing #1' },
        { name: 'Get by Seller', method: () => getListingsBySellerId(1), label: 'getListingsBySellerId(1)', description: 'Fetch listings by seller #1' },
        { name: 'Get Active by Seller', method: () => getActiveListingsBySellerId(1), label: 'getActiveListingsBySellerId(1)', description: 'Fetch active listings by seller' },
        { name: 'Get by Stove', method: () => getActiveListingByStoveId(1), label: 'getActiveListingByStoveId(1)', description: 'Fetch listing for stove #1' },
        { name: 'Create', method: () => createListing(1, 1, 1000), label: 'createListing(1, 1, 1000)', description: 'Create listing for 1000 coins' },
        { name: 'Update Price', method: () => updateListingPrice(1, 2000), label: 'updateListingPrice(1, 2000)', description: 'Update price to 2000' },
        { name: 'Cancel', method: () => cancelListing(1), label: 'cancelListing(1)', description: 'Cancel listing #1' },
        { name: 'Delete', method: () => deleteListing(999), label: 'deleteListing(999)', description: 'Delete listing #999' },
        { name: 'Count', method: () => countActiveListingsBySeller(1), label: 'countActiveListingsBySeller(1)', description: 'Count active listings' }
      ]
    },
    {
      name: 'Trade',
      icon: '💱',
      expanded: false,
      endpoints: [
        { name: 'Get All', method: () => getAllTrades(), label: 'getAllTrades()', description: 'Fetch all trades' },
        { name: 'Get by ID', method: () => getTradeById(1), label: 'getTradeById(1)', description: 'Fetch trade #1' },
        { name: 'Get by Listing', method: () => getTradeByListingId(1), label: 'getTradeByListingId(1)', description: 'Fetch trade for listing #1' },
        { name: 'Get by Buyer', method: () => getTradesByBuyerId(1), label: 'getTradesByBuyerId(1)', description: 'Fetch trades by buyer #1' },
        { name: 'Execute', method: () => executeTrade(1, 2), label: 'executeTrade(1, 2)', description: 'Execute trade (listing #1, buyer #2)' },
        { name: 'Get Recent', method: () => getRecentTrades(5), label: 'getRecentTrades(5)', description: 'Get 5 recent trades' },
        { name: 'Delete', method: () => deleteTrade(999), label: 'deleteTrade(999)', description: 'Delete trade #999' },
        { name: 'Count All', method: () => countTrades(), label: 'countTrades()', description: 'Count all trades' },
        { name: 'Count by Buyer', method: () => countTradesByBuyer(1), label: 'countTradesByBuyer(1)', description: 'Count trades by buyer' }
      ]
    }
  ];

  get filteredCategories(): ApiCategory[] {
    if (!this.searchQuery.trim()) {
      return this.categories;
    }
    const query = this.searchQuery.toLowerCase();
    return this.categories.map(cat => ({
      ...cat,
      endpoints: cat.endpoints.filter(ep => 
        ep.name.toLowerCase().includes(query) ||
        ep.label.toLowerCase().includes(query) ||
        ep.description?.toLowerCase().includes(query)
      )
    })).filter(cat => cat.endpoints.length > 0);
  }

  toggleCategory(category: ApiCategory): void {
    category.expanded = !category.expanded;
  }

  async runTest(endpoint: ApiEndpoint): Promise<void> {
    if (this.runningEndpoint) return;
    
    this.runningEndpoint = endpoint.label;
    const startTime = performance.now();
    
    try {
      console.log(`Calling: ${endpoint.label}`);
      const result = await endpoint.method();
      const duration = Math.round(performance.now() - startTime);
      
      const testResult: TestResult = {
        timestamp: new Date().toLocaleTimeString(),
        endpoint: endpoint.label,
        success: true,
        data: result,
        duration
      };
      
      this.results.unshift(testResult);
      this.lastResult = testResult;
      console.log('Success:', result);
    } catch (err) {
      const duration = Math.round(performance.now() - startTime);
      
      const testResult: TestResult = {
        timestamp: new Date().toLocaleTimeString(),
        endpoint: endpoint.label,
        success: false,
        error: String(err),
        duration
      };
      
      this.results.unshift(testResult);
      this.lastResult = testResult;
      console.error('Error:', err);
    } finally {
      this.runningEndpoint = null;
    }
  }

  clearResults(): void {
    this.results = [];
    this.lastResult = null;
  }

  removeResult(index: number): void {
    this.results.splice(index, 1);
    if (this.results.length === 0) {
      this.lastResult = null;
    }
  }

  copyLastResult(): void {
    if (this.lastResult) {
      navigator.clipboard.writeText(JSON.stringify(this.lastResult, null, 2));
    }
  }
}
