import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  templateUrl: './skeleton-loader.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLoaderComponent {
  // Example inputs to customize skeleton
  width = input<string>('100%');
  height = input<string>('1rem');
  className = input<string>('');
}
