import { Component } from '@angular/core';

@Component({
  selector: 'app-main-menu',
  templateUrl: '../app.html',
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
