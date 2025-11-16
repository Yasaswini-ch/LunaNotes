import { Injectable, signal, inject, effect } from '@angular/core';
import { FirebaseService, DashboardStats } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class UserStatsService {
  firebaseService = inject(FirebaseService);

  stats = signal<DashboardStats | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    // React to user login/logout
    effect(() => {
      const user = this.firebaseService.user();
      if (user) {
        this.fetchStats();
      } else {
        this.clearStats();
      }
    });
  }

  async fetchStats() {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const dashboardStats = await this.firebaseService.getDashboardStats();
      this.stats.set(dashboardStats);
    } catch (e) {
      console.error('Failed to fetch user stats:', e);
      this.error.set('Could not load user stats.');
    } finally {
      this.isLoading.set(false);
    }
  }
  
  updateStats(updates: { streak: number; totalNotes: number }) {
    this.stats.update(currentStats => {
        if (!currentStats) return null;
        return { 
          ...currentStats, 
          streak: updates.streak,
          totalNotes: updates.totalNotes,
        };
    });
  }

  clearStats() {
    this.stats.set(null);
    this.isLoading.set(false);
    this.error.set(null);
  }
}
