import { getDemoNotes } from './demoContent';

const HISTORY_KEY = 'lunanotes-history';
const MAX_HISTORY_ITEMS = 25;

const tidalLockingDemo = {
  summary:
    'Tidal locking keeps one lunar hemisphere facing Earth because the Moon’s rotation period slowed until it matched its orbital period, driven by gravity gradients that raised bulges and dissipated energy.',
  keypoints: [
    '1. Synodic month ≈ 29.5 days so rotation = revolution.',
    '2. Gravity gradients created torque that slowed early rotation.',
    '3. Waxing phases add illumination, waning phases remove it.',
    '4. Eclipses only happen when Sun, Earth, and Moon align perfectly.',
    '5. Illumination can be approximated by (1 + cos θ) / 2.',
  ],
  definitions: [
    { term: 'Tidal Locking', definition: 'State where rotational period equals orbital period due to gravitational torques.' },
    { term: 'Synodic Month', definition: '≈29.5 days; time for the Moon to reach the same phase relative to the Sun.' },
    { term: 'Waxing', definition: 'Portion of the lunar disk that is illuminated is increasing.' },
    { term: 'Waning', definition: 'Illuminated fraction is decreasing after the full moon.' },
    { term: 'Tidal Resonance', definition: 'Long-term gravitational interaction that locks rotation to orbital motion.' },
  ],
  formulas: [{ formula: 'Illumination ≈ (1 + cos θ) / 2', result: 'θ is the Sun–Earth–Moon angle describing visible fraction.' }],
  mindmapSeed: {
    nodes: [
      { id: 'root', data: { label: 'Tidal Locking Explainer' }, position: { x: 300, y: 40 }, type: 'input' },
      { id: 'kp-1', data: { label: 'Synodic month ≈ 29.5 days' }, position: { x: 80, y: 180 } },
      { id: 'kp-2', data: { label: 'Gravity gradient slows rotation' }, position: { x: 300, y: 180 } },
      { id: 'kp-3', data: { label: 'Same lunar face toward Earth' }, position: { x: 520, y: 180 } },
      { id: 'kp-4', data: { label: 'Waxing vs. waning illumination' }, position: { x: 170, y: 320 } },
      { id: 'kp-5', data: { label: 'Eclipse requires alignment' }, position: { x: 430, y: 320 } },
    ],
    edges: [
      { id: 'root-kp-1', source: 'root', target: 'kp-1' },
      { id: 'root-kp-2', source: 'root', target: 'kp-2' },
      { id: 'root-kp-3', source: 'root', target: 'kp-3' },
      { id: 'root-kp-4', source: 'root', target: 'kp-4' },
      { id: 'root-kp-5', source: 'root', target: 'kp-5' },
    ],
  },
  chatSeed: [
    {
      match: 'same lunar hemisphere',
      answer:
        'Because the Moon’s rotation slowed until it matched its orbital period. Gravity gradients raised tidal bulges that dissipated energy, locking one hemisphere to Earth.',
    },
    {
      match: 'synodic month',
      answer:
        'The synodic month is about 29.5 days—the time it takes to reach the same phase again relative to the Sun-Earth line, so it governs the phase cycle you see.',
    },
    {
      match: 'illumination',
      answer:
        'You can estimate illumination with (1 + cos θ) / 2, where θ is the angle between the Sun, Earth, and Moon. Waxing phases push θ toward 0°, waning moves it toward 180°.',
    },
  ],
};

const tidalLockingKeywords = [/tidal\s+locking/i, /moon\s+phases?/i, /synodic\s+month/i, /lunar\s+face/i];

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const safeStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch (error) {
    console.warn('[LunaNotes] Local storage is unavailable:', error);
    return null;
  }
};

const getDemoHistory = () => getDemoNotes();

const persistHistory = (history) => {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn('[LunaNotes] Failed to persist history to storage:', error);
  }
};

const readHistory = () => {
  const storage = safeStorage();
  if (!storage) {
    return getDemoHistory();
  }

  try {
    const raw = storage.getItem(HISTORY_KEY);
    if (!raw) {
      const demo = getDemoHistory();
      persistHistory(demo);
      return demo;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const demo = getDemoHistory();
      persistHistory(demo);
      return demo;
    }
    return parsed;
  } catch (error) {
    console.warn('[LunaNotes] Failed to read history from storage:', error);
    const demo = getDemoHistory();
    persistHistory(demo);
    return demo;
  }
};

const createId = () => `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const extractSentences = (text) =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

export const processNotesLocal = async (text) => {
  await delay();
  if (tidalLockingKeywords.some((rx) => rx.test(text))) {
    return {
      ...tidalLockingDemo,
      topicTag: 'tidal-locking',
    };
  }

  const sentences = extractSentences(text);
  const summary = sentences.slice(0, 3).join(' ') || text.slice(0, 240) || 'No summary available yet.';
  const keypoints = sentences.slice(0, 8).map((sentence, index) => `${index + 1}. ${sentence}`);

  const definitions = sentences
    .filter((sentence) => sentence.includes(':'))
    .slice(0, 4)
    .map((sentence) => {
      const [term, ...rest] = sentence.split(':');
      return {
        term: term.trim(),
        definition: rest.join(':').trim() || 'Definition unavailable',
      };
    });

  const formulaMatches = Array.from(text.matchAll(/([\w\s]+)=([^\n\r]+)/g)).slice(0, 3);
  const formulas = formulaMatches.map((match) => ({
    formula: match[0].trim(),
    result: match[2]?.trim() || '',
  }));

  return {
    summary,
    keypoints,
    definitions,
    formulas,
  };
};

export const generateMindmapLocal = async (processedNotes) => {
  await delay();
  if (processedNotes?.mindmapSeed) {
    return processedNotes.mindmapSeed;
  }
  const nodes = [];
  const edges = [];

  nodes.push({
    id: 'root',
    data: { label: 'Summary' },
    position: { x: 300, y: 50 },
    type: 'input',
  });

  (processedNotes?.keypoints || []).slice(0, 8).forEach((point, index) => {
    const id = `kp-${index}`;
    nodes.push({
      id,
      data: { label: point.replace(/^\d+\.\s*/, '') },
      position: { x: 80 + (index % 4) * 200, y: 180 + Math.floor(index / 4) * 140 },
    });
    edges.push({ id: `root-${id}`, source: 'root', target: id });
  });

  return { nodes, edges };
};

export const chatWithNotesLocal = async ({ question, processedNotes }) => {
  await delay();
  const questionLower = question?.toLowerCase?.() || '';
  if (processedNotes?.chatSeed?.length) {
    const matched = processedNotes.chatSeed.find((entry) => questionLower.includes(entry.match));
    if (matched) {
      return { answer: matched.answer, question };
    }
    return {
      answer:
        'Tidal locking ties directly to the key points we extracted: the Moon’s rotation equals its orbital period, so illumination follows (1 + cos θ)/2 and phases wax or wane depending on that angle. Ask about synodic months, eclipses, or illumination for more details!',
      question,
    };
  }
  const summary = processedNotes?.summary || 'your notes';
  const answer = `Based on ${summary.toLowerCase().startsWith('your') ? summary : 'your notes'}, I would focus on: ${
    processedNotes?.keypoints?.slice(0, 2).join(' · ') || 'the main ideas you highlighted'
  }. Keep exploring!`;
  return { answer, question };
};

export const saveNotesLocal = async (processedNotes) => {
  await delay();
  const history = readHistory();
  const noteId = createId();
  const entry = {
    noteId,
    summary: processedNotes?.summary || 'Untitled notes',
    createdAt: new Date().toISOString(),
    data: processedNotes,
  };
  history.unshift(entry);
  if (history.length > MAX_HISTORY_ITEMS) {
    history.length = MAX_HISTORY_ITEMS;
  }
  persistHistory(history);
  return { noteId };
};

export const getNotesHistoryLocal = async () => {
  await delay();
  return readHistory().map(({ data, ...rest }) => rest);
};

export const getNoteDetailsLocal = async (noteId) => {
  await delay();
  const entry = readHistory().find((item) => item.noteId === noteId);
  if (!entry) throw new Error('Note not found');
  return entry.data;
};
