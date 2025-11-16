import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { UserStatsService } from '../../services/user-stats.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [], // Standalone component
})
export class AuthComponent {
  firebaseService = inject(FirebaseService);
  userStatsService = inject(UserStatsService);
  uiService = inject(UiService);

  signIn() {
    this.firebaseService.signInWithGoogle();
  }

  signOut() {
    this.firebaseService.signOut();
  }

  toggleTimer() {
    this.uiService.toggleTimer();
  }
}
