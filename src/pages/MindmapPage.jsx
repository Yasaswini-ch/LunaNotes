import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../context/NotesContext';
import { generateMindmap } from '../lib/apiClient';
import { firebaseReady, auth } from '../firebase';
import MindmapGraph from '../components/MindmapGraph';
import Loader from '../components/Loader';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';

const MindmapPage = () => {
  const { processedNotes, mindmapData, setMindmapData } = useNotes();
  const navigate = useNavigate();
  const [nodes, setNodes] = useState(mindmapData?.nodes || []);
  const [edges, setEdges] = useState(mindmapData?.edges || []);
  const [isLoading, setIsLoading] = useState(!mindmapData);
  const [error, setError] = useState(null);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  useEffect(() => {
    if (!processedNotes) {
      navigate('/');
      return;
    }

    const fetchMindmap = async () => {
      if (!mindmapData) {
        setIsLoading(true);
        setError(null);
        if (firebaseReady && !auth?.currentUser) {
          setError("Please sign in to generate a mindmap.");
          setIsLoading(false);
          return;
        }
        try {
          const data = await generateMindmap(processedNotes);
          setMindmapData(data);
          setNodes(data.nodes);
          setEdges(data.edges);
        } catch (err) {
          console.error("Error generating mindmap:", err);
          setError("Could not generate mindmap. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchMindmap();
  }, [processedNotes, mindmapData, setMindmapData, navigate]);

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 font-display">Mindmap Visualization</h1>
      <div className="w-full h-[65vh] rounded-2xl bg-light-card/30 dark:bg-dark-card/30 border border-white/20 shadow-lg overflow-hidden">
        {isLoading && <div className="flex items-center justify-center h-full"><Loader text="Building mindmap..." /></div>}
        {error && <p className="text-red-500 text-center mt-8">{error}</p>}
        {!isLoading && !error && nodes.length > 0 && (
          <MindmapGraph nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} />
        )}
      </div>
    </div>
  );
};

export default MindmapPage;
