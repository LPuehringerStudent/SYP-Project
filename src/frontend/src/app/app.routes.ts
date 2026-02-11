import { Routes } from '@angular/router';
import {LootboxComponent} from './typescript/lootbox.component';
import { TestPageComponent } from './test-page/test-page';

export const routes: Routes = [
  { path: 'test', component: TestPageComponent },
  // Routes will be added here when components are created
  // still to be learned
  {path: 'lootboxes', component: LootboxComponent}
];
