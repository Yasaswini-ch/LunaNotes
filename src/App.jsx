import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProcessingPage from './pages/ProcessingPage';
import OutputPage from './pages/OutputPage';
import MindmapPage from './pages/MindmapPage';
import ChatPage from './pages/ChatPage';
import HistoryPage from './pages/HistoryPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/processing" element={<ProcessingPage />} />
            <Route path="/output" element={<OutputPage />} />
            <Route path="/mindmap" element={<MindmapPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
