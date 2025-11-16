import { Component, ChangeDetectionStrategy, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService, AnalyticsData } from '../../services/firebase.service';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { LineChartComponent } from '../charts/line-chart.component';
import { BarChartComponent } from '../charts/bar-chart.component';
import { PieChartComponent } from '../charts/pie-chart.component';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  imports: [CommonModule, SkeletonLoaderComponent, LineChartComponent, BarChartComponent, PieChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComponent {
  firebaseService = inject(FirebaseService);

  analyticsData = signal<AnalyticsData | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const user = this.firebaseService.user();
      if (user) {
        this.fetchAnalytics();
      } else {
        this.analyticsData.set(null);
        this.error.set('Please sign in to view your study analytics.');
        this.isLoading.set(false);
      }
    });
  }

  mostFrequentTopic = computed(() => {
    const data = this.analyticsData()?.topicBreakdown;
    if (!data || data.length === 0) return { label: 'N/A', value: 0 };
    return data.reduce((prev, current) => (prev.value > current.value) ? prev : current);
  });
  
  avgNotesPerWeek = computed(() => {
    const data = this.analyticsData()?.notesPerWeek;
    if (!data || data.length === 0) return 0;
    const totalNotes = data.reduce((sum, item) => sum + item.value, 0);
    return Math.round(totalNotes / data.length);
  });

  busiestWeek = computed(() => {
    const data = this.analyticsData()?.notesPerWeek;
    if (!data || data.length === 0) return { label: 'N/A', value: 0 };
    return data.reduce((prev, current) => (prev.value > current.value) ? prev : current);
  });

  async fetchAnalytics() {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await this.firebaseService.getAnalyticsData();
      this.analyticsData.set(data);
    } catch (e) {
      console.error('Error fetching analytics data:', e);
      this.error.set('Could not load analytics data. Please try again later.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
