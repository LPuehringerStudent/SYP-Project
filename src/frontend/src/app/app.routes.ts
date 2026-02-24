import { Routes } from '@angular/router';
import {LootboxComponent} from './typescript/lootbox.component';
import { TestPageComponent } from './test-page/test-page';
import {MainMenuComponent} from './typescript/main-menu-component';
import {SettingsComponent} from './typescript/settings-component';

export const routes: Routes = [
  // Routes will be added here when components are created
  { path: 'test', component: TestPageComponent },
  {path: 'lootboxes', component: LootboxComponent},
  {path: '', component: MainMenuComponent},
  {path: 'settings', component: SettingsComponent},
];
