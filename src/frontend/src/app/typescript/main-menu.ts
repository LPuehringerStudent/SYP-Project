import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main-menu',
  templateUrl: '../app.html',
  styleUrls: ['../app.css'],
  standalone: true,
  imports: [RouterLink]
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
