import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CharacterCards from './pages/CharacterCards';
import Lorebooks from './pages/Lorebooks';
import Plotlines from './pages/Plotlines';
import AIWriter from './pages/AIWriter';
import Facts from './pages/Facts';
import Settings from './pages/Settings';
import Subscription from './pages/Subscription';
import RoleplayChat from './pages/RoleplayChat';
import StoryLibrary from './pages/StoryLibrary';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white">
      <Header />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/characters" element={user ? <CharacterCards /> : <Navigate to="/login" />} />
        <Route path="/lorebooks" element={user ? <Lorebooks /> : <Navigate to="/login" />} />
        <Route path="/plotlines" element={user ? <Plotlines /> : <Navigate to="/login" />} />
        <Route path="/ai-writer" element={user ? <AIWriter /> : <Navigate to="/login" />} />
        <Route path="/facts" element={user ? <Facts /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/subscription" element={user ? <Subscription /> : <Navigate to="/login" />} />
        <Route path="/roleplay" element={user ? <RoleplayChat /> : <Navigate to="/login" />} />
        <Route path="/library" element={user ? <StoryLibrary /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SubscriptionProvider>
          <AppContent />
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;