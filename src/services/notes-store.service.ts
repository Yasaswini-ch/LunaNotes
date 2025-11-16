import { Injectable, signal } from '@angular/core';
import { ProcessedData, MindmapNode } from '../models/processed-data.model';

@Injectable({
  providedIn: 'root'
})
export class NotesStoreService {
  processedNotes = signal<ProcessedData | null>(null);
  mermaidData = signal<string | null>(null);

  setNotes(data: ProcessedData) {
    this.processedNotes.set(data);
  }
  
  setMermaid(data: string) {
    this.mermaidData.set(data);
  }

  clearAll() {
    this.processedNotes.set(null);
    this.mermaidData.set(null);
  }
}