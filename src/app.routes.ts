import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    title: '🌙 LunaNotes - Home'
  },
  {
    path: 'results',
    loadComponent: () => import('./components/results/results.component').then(m => m.ResultsComponent),
    title: '🌙 LunaNotes - Processed Notes'
  },
  {
    path: 'mindmap',
    loadComponent: () => import('./components/mindmap/mindmap.component').then(m => m.MindmapComponent),
    title: '🌙 LunaNotes - Mindmap'
  },
  {
    path: 'chat',
    loadComponent: () => import('./components/chat/chat.component').then(m => m.ChatComponent),
    title: '🌙 LunaNotes - Chat with Notes'
  },
  {
    path: 'history',
    loadComponent: () => import('./components/history/history.component').then(m => m.HistoryComponent),
    title: '🌙 LunaNotes - History'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: '🌙 LunaNotes - Dashboard'
  },
  {
    path: 'analytics',
    loadComponent: () => import('./components/analytics/analytics.component').then(m => m.AnalyticsComponent),
    title: '🌙 LunaNotes - Analytics'
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];