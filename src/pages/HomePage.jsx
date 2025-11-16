import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../context/NotesContext';
import { processNotes } from '../lib/apiClient';
import { firebaseReady, auth } from '../firebase';
import PomodoroTimer from '../components/PomodoroTimer';
import SmartAssistPanel from '../components/SmartAssistPanel';

const HomePage = () => {
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setProcessedNotes, clearNotes } = useNotes();

  const handleProcess = async () => {
    if (!userInput.trim()) {
      setError("Please paste some notes to process.");
      return;
    }

    if (firebaseReady && !auth?.currentUser) {
      setError("Please sign in to process your notes.");
      return;
    }

    setError(null);
    clearNotes();
    navigate('/processing');

    try {
      const result = await processNotes(userInput);
      setProcessedNotes(result);
      navigate('/output');
    } catch (err) {
      console.error("Error calling processNotes function:", err);
      setError("Sorry, something went wrong while processing your notes. Please try again.");
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col items-center text-center gap-12">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 font-display bg-gradient-to-r from-light-accent to-light-heading dark:from-dark-button dark:to-dark-accent bg-clip-text text-transparent animate-[fadeDown_0.8s_ease]">
        Unlock Your Notes with Luna
      </h1>
      <p className="text-lg md:text-xl mb-8 max-w-2xl text-light-heading/80 dark:text-dark-glow/80 animate-[fadeDown_1s_ease]">
        Paste any text — lecture notes, articles, or study guides — and our AI will instantly structure it for you.
      </p>

      <div className="w-full max-w-3xl animate-[fadeUp_0.9s_ease]">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Paste your notes here..."
          className="w-full h-64 p-4 rounded-2xl bg-white/30 dark:bg-black/20 border border-light-accent/30 dark:border-dark-button/30 focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-button focus:outline-none backdrop-blur-md transition placeholder:text-light-heading/50 dark:placeholder:text-dark-glow/50 text-base resize-none"
        ></textarea>
        <button
          onClick={handleProcess}
          className="mt-4 px-8 py-3 rounded-full font-bold text-lg text-white bg-gradient-to-r from-light-accent to-light-heading dark:bg-gradient-to-r dark:from-dark-button dark:to-dark-accent dark:text-dark-bg hover:scale-105 transform transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft-light dark:shadow-soft-dark"
        >
          Process Notes
        </button>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>

      <section className="w-full grid grid-cols-1 xl:grid-cols-2 gap-8 text-left animate-[fadeUp_1s_ease]">
        <PomodoroTimer />
        <SmartAssistPanel />
      </section>
    </div>
  );
};

export default HomePage;
