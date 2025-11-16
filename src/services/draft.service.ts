import { Injectable, signal } from '@angular/core';
import { ProcessedData } from '../models/processed-data.model';

const DRAFT_KEY = 'lunanotes-draft';

@Injectable({
  providedIn: 'root',
})
export class DraftService {
  hasDraft = signal(false);

  constructor() {
    this.checkForDraft();
  }

  private checkForDraft() {
    const draftJson = localStorage.getItem(DRAFT_KEY);
    this.hasDraft.set(!!draftJson);
  }

  saveDraft(notes: ProcessedData) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(notes));
    this.hasDraft.set(true);
  }

  getDraft(): ProcessedData | null {
    const draftJson = localStorage.getItem(DRAFT_KEY);
    if (!draftJson) {
      return null;
    }
    try {
      return JSON.parse(draftJson);
    } catch (e) {
      console.error('Failed to parse draft from localStorage', e);
      this.clearDraft(); // Clear corrupted draft
      return null;
    }
  }

  clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    this.hasDraft.set(false);
  }
}
