import React, { useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTheme } from '../context/ThemeContext';

const MindmapGraph = ({ nodes, edges, onNodesChange, onEdgesChange }) => {
  const { theme } = useTheme();

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} color={theme === 'light' ? '#ee6983' : '#9d85b6'} />
      </ReactFlow>
    </div>
  );
};

export default MindmapGraph;
