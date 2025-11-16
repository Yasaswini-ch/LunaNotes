import { Injectable, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { ProcessedData, MindmapNode } from '../models/processed-data.model';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  firebaseService = inject(FirebaseService);

  async generateMindmap(processedNotes: ProcessedData): Promise<string> {
    if (!this.firebaseService.user()) {
      throw new Error('User is not authenticated.');
    }
    
    try {
      const result = await this.firebaseService.generateMermaidMindmap(processedNotes);
      return result.mermaidSyntax;
    } catch (error) {
      console.warn('AI mindmap generation via Firebase failed. Using client-side fallback.', error);
      return this.generateFallbackMindmap(processedNotes);
    }
  }
  
  private generateFallbackMindmap(processedNotes: ProcessedData): string {
    const { summary, keypoints, definitions } = processedNotes;
    
    // Sanitize strings for Mermaid syntax by removing parentheses
    const sanitize = (text: string) => text.replace(/[()]/g, ' ');

    let mermaidString = 'mindmap\n';
    mermaidString += `  root((${sanitize(summary)}))\n`;

    keypoints.forEach((point) => {
      mermaidString += `    ${sanitize(point)}\n`;
    });

    if (definitions && definitions.length > 0) {
      mermaidString += `    Key Definitions\n`;
      definitions.forEach((def) => {
        mermaidString += `      ${sanitize(def.term)}\n`;
      });
    }

    return mermaidString;
  }
}