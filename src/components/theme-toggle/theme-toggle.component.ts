import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  constructor(public themeService: ThemeService) {}

  toggleTheme = () => {
    this.themeService.toggleTheme();
  }
}