import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotes } from '../context/NotesContext';
import { BrainCircuit, MessageSquare, Save, Download } from 'lucide-react';
import { saveNotes } from '../lib/apiClient';
import { firebaseReady, auth } from '../firebase';

const OutputPage = () => {
  const { processedNotes } = useNotes();
  const navigate = useNavigate();

  useEffect(() => {
    if (!processedNotes) {
      navigate('/');
    }
  }, [processedNotes, navigate]);

  if (!processedNotes) {
    return null; // or a loader
  }

  const handleSave = async () => {
    if (firebaseReady && !auth?.currentUser) {
      alert("Please sign in to save your notes.");
      return;
    }
    try {
        await saveNotes(processedNotes);
        alert(firebaseReady ? "Notes saved successfully!" : "Notes saved to your browser.");
    } catch (error) {
        console.error("Error saving notes:", error);
        alert("Failed to save notes. Please try again.");
    }
  };

  const handleDownload = () => {
    const jsonString = JSON.stringify(processedNotes, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lunanotes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const { summary, keypoints, definitions, formulas } = processedNotes;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold font-display">Your Structured Notes</h1>
        <div className="flex gap-4">
          <button onClick={handleSave} className="action-btn">
            <Save size={18} /> Save
          </button>
          <button onClick={handleDownload} className="action-btn">
            <Download size={18} /> Download
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/mindmap" className="card-action group">
            <BrainCircuit size={40} className="text-light-accent dark:text-dark-button"/>
            <div>
                <h3 className="text-xl font-bold">Mindmap View</h3>
                <p className="text-sm opacity-80">Visualize connections and ideas.</p>
            </div>
        </Link>
        <Link to="/chat" className="card-action group">
            <MessageSquare size={40} className="text-light-accent dark:text-dark-button"/>
            <div>
                <h3 className="text-xl font-bold">Chat with Notes</h3>
                <p className="text-sm opacity-80">Ask questions and get instant answers.</p>
            </div>
        </Link>
      </div>
      
      <div className="output-card">
        <h2 className="card-title">Summary</h2>
        <p>{summary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="output-card">
            <h2 className="card-title">Key Points</h2>
            <ul className="list-disc list-inside space-y-2">
                {keypoints.map((point, index) => <li key={index}>{point}</li>)}
            </ul>
        </div>
        <div className="output-card">
            <h2 className="card-title">Definitions</h2>
            <div className="space-y-4">
                {definitions.map(def => (
                    <div key={def.term}>
                        <h3 className="font-bold">{def.term}</h3>
                        <p>{def.definition}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {formulas && formulas.length > 0 && (
        <div className="output-card">
            <h2 className="card-title">Formulas</h2>
            <div className="space-y-4">
            {formulas.map(f => (
                <div key={f.formula} className="p-3 rounded-lg bg-black/5 dark:bg-white/5">
                    <p className="font-mono font-semibold">{f.formula}</p>
                    <p className="text-sm opacity-90">{f.result}</p>
                </div>
            ))}
            </div>
        </div>
      )}

      <style jsx>{`
        .output-card {
          @apply p-6 rounded-2xl bg-light-card/60 dark:bg-dark-card/60 border border-white/20 shadow-lg backdrop-blur-xl;
        }
        .card-title {
          @apply text-2xl font-bold mb-4 font-display text-light-heading dark:text-dark-glow;
        }
        .card-action {
          @apply flex items-center gap-4 text-left p-6 rounded-2xl bg-white/30 dark:bg-black/20 border border-light-accent/30 dark:border-dark-button/30 hover:border-light-accent dark:hover:border-dark-button shadow-md backdrop-blur-md transition-all duration-300 hover:scale-105;
        }
        .action-btn {
            @apply flex items-center gap-2 px-4 py-2 rounded-lg font-semibold border-2 border-light-accent dark:border-dark-button hover:bg-light-accent/20 dark:hover:bg-dark-button/20 transition-colors;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default OutputPage;
