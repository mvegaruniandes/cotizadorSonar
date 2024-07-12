import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SimulatorComponent } from './features/simulator/simulator.component';

const routes: Routes = [
  {
    path: '',
    component: SimulatorComponent,
  },
  {
    path: 'index',
    component: SimulatorComponent,
  },
  {
    path: 'home',
    component: SimulatorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
