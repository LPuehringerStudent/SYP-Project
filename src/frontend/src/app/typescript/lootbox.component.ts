import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {createLootbox, LootboxDrop} from '../fetchers/lootbox.fetcher';
import {LootBoxHelper, LootItem} from "../../../../middleground/LootboxHelper";

@Component({
  selector: 'app-lootbox',
  standalone: true,
  templateUrl: '../html/lootbox.html',
  imports: [CommonModule],
  styleUrls: ['../css/lootbox.css']
})

export class LootboxComponent implements AfterViewInit {
  @ViewChild('itemsContainer') itemsElement!: ElementRef<HTMLElement>;

  resultText = '';
  showPopup = false;
  showOverlay = false;
  items: LootItem[] = [];

  private lootBoxHelper: LootBoxHelper;
  constructor(private cdr: ChangeDetectorRef) {
    this.lootBoxHelper = new LootBoxHelper(cdr);
  }

  ngAfterViewInit(): void {
  }

  openBox(): void {
    this.lootBoxHelper.buildStrip();
    this.items = this.lootBoxHelper.items;
    this.showOverlay = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      const itemsEl = this.itemsElement.nativeElement;

      itemsEl.style.transition = 'none';
      itemsEl.style.transform = 'translateX(0px)';

      void itemsEl.offsetHeight;

      itemsEl.style.transition = 'transform 4s cubic-bezier(0.1, 0.9, 0.2, 1)';

      setTimeout(() => {
        const itemEl = itemsEl.querySelector('.item') as HTMLElement;
        if (itemEl) {
          const style = window.getComputedStyle(itemEl);
          const width =
            itemEl.offsetWidth +
            parseInt(style.marginLeft) +
            parseInt(style.marginRight);
          const rollerEl = document.getElementById('roller');
          const rollerWidth = rollerEl?.offsetWidth || 0;
          const centerOffset = rollerWidth / 2 - width / 2;
          const offset = -(40 * width) + centerOffset;

          itemsEl.style.transform = `translateX(${offset}px)`;
        }

        setTimeout(() => {
          this.showResult();
        }, 4000);
      }, 50);
    }, 0);
  }

  private showResult(): void {
    this.resultText = `You got: ${this.lootBoxHelper.finalItem?.name || 'Unknown'}`;
    this.showPopup = true;
    this.cdr.detectChanges();
  }

  resetAll(): void {
    this.showOverlay = false;
    this.showPopup = false;
    const itemsEl = this.itemsElement?.nativeElement;
    if (itemsEl) {
      itemsEl.style.transform = 'translateX(0px)';
    }
  }
}
