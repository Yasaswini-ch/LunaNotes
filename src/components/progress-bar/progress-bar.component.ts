import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
  progress = input.required<number>(); // value from 0 to 100
}
