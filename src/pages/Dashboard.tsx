import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Users, BookOpen, PenTool, Brain, Database, TrendingUp, MessageCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { currentPlan, messagesUsed, messagesRemaining } = useSubscription();

  const features = [
    {
      name: 'Character Cards',
      icon: Users,
      description: 'Create and manage character profiles',
      link: '/characters',
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Lorebooks',
      icon: BookOpen,
      description: 'Build comprehensive world encyclopedias',
      link: '/lorebooks',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Plotlines',
      icon: PenTool,
      description: 'Generate and organize story arcs',
      link: '/plotlines',
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'AI Writer',
      icon: Brain,
      description: 'Get AI writing predictions and suggestions',
      link: '/ai-writer',
      color: 'from-orange-500 to-orange-600'
    },
    {
      name: 'Facts Database',
      icon: Database,
      description: 'Store and organize research materials',
      link: '/facts',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Ready to continue your creative journey? Choose a tool below to get started.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Messages Used</p>
                <p className="text-2xl font-bold text-gray-900">{messagesUsed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Messages Remaining</p>
                <p className="text-2xl font-bold text-gray-900">{messagesRemaining}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Plan</p>
                <p className="text-2xl font-bold text-gray-900">{currentPlan?.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.name}
              to={feature.link}
              className="group block"
            >
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/characters"
              className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <p className="font-medium text-gray-900">New Character</p>
            </Link>
            <Link
              to="/lorebooks"
              className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
              <p className="font-medium text-gray-900">New Lorebook</p>
            </Link>
            <Link
              to="/plotlines"
              className="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
            >
              <PenTool className="h-8 w-8 text-green-600 mb-2" />
              <p className="font-medium text-gray-900">New Plotline</p>
            </Link>
            <Link
              to="/ai-writer"
              className="p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <Brain className="h-8 w-8 text-orange-600 mb-2" />
              <p className="font-medium text-gray-900">AI Prediction</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}