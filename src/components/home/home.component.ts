import { Component, ChangeDetectionStrategy, signal, inject, effect, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotesStoreService } from '../../services/notes-store.service';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { FirebaseService } from '../../services/firebase.service';
import { DraftService } from '../../services/draft.service';
import { ToastService } from '../../services/toast.service';

declare var pdfjsLib: any;
declare var mammoth: any;
declare var SpeechRecognition: any;
declare var webkitSpeechRecognition: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ProgressBarComponent],
})
export class HomeComponent implements OnDestroy {
  firebaseService = inject(FirebaseService);
  notesStore = inject(NotesStoreService);
  router = inject(Router);
  draftService = inject(DraftService);
  toastService = inject(ToastService);

  userInput = signal('');
  isLoading = signal(false);
  error = signal<string | null>(null);
  progress = signal(0);
  loadingMessage = signal('Warming up the AI...');
  isDragging = signal(false);
  isParsingFile = signal(false);
  processedFileName = signal<string | null>(null);
  isRecording = signal(false);
  
  private progressInterval: any;
  private recognition: any;

  constructor() {
    effect(() => {
      const user = this.firebaseService.user();
      // You could add logic here if you want, e.g. greet user
    });

    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;
    }

    this.initializeSpeechRecognition();
  }

  ngOnDestroy(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    if (this.recognition && this.isRecording()) {
        this.isRecording.set(false);
        this.recognition.abort();
    }
  }

  private initializeSpeechRecognition() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionApi = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionApi();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          this.userInput.update(current => (current ? current.trim() + ' ' : '') + transcript.trim());
        }
      };

      this.recognition.onerror = (event: any) => {
        let errorMessage = `Speech recognition error: ${event.error}`;
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          errorMessage = 'Microphone access was denied. Please allow microphone access in your browser settings.';
        } else if (event.error === 'no-speech') {
          errorMessage = 'No speech was detected. Please try again.';
        }
        this.error.set(errorMessage);
        this.isRecording.set(false);
      };

      this.recognition.onend = () => {
        // If it stops unexpectedly, restart it, but only if the user hasn't manually stopped it.
        if (this.isRecording()) {
          this.recognition.start();
        }
      };
    } else {
      this.recognition = null;
    }
  }

  toggleRecording = () => {
    if (!this.recognition) {
      this.error.set('Speech recognition is not supported in this browser.');
      return;
    }

    if (this.isRecording()) {
      this.isRecording.set(false); // Set flag first to prevent restart on 'end' event
      this.recognition.stop();
    } else {
      this.userInput.set(''); // Start with a clean slate for recording
      this.processedFileName.set(null);
      this.error.set(null);
      try {
        this.recognition.start();
        this.isRecording.set(true);
      } catch (e) {
        this.error.set('Could not start microphone. Please check permissions.');
        this.isRecording.set(false);
      }
    }
  }

  processText = async () => {
    if (!this.userInput().trim()) return;

    if (!this.firebaseService.user()) {
      this.error.set('Please sign in to process notes.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.notesStore.clearAll();
    this.startProgressBar();

    try {
      const processedData = await this.firebaseService.processNotes(this.userInput());
      this.loadingMessage.set('Done! Redirecting...');
      this.progress.set(100);
      this.notesStore.setNotes(processedData);
      
      setTimeout(() => {
        this.router.navigate(['/results']);
        this.isLoading.set(false);
        this.userInput.set('');
        this.processedFileName.set(null);
      }, 500);

    } catch (e) {
      console.error('Failed to process text:', e);
      this.error.set('Something went wrong while processing your notes. Please try again.');
      this.isLoading.set(false);
    } finally {
      clearInterval(this.progressInterval);
    }
  }

  private startProgressBar() {
    this.progress.set(0);
    this.loadingMessage.set('Sending notes to Luna...');
    
    this.progressInterval = setInterval(() => {
        this.progress.update(p => {
            if (p < 30) {
                this.loadingMessage.set('Analyzing structure...');
                return p + 5;
            }
            if (p < 70) {
                this.loadingMessage.set('Extracting key points...');
                return p + 2;
            }
            if (p < 95) {
                this.loadingMessage.set('Generating summary...');
                return p + 1;
            }
            return p; // hold at 95%
        });
    }, 400);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
      input.value = ''; // Reset file input
    }
  }

  async handleFile(file: File) {
    this.isParsingFile.set(true);
    this.error.set(null);
    this.userInput.set(''); // Clear previous text
    this.processedFileName.set(null); // Clear previous file name

    try {
      let text = '';
      if (file.type === 'application/pdf') {
        text = await this.extractTextFromPdf(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        text = await this.extractTextFromDocx(file);
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        text = await file.text();
      } else {
        throw new Error('Unsupported file type. Please use PDF, DOCX, or TXT.');
      }
      this.userInput.set(text);
      this.processedFileName.set(file.name);
    } catch (e: any) {
      console.error('File parsing error:', e);
      this.error.set(e.message || 'Failed to read the file.');
    } finally {
      this.isParsingFile.set(false);
    }
  }

  clearFile() {
    this.userInput.set('');
    this.processedFileName.set(null);
  }

  loadDraft() {
    const draft = this.draftService.getDraft();
    if (draft) {
      this.notesStore.setNotes(draft);
      this.draftService.clearDraft();
      this.toastService.show('Draft loaded successfully!', 'success');
      this.router.navigate(['/results']);
    } else {
      this.toastService.show('Could not load draft.', 'error');
    }
  }

  private async extractTextFromPdf(file: File): Promise<string> {
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('PDF processing library is not loaded.');
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return fullText;
  }

  private async extractTextFromDocx(file: File): Promise<string> {
    if (typeof mammoth === 'undefined') {
      throw new Error('DOCX processing library is not loaded.');
    }
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
}