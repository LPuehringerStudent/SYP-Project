import { Routes } from '@angular/router';
import {LootboxComponent} from './typescript/lootbox.component';
import { TestPageComponent } from './test-page/test-page';
import {MainMenuComponent} from './typescript/main-menu-component';
import {SettingsComponent} from './typescript/settings-component';
import {InventoryComponent} from './typescript/inventory_component';
import {UpdateLogComponent} from './typescript/update_log_component';

export const routes: Routes = [
  // Routes will be added here when components are created
  { path: 'test', component: TestPageComponent },
  {path: 'lootboxes', component: LootboxComponent},
  {path: '', component: MainMenuComponent},
  {path: 'settings', component: SettingsComponent},
  {path: 'inventory', component: InventoryComponent },
  {path: 'update-log', component: UpdateLogComponent }
];
