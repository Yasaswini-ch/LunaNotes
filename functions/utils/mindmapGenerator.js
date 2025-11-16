// This utility generates a mindmap structure in Mermaid syntax.
const generateMermaidMindmap = (processedNotes) => {
  const { summary, keypoints, definitions } = processedNotes;
  
  // Helper to sanitize text for Mermaid syntax (e.g., remove parentheses)
  const sanitize = (text) => text.replace(/[()]/g, ' ');

  let mermaidString = 'mindmap\n';
  mermaidString += `  root((${sanitize(summary)}))\n`;

  keypoints.forEach((kp) => {
    mermaidString += `    ${sanitize(kp)}\n`;
    
    // Simple logic to find related definitions for a keypoint
    const kpLower = kp.toLowerCase();
    const relatedDefs = definitions.filter(def => {
        const termWords = def.term.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        return termWords.some(word => kpLower.includes(word));
    });

    relatedDefs.forEach(def => {
        mermaidString += `      ${sanitize(def.term)}\n`;
    });
  });

  return mermaidString;
};

module.exports = { generateMermaidMindmap };
