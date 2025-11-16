import { Component, ChangeDetectionStrategy, signal, computed, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotesStoreService } from '../../services/notes-store.service';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { MindmapGraphComponent } from '../mindmap-graph/mindmap-graph.component';
import { AiService } from '../../services/ai.service';
import { MindmapNode } from '../../models/processed-data.model';

@Component({
  selector: 'app-mindmap',
  templateUrl: './mindmap.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SkeletonLoaderComponent, MindmapGraphComponent],
})
export class MindmapComponent implements OnInit {
  notesStore = inject(NotesStoreService);
  aiService = inject(AiService);
  router = inject(Router);

  notes = computed(() => this.notesStore.processedNotes());
  mermaidData = computed(() => this.notesStore.mermaidData());
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    if (!this.notes()) {
      this.router.navigate(['/']);
      return;
    }
    
    if (!this.notesStore.mermaidData()) {
      this.generateMindmap();
    }
  }

  async generateMindmap() {
    const currentNotes = this.notes();
    if (!currentNotes) return;
    
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const mermaidSyntax = await this.aiService.generateMindmap(currentNotes);
      this.notesStore.setMermaid(mermaidSyntax);
    } catch (e: any) {
      console.error('Failed to generate mindmap:', e);
      if (e.message === 'User is not authenticated.') {
        this.error.set('Please sign in to generate a mindmap.');
      } else {
        this.error.set('Could not generate mindmap. Please try again.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}