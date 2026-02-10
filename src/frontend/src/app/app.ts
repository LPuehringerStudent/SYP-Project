import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainMenuComponent } from './typescript/main-menu';

@Component({
  selector: 'app-root',
  standalone: true,
  //temporary solution with lootbox
  imports: [MainMenuComponent, RouterOutlet],
  template: `
    <app-main-menu></app-main-menu>
    <router-outlet></router-outlet>
  `
})
export class App {}
