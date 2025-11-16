import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NotesStoreService } from '../../services/notes-store.service';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';
import { UserStatsService } from '../../services/user-stats.service';
import { ToastService } from '../../services/toast.service';
import { DraftService } from '../../services/draft.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
})
export class ResultsComponent {
  notesStore = inject(NotesStoreService);
  firebaseService = inject(FirebaseService);
  userStatsService = inject(UserStatsService);
  toastService = inject(ToastService);
  router = inject(Router);
  draftService = inject(DraftService);
  
  notes = computed(() => this.notesStore.processedNotes());
  hasNotes = computed(() => !!this.notes());

  constructor() {
    if (!this.notes()) {
      this.router.navigate(['/']);
    }
  }

  navigateToMindmap = () => {
    this.router.navigate(['/mindmap']);
  }

  navigateToChat = () => {
    this.router.navigate(['/chat']);
  }

  saveNotes = async () => {
    if (!this.firebaseService.user()) {
        this.toastService.show("Please sign in to save your notes.", 'error');
        return;
    }
    const notesData = this.notes();
    if (!notesData) return;

    try {
        const result = await this.firebaseService.saveNotes(notesData);
        // Optimistically update the stats in the UI
        this.userStatsService.updateStats({
          streak: result.streak,
          totalNotes: result.totalNotes,
        });
        
        if (this.firebaseService.isMockMode) {
          this.toastService.show('Note saved in Demo Mode!', 'info');
        } else {
          this.toastService.show('Note saved successfully!', 'success');
        }

        setTimeout(() => {
            this.router.navigate(['/history']);
        }, 1500);

    } catch (e) {
        console.error("Failed to save notes:", e);
        this.toastService.show('Something went wrong while saving. Please try again.', 'error');
    }
  }

  saveAsDraft = () => {
    const notesData = this.notes();
    if (!notesData) return;

    this.draftService.saveDraft(notesData);
    this.toastService.show('Notes saved as a draft!', 'info');
  }

  downloadJson = () => {
    const notesData = this.notes();
    if (!notesData) return;

    const jsonString = JSON.stringify(notesData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lunanotes-notes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  copyToClipboard(content: string, type: string) {
    navigator.clipboard.writeText(content).then(() => {
      this.toastService.show(`${type} copied to clipboard!`, 'success');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      this.toastService.show('Failed to copy to clipboard.', 'error');
    });
  }

  copySummary() {
    const summary = this.notes()?.summary;
    if (summary) {
      this.copyToClipboard(summary, 'Summary');
    }
  }

  copyKeyPoints() {
    const keypoints = this.notes()?.keypoints;
    if (keypoints && keypoints.length > 0) {
      const textToCopy = keypoints.map(p => `• ${p}`).join('\n');
      this.copyToClipboard(textToCopy, 'Key Points');
    }
  }

  copyDefinitions() {
    const definitions = this.notes()?.definitions;
    if (definitions && definitions.length > 0) {
      const textToCopy = definitions.map(d => `${d.term}:\n${d.definition}`).join('\n\n');
      this.copyToClipboard(textToCopy, 'Definitions');
    }
  }
  
  copyFormulas() {
    const formulas = this.notes()?.formulas;
    if (formulas && formulas.length > 0) {
      const textToCopy = formulas.map(f => `${f.formula} = ${f.result}`).join('\n');
      this.copyToClipboard(textToCopy, 'Formulas');
    }
  }

  // Wolfram|Alpha App ID provided by user: 4UWJU9-JTR9
  // Currently using public web links for formula solving.
  // For a deeper integration, the Wolfram|Alpha Short Answers API could be used
  // via a backend cloud function with this App ID.
  getWolframUrl(formula: string): string {
    return `https://www.wolframalpha.com/input/?i=${encodeURIComponent(formula)}`;
  }
}
