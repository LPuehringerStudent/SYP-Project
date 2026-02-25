import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface InventoryLootbox {
  count: number;
  locked: boolean;
  menuOpen: boolean;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  templateUrl: '../html/inventory.html',
  styleUrls: ['../css/inventory.css']
})
export class InventoryComponent {
  activeTab: 'lootboxes' | 'items' = 'lootboxes';

  // dummy data
  lootboxes = [
    {}
  ];

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
