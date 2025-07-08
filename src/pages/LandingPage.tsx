import React from 'react';
import { Link } from 'react-router-dom';
import { Feather, Users, BookOpen, PenTool, Brain, Database, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-8">
              <Feather className="h-16 w-16 text-purple-600" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              PlumaAI
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The ultimate AI-powered writing platform. Create characters, build worlds, 
              craft plots, and let AI inspire your next masterpiece.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/subscription"
                className="bg-white text-purple-600 border-2 border-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Create
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive tools for every aspect of creative writing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Users className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Character Cards</h3>
              <p className="text-gray-600">
                Create detailed character profiles with AI assistance. Export as PNG cards 
                for easy sharing and reference.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <BookOpen className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lorebooks</h3>
              <p className="text-gray-600">
                Build comprehensive world encyclopedias. Track locations, cultures, 
                histories, and mythologies.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <PenTool className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Plotlines</h3>
              <p className="text-gray-600">
                Generate and organize story arcs. Track character development 
                and plot progression.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Brain className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Writer</h3>
              <p className="text-gray-600">
                Predict what AI will write next. Get inspiration and overcome 
                writer's block with intelligent suggestions.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Database className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Facts Database</h3>
              <p className="text-gray-600">
                Store and organize research, facts, and reference materials 
                for your writing projects.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <ArrowRight className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Import & Export</h3>
              <p className="text-gray-600">
                Full import/export functionality for all your creative content. 
                Never lose your work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600">
              Professional AI models for serious writers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Basic</h3>
                <div className="text-3xl font-bold text-purple-600 mb-4">$10<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-gray-600 mb-6">Perfect for getting started</p>
                <ul className="space-y-2 text-sm text-gray-600 mb-8">
                  <li>• 600 messages per day</li>
                  <li>• Cydonia 22B model</li>
                  <li>• 8K context window</li>
                  <li>• All AI features</li>
                </ul>
                <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                  Get Started
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-purple-600 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Standard</h3>
                <div className="text-3xl font-bold text-purple-600 mb-4">$18<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-gray-600 mb-6">For serious writers</p>
                <ul className="space-y-2 text-sm text-gray-600 mb-8">
                  <li>• 800 messages per day</li>
                  <li>• Cydonia 22B model</li>
                  <li>• 8K context window</li>
                  <li>• Priority support</li>
                  <li>• Advanced exports</li>
                </ul>
                <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                  Get Started
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro</h3>
                <div className="text-3xl font-bold text-purple-600 mb-4">$25<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-gray-600 mb-6">Maximum power</p>
                <ul className="space-y-2 text-sm text-gray-600 mb-8">
                  <li>• 1000 messages per day</li>
                  <li>• Cydonia 22B model</li>
                  <li>• 16K context window</li>
                  <li>• Premium support</li>
                  <li>• Custom models</li>
                </ul>
                <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Feather className="h-8 w-8 text-purple-400" />
              <span className="ml-2 text-xl font-bold">PlumaAI</span>
            </div>
            <p className="text-gray-400">
              Empowering writers with AI technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}