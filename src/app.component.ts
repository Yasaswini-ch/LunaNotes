import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { HeaderComponent } from './components/header/header.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { OnboardingService } from './services/onboarding.service';
import { UiService } from './services/ui.service';
import { TimerComponent } from './components/timer/timer.component';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, OnboardingComponent, TimerComponent, ToastComponent],
})
export class AppComponent {
  themeService = inject(ThemeService);
  onboardingService = inject(OnboardingService);
  uiService = inject(UiService);
  
  constructor() {
    this.themeService.initTheme();
    this.onboardingService.checkOnboardingStatus();
  }
}
