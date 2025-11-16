import { useState } from 'react';
import { Camera, Mic, RefreshCw, Volume2 } from 'lucide-react';

const imageInsights = [
  {
    title: 'Handwritten Quantum Notes',
    context: 'Scan recognizes chalkboard-style derivations, translating LaTeX-like scribbles into editable text.',
    observations: [
      'Detected Schrödinger equation with potential well boundary conditions.',
      'Highlights mis-labeled axes on energy diagram.',
      'Extracted three follow-up study prompts.',
    ],
  },
  {
    title: 'Biology Textbook Diagram',
    context: 'Explains labeled cell organelles from a smartphone snapshot.',
    observations: [
      'Corrects incorrectly numbered mitochondria labels.',
      'Summarizes ATP flow between mitochondria and cytoplasm.',
      'Suggests mnemonic for remembering organelle functions.',
    ],
  },
  {
    title: 'History Flashcards',
    context: 'Turns sticky-note timelines into structured bullet points.',
    observations: [
      'Chronologically sorts WWII events that were originally scattered.',
      'Adds quick context sentences for each date.',
      'Groups events by theater (Europe vs Pacific).',
    ],
  },
];

const voiceInsights = [
  {
    label: 'Environmental Chemistry Lecture',
    transcript:
      'Captured discussion on carbon sinks, with a reminder to compare peat bog vs. reforestation efficiency.',
    takeaways: [
      'Auto-tagged “radiative forcing” and linked to past notes.',
      'Suggested follow-up question: “How do wetlands amplify methane flux?”.',
    ],
  },
  {
    label: 'Neuroscience Seminar',
    transcript: 'Summarized Q&A about synaptic pruning during adolescence in three crisp bullet points.',
    takeaways: [
      'Flagged “microglia” as a focus term and added definition to glossary.',
      'Created spaced-repetition cards for neurotransmitter pathways.',
    ],
  },
  {
    label: 'Design Critique Meeting',
    transcript: 'Converted casual conversation into action items with owners and due dates.',
    takeaways: [
      'Associated Figma file links directly inside the transcript.',
      'Suggested tone improvements for user onboarding copy.',
    ],
  },
];

const SmartAssistPanel = () => {
  const [imageIndex, setImageIndex] = useState(0);
  const [voiceIndex, setVoiceIndex] = useState(0);

  const image = imageInsights[imageIndex];
  const voice = voiceInsights[voiceIndex];

  const cycleImage = () => setImageIndex((prev) => (prev + 1) % imageInsights.length);
  const cycleVoice = () => setVoiceIndex((prev) => (prev + 1) % voiceInsights.length);

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-light-heading/60 dark:text-dark-glow/60">
              Image Scan & Explain
            </p>
            <h3 className="text-2xl font-display font-bold">{image.title}</h3>
            <p className="text-sm text-light-heading/80 dark:text-dark-glow/80">{image.context}</p>
          </div>
          <button
            onClick={cycleImage}
            className="p-2 rounded-full border border-light-accent/40 dark:border-dark-button/40 hover:scale-105 transition"
            aria-label="Try another demo image"
          >
            <RefreshCw size={18} />
          </button>
        </div>
        <div className="flex items-center gap-3 text-light-accent dark:text-dark-button">
          <Camera size={20} />
          <span className="text-sm font-semibold">Auto OCR + context clues unlocked</span>
        </div>
        <ul className="list-disc list-inside space-y-2 text-sm">
          {image.observations.map((obs) => (
            <li key={obs}>{obs}</li>
          ))}
        </ul>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-light-heading/60 dark:text-dark-glow/60">
              Voice-to-Notes Studio
            </p>
            <h3 className="text-2xl font-display font-bold">{voice.label}</h3>
            <p className="text-sm text-light-heading/80 dark:text-dark-glow/80">{voice.transcript}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={cycleVoice}
              className="p-2 rounded-full border border-light-accent/40 dark:border-dark-button/40 hover:scale-105 transition"
              aria-label="Play next voice demo"
            >
              <RefreshCw size={18} />
            </button>
            <button
              className="p-2 rounded-full border border-light-accent/40 dark:border-dark-button/40 hover:scale-105 transition"
              aria-label="Listen to synthesized note"
            >
              <Volume2 size={18} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 text-light-accent dark:text-dark-button">
          <Mic size={20} />
          <span className="text-sm font-semibold">Real-time transcription + automatic tagging</span>
        </div>
        <ul className="list-disc list-inside space-y-2 text-sm">
          {voice.takeaways.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SmartAssistPanel;
