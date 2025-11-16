import { httpsCallable } from 'firebase/functions';
import { firebaseReady, functions } from '../firebase';
import {
  processNotesLocal,
  generateMindmapLocal,
  chatWithNotesLocal,
  saveNotesLocal,
  getNotesHistoryLocal,
  getNoteDetailsLocal,
} from './fallbackApi';

const callFunction = async (name, payload) => {
  const fn = httpsCallable(functions, name);
  const result = await fn(payload);
  return result.data;
};

export const processNotes = async (text) => {
  if (firebaseReady && functions) {
    return callFunction('processNotes', { text });
  }
  return processNotesLocal(text);
};

export const generateMindmap = async (processedNotes) => {
  if (firebaseReady && functions) {
    return callFunction('generateMindmap', { processedNotes });
  }
  return generateMindmapLocal(processedNotes);
};

export const chatWithNotes = async ({ processedNotes, history, question }) => {
  if (firebaseReady && functions) {
    return callFunction('chatWithNotes', { processedNotes, history, question });
  }
  return chatWithNotesLocal({ processedNotes, question });
};

export const saveNotes = async (processedNotes) => {
  if (firebaseReady && functions) {
    return callFunction('saveNotes', { processedData: processedNotes });
  }
  return saveNotesLocal(processedNotes);
};

export const getNotesHistory = async () => {
  if (firebaseReady && functions) {
    return callFunction('getNotesHistory');
  }
  return getNotesHistoryLocal();
};

export const getNoteDetails = async (noteId) => {
  if (firebaseReady && functions) {
    return callFunction('getNoteDetails', { noteId });
  }
  return getNoteDetailsLocal(noteId);
};
