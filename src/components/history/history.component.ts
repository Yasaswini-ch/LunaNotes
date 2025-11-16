import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FirebaseService, NoteHistoryItem } from '../../services/firebase.service';
import { NotesStoreService } from '../../services/notes-store.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent implements OnInit {
  firebaseService = inject(FirebaseService);
  notesStore = inject(NotesStoreService);
  router = inject(Router);

  history = signal<NoteHistoryItem[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  loadingNoteId = signal<string | null>(null);

  ngOnInit() {
    if (this.firebaseService.user()) {
      this.fetchHistory();
    } else {
      this.error.set("Please sign in to view your history.");
      this.isLoading.set(false);
    }
  }

  async fetchHistory() {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const notes = await this.firebaseService.getNotesHistory();
      this.history.set(notes);
    } catch (e) {
      console.error("Error fetching history:", e);
      this.error.set("Could not load your saved notes. Please try again.");
    } finally {
      this.isLoading.set(false);
    }
  }

  async viewNote(noteId: string) {
    this.loadingNoteId.set(noteId);
    try {
      const noteDetails = await this.firebaseService.getNoteDetails(noteId);
      this.notesStore.setNotes(noteDetails);
      this.router.navigate(['/results']);
    } catch (e) {
      console.error(`Error loading note ${noteId}:`, e);
      alert("Failed to load the note. Please try again.");
    } finally {
      this.loadingNoteId.set(null);
    }
  }

  formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
