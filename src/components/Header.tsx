import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { User, LogOut, Settings, CreditCard, Feather } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const { messagesRemaining, currentPlan } = useSubscription();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Feather className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold text-gray-900">PlumaAI</span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link to="/dashboard" className="text-gray-700 hover:text-purple-600 transition-colors">
              Dashboard
            </Link>
            <Link to="/characters" className="text-gray-700 hover:text-purple-600 transition-colors">
              Characters
            </Link>
            <Link to="/lorebooks" className="text-gray-700 hover:text-purple-600 transition-colors">
              Lorebooks
            </Link>
            <Link to="/plotlines" className="text-gray-700 hover:text-purple-600 transition-colors">
              Plotlines
            </Link>
            <Link to="/ai-writer" className="text-gray-700 hover:text-purple-600 transition-colors">
              AI Writer
            </Link>
            <Link to="/facts" className="text-gray-700 hover:text-purple-600 transition-colors">
              Facts
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{messagesRemaining}</span> messages left
            </div>
            <div className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded">
              {currentPlan?.name}
            </div>
            
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-purple-100 transition-colors">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
                ) : (
                  <User className="h-8 w-8 text-gray-600" />
                )}
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
                <Link to="/subscription" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Subscription
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}