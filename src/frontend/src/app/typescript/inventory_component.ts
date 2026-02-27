import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';
import { StoveApiService } from '../../services/stove';
import {forkJoin, map, of, Subscription, switchMap} from 'rxjs';
import {Rarity, ShowedStove, Stove, StoveRow} from '../../../../shared/model';

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
  items: ShowedStove[] = [];
  private _stove: StoveApiService;
  private _subscription = new Subscription();

  constructor(private router: Router, stove: StoveApiService) {
    this._stove = stove;
  }


  ngOnInit(): void {
    this.getItems();

    // Auto-  refresh when service notifies
    this._stove.refresh$.subscribe(() => {
      console.log('Refresh triggered');
      this.getItems();
    });
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
  getItems(): void {
    const sub = this._stove.getStoves(1).pipe(
      switchMap((stoves: StoveRow[]) => {
        if (stoves.length === 0) return of([]);

        return forkJoin(
          stoves.map((stove) =>
            this._stove.checkRarity(stove.typeId).pipe(
              map(rarity => ({
                ...stove,
                rarity,
                StoveName: this.getStoveName(stove.typeId) // ✅ Add this
              }))
            )
          )
        );
      })
    ).subscribe({
      next: (showedStoves: ShowedStove[]) => {
        this.items = showedStoves;
      },
      error: (err) => {
        console.error('Failed to get stoves:', err);
        this.items = [];
      }
    });
    this._subscription.add(sub);
  }


  private getStoveName(typeId: number): string {
    const nameMap: Record<number, string> = {
      1: 'Basic Stove',
      2: 'Iron Stove',
      3: 'Steel Stove',
      // ... add your stove names
    };
    return nameMap[typeId] || `Stove #${typeId}`;
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
