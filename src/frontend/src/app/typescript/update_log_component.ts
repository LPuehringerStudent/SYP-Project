import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../html/update_log.html',
  styleUrls: ['../css/update_log.css']
})
export class UpdateLogComponent {
  // Single update entry for main menu UI improvement
  // Ready to be connected to GitHub API
}
