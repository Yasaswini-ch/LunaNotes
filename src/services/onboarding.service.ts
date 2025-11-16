import { Injectable, signal } from '@angular/core';

const ONBOARDING_KEY = 'lunanotes-onboarding-complete';

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  showOnboarding = signal(false);

  checkOnboardingStatus() {
    const hasCompleted = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompleted) {
      this.showOnboarding.set(true);
    }
  }

  completeOnboarding() {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    this.showOnboarding.set(false);
  }
}
