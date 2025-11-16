import React, { createContext, useState, useContext } from 'react';

const NotesContext = createContext();

export const useNotes = () => useContext(NotesContext);

export const NotesProvider = ({ children }) => {
  const [processedNotes, setProcessedNotes] = useState(null);
  const [mindmapData, setMindmapData] = useState(null);

  const clearNotes = () => {
    setProcessedNotes(null);
    setMindmapData(null);
  }

  const value = {
    processedNotes,
    setProcessedNotes,
    mindmapData,
    setMindmapData,
    clearNotes
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};
