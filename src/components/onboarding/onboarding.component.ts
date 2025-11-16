import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingComponent {
  onboardingService = inject(OnboardingService);
  currentStep = signal(1);

  nextStep() {
    this.currentStep.update(step => (step < 4 ? step + 1 : 4));
  }

  prevStep() {
    this.currentStep.update(step => (step > 1 ? step - 1 : 1));
  }
  
  finishOnboarding() {
    this.onboardingService.completeOnboarding();
  }
}
