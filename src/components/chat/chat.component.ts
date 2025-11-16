import { Component, ChangeDetectionStrategy, signal, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesStoreService } from '../../services/notes-store.service';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { FirebaseService } from '../../services/firebase.service';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, SkeletonLoaderComponent],
})
export class ChatComponent implements OnInit {
  notesStore = inject(NotesStoreService);
  firebaseService = inject(FirebaseService);
  router = inject(Router);

  notes = computed(() => this.notesStore.processedNotes());
  chatHistory = signal<ChatMessage[]>([]);
  isLoading = signal(false);
  userInput = signal('');

  ngOnInit() {
    if (!this.notes()) {
      this.router.navigate(['/']);
    } else {
      this.chatHistory.set([{ sender: 'ai', text: 'Hello! Ask me anything about your notes.' }]);
    }
  }

  sendMessage = async () => {
    const question = this.userInput().trim();
    if (!question || this.isLoading() || !this.notes()) return;
    
    if (!this.firebaseService.user()) {
        alert("Please sign in to chat with your notes.");
        return;
    }

    const previousHistory = this.chatHistory();
    this.chatHistory.update(history => [...history, { sender: 'user', text: question }]);
    this.userInput.set('');
    this.isLoading.set(true);

    try {
      const historyForApi: { question: string; answer: string }[] = [];
      for (let i = 1; i < previousHistory.length; i += 2) {
        const userMsg = previousHistory[i];
        const aiMsg = previousHistory[i + 1];
        if (userMsg?.sender === 'user' && aiMsg?.sender === 'ai') {
          historyForApi.push({ question: userMsg.text, answer: aiMsg.text });
        }
      }
        
      const answer = await this.firebaseService.chatWithNotes(this.notes()!, historyForApi, question);
      this.chatHistory.update(history => [...history, { sender: 'ai', text: answer }]);
    } catch (e) {
      console.error('Chat failed:', e);
      this.chatHistory.update(history => [...history, { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      this.isLoading.set(false);
    }
  }
}
