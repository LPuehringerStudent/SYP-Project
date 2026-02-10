import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-main-menu',
  templateUrl: '../app.html',
  imports: [RouterOutlet],
  styleUrls: ['../app.css'],
  standalone: true
})
export class MainMenuComponent {
  sidebarOpen = false;
  settingsOpen = false;
  loginOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleSettings() {
    this.settingsOpen = !this.settingsOpen;
    this.loginOpen = false;
  }

  toggleLogin() {
    this.loginOpen = !this.loginOpen;
    this.settingsOpen = false;
  }
}
