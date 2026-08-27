import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import SessionView from './pages/SessionView';
import Stage1 from './components/Stage1';
import Stage2 from './components/Stage2';
import Stage3 from './components/Stage3';
import Stage4 from './components/Stage4';
import Review from './components/Review';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/session/:sessionId" element={<ProtectedRoute><SessionView /></ProtectedRoute>} />
          <Route path="/session/:sessionId/stage1" element={<ProtectedRoute><Stage1 /></ProtectedRoute>} />
          <Route path="/session/:sessionId/stage2" element={<ProtectedRoute><Stage2 /></ProtectedRoute>} />
          <Route path="/session/:sessionId/stage3" element={<ProtectedRoute><Stage3 /></ProtectedRoute>} />
          <Route path="/session/:sessionId/stage4" element={<ProtectedRoute><Stage4 /></ProtectedRoute>} />
          <Route path="/session/:sessionId/review" element={<ProtectedRoute><Review /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;