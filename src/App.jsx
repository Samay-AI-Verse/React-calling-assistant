import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardStats from './pages/DashboardStats';
import Candidates from './pages/Candidates';
import Campaigns from './pages/Campaigns';
import VideoAssistant from './pages/VideoAssistant';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardStats />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="video-assistant" element={<VideoAssistant />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
