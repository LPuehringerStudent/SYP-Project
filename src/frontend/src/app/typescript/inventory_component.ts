import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {NgIf} from '@angular/common';

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
    RouterModule
  ],
  styleUrls: ['../css/inventory.css']
})
export class InventoryComponent {
  activeTab: 'lootboxes' | 'items' = 'lootboxes';

  // Empty arrays to show empty state
  lootboxes: any[] = [];
  items: any[] = [];

  constructor(private router: Router) {}

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
