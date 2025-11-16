import { Injectable, signal } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, User, Auth } from 'firebase/auth';
import { getFunctions, httpsCallable, Functions } from 'firebase/functions';
import { ProcessedData } from '../models/processed-data.model';

// 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
// IMPORTANT: ACTION REQUIRED
// 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
// To fix the "Firebase: Error (auth/api-key-not-valid)" error,
// you must replace the placeholder values below with your own
// Firebase project's configuration.
//
// You can find your Firebase configuration in your project's
// settings page in the Firebase console.
//
// 1. Go to your Firebase project: https://console.firebase.google.com/
// 2. Click the gear icon (Project settings).
// 3. In the "General" tab, scroll down to "Your apps".
// 4. Select your web app.
// 5. Under "Firebase SDK snippet", choose "Config" and copy the values.
// 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId: "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE"
};

// --- MOCK DATA FOR DEMO MODE ---
const MOCK_USER: User = {
  uid: 'mock-user-123',
  displayName: 'Demo User',
  email: 'demo@lunanotes.app',
  photoURL: `https://i.pravatar.cc/40?u=demo@lunanotes.app`,
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  providerId: 'google.com',
  refreshToken: 'mock-token',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-id-token',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
};

const MOCK_PROCESSED_DATA: ProcessedData = {
  summary: "This is a summary of mock notes on basic physics principles, covering concepts like Newton's Second Law, the formula for kinetic energy, the Ideal Gas Law, and Ohm's law.",
  keypoints: [
    "Newton's Second Law states that force equals mass times acceleration (F=ma).",
    "Kinetic energy is the energy an object possesses due to its motion, calculated as half the mass times the velocity squared.",
    "The Ideal Gas Law (PV=nRT) relates the pressure, volume, quantity, and temperature of an ideal gas.",
    "Ohm's law describes the relationship between voltage (V), current (I), and resistance (R) in an electrical circuit."
  ],
  definitions: [
    { term: "Force", definition: "An influence tending to change the motion of a body or produce motion or stress in a stationary body." },
    { term: "Kinetic Energy", definition: "Energy which a body possesses by virtue of being in motion." },
    { term: "Voltage", definition: "An electromotive force or potential difference expressed in volts." }
  ],
  formulas: [
    { formula: "F = m * a", result: "Newton's Second Law of Motion." },
    { formula: "KE = 0.5 * m * v^2", result: "Formula for Kinetic Energy." },
    { formula: "PV = nRT", result: "The Ideal Gas Law." },
    { formula: "V = IR", result: "Ohm's Law." }
  ],
  cleaned: "This is the cleaned version of the user's notes on physics, with typos corrected and formatting improved."
};

const INITIAL_MOCK_HISTORY: NoteHistoryItem[] = [
    { noteId: 'mock-note-1', summary: 'Introduction to Quantum Mechanics', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { noteId: 'mock-note-2', summary: 'History lecture key points', createdAt: new Date(Date.now() - 172800000).toISOString() },
];

const INITIAL_MOCK_DETAILS = new Map<string, ProcessedData>([
    ['mock-note-1', { 
      ...MOCK_PROCESSED_DATA, 
      summary: 'This is a detailed note about Quantum Mechanics.',
      formulas: [
        { formula: "E = h * f", result: "Planck-Einstein relation for photon energy." },
        { formula: "p = h / λ", result: "De Broglie wavelength formula." }
      ]
    }],
    ['mock-note-2', { 
        ...MOCK_PROCESSED_DATA, 
        summary: 'Key points from a history lecture covering the Renaissance period.',
        keypoints: ["The Renaissance was a period of 'rebirth' in Europe.", "Key figures include Leonardo da Vinci and Michelangelo."],
        definitions: [{ term: "Humanism", definition: "A philosophical stance that emphasizes the value and agency of human beings." }],
        formulas: [] // History notes might not have formulas
    }]
]);

const MOCK_DASHBOARD_STATS: DashboardStats = {
    streak: 5,
    totalNotes: 12,
    recentActivity: INITIAL_MOCK_HISTORY,
};

const MOCK_MERMAID_SYNTAX = `mindmap
  root((Summary of Physics Principles))
    Newton's Second Law
      F = m * a
    Kinetic Energy
      KE = 0.5 * m * v^2
    Ideal Gas Law
      PV = nRT
    Ohm's Law
      V = IR
`;

const MOCK_ANALYTICS_DATA: AnalyticsData = {
  avgSessionDuration: [
    { label: "Focus", value: 80 },
    { label: "Break", value: 20 },
  ],
  notesPerWeek: [
    { label: "8w ago", value: 7 },
    { label: "7w ago", value: 5 },
    { label: "6w ago", value: 9 },
    { label: "5w ago", value: 12 },
    { label: "4w ago", value: 8 },
    { label: "3w ago", value: 15 },
    { label: "Last week", value: 11 },
    { label: "This week", value: 6 },
  ],
  topicBreakdown: [
    { label: "Biology", value: 25 },
    { label: "History", value: 18 },
    { label: "Calculus", value: 15 },
    { label: "Chemistry", value: 22 },
    { label: "Art History", value: 9 },
    { label: "Physics", value: 19 },
    { label: "Literature", value: 12 },
  ],
};


export interface NoteHistoryItem {
    noteId: string;
    summary: string;
    createdAt: string;
}

export interface DashboardStats {
    streak: number;
    totalNotes: number;
    recentActivity: NoteHistoryItem[];
}

export interface AnalyticsData {
  avgSessionDuration: { label: string; value: number }[];
  notesPerWeek: { label: string; value: number }[];
  topicBreakdown: { label: string; value: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp | null = null;
  private functions: Functions | null = null;
  private auth: Auth | null = null;
  public isMockMode = false;
  
  user = signal<User | null>(null);

  // In-memory state for demo mode
  private mockHistory = signal<NoteHistoryItem[]>([...INITIAL_MOCK_HISTORY]);
  private mockNoteDetails = new Map<string, ProcessedData>(INITIAL_MOCK_DETAILS);

  constructor() {
    if (firebaseConfig.apiKey === 'PASTE_YOUR_API_KEY_HERE') {
        this.isMockMode = true;
        const warningMessage = `
        ======================================================================
        WARNING: FIREBASE NOT CONFIGURED — RUNNING IN DEMO MODE
        ----------------------------------------------------------------------
        Your Firebase configuration is missing. The app is now running in a
        local demo mode with mock data. Authentication is simulated, and
        no data will be saved.

        To connect to a real backend, please open the file:
        'src/services/firebase.service.ts'
        and replace the placeholder values in the 'firebaseConfig' object
        with your actual Firebase project credentials.
        ======================================================================
        `;
        console.warn(warningMessage);
    } else {
        this.app = initializeApp(firebaseConfig);
        this.functions = getFunctions(this.app);
        this.auth = getAuth(this.app);
        this.setupAuthStateObserver();
    }
  }

  private setupAuthStateObserver() {
    if (this.isMockMode || !this.auth) {
      // In mock mode, we don't listen to a real auth state.
      // Sign-in/out will manually set the user signal.
      return;
    }
    onAuthStateChanged(this.auth, (user) => {
        this.user.set(user);
    });
  }

  async signInWithGoogle() {
      if (this.isMockMode) {
        console.log("DEMO MODE: Simulating Google Sign-In.");
        this.user.set(MOCK_USER);
        return;
      }
      const provider = new GoogleAuthProvider();
      try {
          await signInWithPopup(this.auth!, provider);
      } catch (error) {
          console.error("Error signing in with Google", error);
      }
  }

  async signOut() {
      if (this.isMockMode) {
        console.log("DEMO MODE: Simulating Sign-Out.");
        this.user.set(null);
        return;
      }
      try {
          await signOut(this.auth!);
      } catch (error) {
          console.error("Error signing out", error);
      }
  }

  private async simulateDelay<T>(data: T): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(data), 800));
  }
  
  // Cloud Function Callers
  async processNotes(text: string): Promise<ProcessedData> {
    if (this.isMockMode) {
        console.log("DEMO MODE: Returning mock processed notes.");
        return this.simulateDelay(MOCK_PROCESSED_DATA);
    }
    const processNotesFn = httpsCallable< { text: string }, ProcessedData >(this.functions!, 'processNotes');
    const result = await processNotesFn({ text });
    return result.data;
  }
  
  async saveNotes(processedData: ProcessedData): Promise<{success: boolean, noteId: string, streak: number, totalNotes: number}> {
    if (this.isMockMode) {
        console.log("DEMO MODE: Simulating saving notes and adding to in-memory history.");
        
        const newNoteId = `mock-note-${Date.now()}`;
        const newHistoryItem: NoteHistoryItem = {
            noteId: newNoteId,
            summary: processedData.summary,
            createdAt: new Date().toISOString(),
        };
        
        this.mockHistory.update(currentHistory => [newHistoryItem, ...currentHistory]);
        this.mockNoteDetails.set(newNoteId, processedData);

        MOCK_DASHBOARD_STATS.streak++;
        MOCK_DASHBOARD_STATS.totalNotes++;
        MOCK_DASHBOARD_STATS.recentActivity = this.mockHistory();
        
        return this.simulateDelay({
          success: true,
          noteId: newNoteId,
          streak: MOCK_DASHBOARD_STATS.streak,
          totalNotes: MOCK_DASHBOARD_STATS.totalNotes
        });
    }
    const saveNotesFn = httpsCallable< { processedData: ProcessedData }, {success: boolean, noteId: string, streak: number, totalNotes: number} >(this.functions!, 'saveNotes');
    const result = await saveNotesFn({ processedData });
    return result.data;
  }
  
  async getNotesHistory(): Promise<NoteHistoryItem[]> {
    if (this.isMockMode) {
        console.log("DEMO MODE: Returning in-memory notes history.");
        return this.simulateDelay(this.mockHistory());
    }
    const getNotesHistoryFn = httpsCallable<never, NoteHistoryItem[]>(this.functions!, 'getNotesHistory');
    const result = await getNotesHistoryFn();
    return result.data;
  }
  
  async getNoteDetails(noteId: string): Promise<ProcessedData> {
    if (this.isMockMode) {
        console.log(`DEMO MODE: Returning in-memory details for noteId ${noteId}.`);
        const note = this.mockNoteDetails.get(noteId);
        if (note) {
            return this.simulateDelay(note);
        }
        console.log(`NoteId ${noteId} not found in mock details, returning default.`);
        return this.simulateDelay(MOCK_PROCESSED_DATA);
    }
    const getNoteDetailsFn = httpsCallable<{noteId: string}, ProcessedData>(this.functions!, 'getNoteDetails');
    const result = await getNoteDetailsFn({ noteId });
    return result.data;
  }
  
  async generateMermaidMindmap(processedNotes: ProcessedData): Promise<{mermaidSyntax: string}> {
      if (this.isMockMode) {
          console.log("DEMO MODE: Simulating mermaid mindmap generation.");
          return this.simulateDelay({ mermaidSyntax: MOCK_MERMAID_SYNTAX });
      }
      const generateMindmapFn = httpsCallable<{processedNotes: ProcessedData}, {mermaidSyntax: string}> (this.functions!, 'generateMermaidMindmap');
      const result = await generateMindmapFn({ processedNotes });
      return result.data;
  }
  
  async chatWithNotes(processedNotes: ProcessedData, history: { question: string, answer: string }[], question: string): Promise<string> {
      if (this.isMockMode) {
          console.log("DEMO MODE: Returning mock chat response.");
          const response = `Based on the mock notes, the answer to "${question}" is that focusing on key areas like hydration and sleep is very important for overall well-being.`;
          return this.simulateDelay(response);
      }
      const chatWithNotesFn = httpsCallable<{processedNotes: ProcessedData, history: any, question: string}, {answer: string}>(this.functions!, 'chatWithNotes');
      const result = await chatWithNotesFn({ processedNotes, history, question });
      return result.data.answer;
  }
  
  async getDashboardStats(): Promise<DashboardStats> {
    if (this.isMockMode) {
        console.log("DEMO MODE: Returning mock dashboard stats.");
        return this.simulateDelay(MOCK_DASHBOARD_STATS);
    }
    const getDashboardStatsFn = httpsCallable<never, DashboardStats>(this.functions!, 'getDashboardStats');
    const result = await getDashboardStatsFn();
    return result.data;
  }
  
  async getAnalyticsData(): Promise<AnalyticsData> {
    if (this.isMockMode) {
        console.log("DEMO MODE: Returning mock analytics data.");
        return this.simulateDelay(MOCK_ANALYTICS_DATA);
    }
    // In a real app, you would call a cloud function here.
    // const getAnalyticsDataFn = httpsCallable<never, AnalyticsData>(this.functions!, 'getAnalyticsData');
    // const result = await getAnalyticsDataFn();
    // return result.data;
    return this.simulateDelay(MOCK_ANALYTICS_DATA); // Placeholder
  }
}
