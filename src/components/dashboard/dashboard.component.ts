import { Component, ChangeDetectionStrategy, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStatsService } from '../../services/user-stats.service';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  userStatsService = inject(UserStatsService);
  firebaseService = inject(FirebaseService);

  stats = computed(() => this.userStatsService.stats());
  isLoading = computed(() => this.userStatsService.isLoading());
  error = computed(() => this.userStatsService.error());
  
  ngOnInit() {
    if (this.firebaseService.user()) {
       this.userStatsService.fetchStats();
    } else {
        this.userStatsService.clearStats();
    }
  }
  
  formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
}
