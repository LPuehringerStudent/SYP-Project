import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: '../app.html',
  imports: [RouterOutlet, RouterLink],
  styleUrls: ['../app.css'],
  standalone: true,

})
export class MainComponent {
  sidebarOpen = false;
  settingsOpen = false;
  loginOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleLogin() {
    this.loginOpen = !this.loginOpen;
    this.settingsOpen = false;
  }
}
