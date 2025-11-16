import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../context/NotesContext';
import { firebaseReady, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getNotesHistory, getNoteDetails } from '../lib/apiClient';
import Loader from '../components/Loader';
import { BookMarked } from 'lucide-react';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingNoteId, setLoadingNoteId] = useState(null);
  const { setProcessedNotes } = useNotes();
  const navigate = useNavigate();

  useEffect(() => {
    if (!firebaseReady) {
      fetchHistory();
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchHistory();
      } else {
        setError("Please sign in to view your history.");
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNotesHistory();
      setHistory(data);
      if (!firebaseReady) {
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Could not load your saved notes. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewNote = async (noteId) => {
    setLoadingNoteId(noteId);
    try {
      const data = await getNoteDetails(noteId);
      setProcessedNotes(data);
      navigate('/output');
    } catch (err) {
      console.error(`Error loading note ${noteId}:`, err);
      alert("Failed to load the note. It may have been deleted or there was a network issue.");
    } finally {
      setLoadingNoteId(null);
    }
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader text="Loading your history..." />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold font-display mb-8 text-center">Your Saved Notes</h1>
      {history.length === 0 ? (
        <div className="text-center text-light-heading/80 dark:text-dark-glow/80">
          <BookMarked size={48} className="mx-auto mb-4" />
          <p className="text-xl">You haven't saved any notes yet.</p>
          <p>Process some notes and click "Save" to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((note) => (
            <div key={note.noteId} className="history-card">
              <p className="font-semibold text-lg line-clamp-3">{note.summary}</p>
              <p className="text-sm text-light-heading/70 dark:text-dark-glow/70 mt-2">
                Saved on {formatDate(note.createdAt)}
              </p>
              <button
                onClick={() => handleViewNote(note.noteId)}
                disabled={loadingNoteId === note.noteId}
                className="w-full mt-4 px-4 py-2 rounded-lg font-semibold border-2 border-light-accent dark:border-dark-button hover:bg-light-accent/20 dark:hover:bg-dark-button/20 transition-colors disabled:opacity-50"
              >
                {loadingNoteId === note.noteId ? 'Loading...' : 'View Note'}
              </button>
            </div>
          ))}
        </div>
      )}
      <style jsx>{`
        .history-card {
          @apply p-6 rounded-2xl bg-light-card/60 dark:bg-dark-card/60 border border-white/20 shadow-lg backdrop-blur-xl flex flex-col justify-between transition-transform hover:scale-105;
        }
        .line-clamp-3 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
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

export default HistoryPage;
