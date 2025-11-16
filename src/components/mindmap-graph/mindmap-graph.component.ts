import { Component, ChangeDetectionStrategy, input, ElementRef, viewChild, afterNextRender, effect, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

declare var mermaid: any;

@Component({
  selector: 'app-mindmap-graph',
  templateUrl: './mindmap-graph.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MindmapGraphComponent {
  graphDefinition = input.required<string>();
  
  private container = viewChild.required<ElementRef>('container');
  private themeService = inject(ThemeService);
  private uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

  constructor() {
    afterNextRender(() => {
      this.render();
    });

    effect(() => {
      // Re-render when theme changes or graph definition changes
      this.graphDefinition();
      this.themeService.theme();
      this.render();
    });
  }

  private async render() {
    if (!this.graphDefinition() || !this.container()) return;

    const theme = this.themeService.theme() === 'dark' ? 'dark' : 'default';
    
    mermaid.initialize({
      startOnLoad: false,
      theme,
      mindmap: {
        padding: 20,
        useMaxWidth: true,
      },
      themeVariables: {
        background: 'transparent',
        primaryColor: this.themeService.theme() === 'dark' ? '#837ab6' : '#ffc4c4',
        primaryTextColor: this.themeService.theme() === 'dark' ? '#f7c2ea' : '#850e35',
        primaryBorderColor: this.themeService.theme() === 'dark' ? '#f6a5c0' : '#ee6983',
        lineColor: this.themeService.theme() === 'dark' ? '#f6a5c0' : '#ee6983',
        textColor: this.themeService.theme() === 'dark' ? '#f7c2ea' : '#850e35',
      }
    });

    try {
      const { svg } = await mermaid.render(this.uniqueId, this.graphDefinition());
      this.container().nativeElement.innerHTML = svg;
    } catch (e) {
      console.error('Mermaid rendering error:', e);
      this.container().nativeElement.innerHTML = `<p class="text-red-500">Error rendering mindmap. The syntax might be invalid.</p>`;
    }
  }
}
