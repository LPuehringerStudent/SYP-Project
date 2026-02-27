import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';
import { StoveApiService } from '../../services/stove';
import { Subscription } from 'rxjs';

interface InventoryLootbox {
  count: number;
  locked: boolean;
  menuOpen: boolean;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  templateUrl: '../html/inventory.html',
  imports: [
    NgIf,
    RouterModule,
    NgForOf
  ],
  styleUrls: ['../css/inventory.css']
})
export class InventoryComponent implements OnInit {
  activeTab: 'lootboxes' | 'items' = 'lootboxes';

  // Empty arrays to show empty state
  lootboxes: any[] = [];
  items: any[] = [];
  private _stove: StoveApiService;
  private _subscription = new Subscription();

  constructor(private router: Router, stove: StoveApiService) {
    this._stove = stove;
  }


  ngOnInit(): void {
    this.getItems();

    // Auto-refresh when service notifies
    this._stove.refresh$.subscribe(() => {
      console.log('Refresh triggered');
      this.getItems();
    });
  }

  getItems(): void {
    const stoves$ = this._stove.getStoves(1);

    const sub = stoves$.subscribe({
      next: (data) => {
        this.items = data;
      },
      error: (err) => {
        console.error('Failed to get stoves:', err);
        this.items = [];
      }
    });

    this._subscription.add(sub);
  }

  toggleMenu(box: InventoryLootbox) {
    box.menuOpen = !box.menuOpen;
  }

  toggleLock(box: InventoryLootbox) {
    box.locked = !box.locked;
  }

  openBox() {
    this.router.navigate(['/lootboxes']);
  }

  deleteBox(box: InventoryLootbox) {
    if (box.locked) return;
    box.count = 0;
  }
}
