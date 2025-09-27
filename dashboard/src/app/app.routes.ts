// dashboard/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // 👇 Directly load standalone LoginComponent
  { path: 'auth/login', component: LoginComponent },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },

  // wildcard: if route not found, send back to login
  { path: '**', redirectTo: 'auth/login' },
];
