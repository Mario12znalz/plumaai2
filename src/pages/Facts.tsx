import React, { useState } from 'react';
import { Database, Plus, Download, Upload, Edit, Trash2, Search, Tag, Calendar } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

interface Fact {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  source: string;
  dateAdded: string;
  lastModified: string;
  priority: 'low' | 'medium' | 'high';
}

export default function Facts() {
  const { useMessage, messagesRemaining } = useSubscription();
  const [facts, setFacts] = useState<Fact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    source: '',
    priority: 'medium' as Fact['priority']
  });

  const categories = ['Research', 'Characters', 'Worldbuilding', 'Plot', 'Historical', 'Scientific', 'Cultural', 'Other'];
  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messagesRemaining <= 0 && !editingId) {
      alert('No messages remaining. Please upgrade your plan.');
      return;
    }

    const fact: Fact = {
      id: editingId || Date.now().toString(),
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      source: formData.source,
      priority: formData.priority,
      dateAdded: editingId ? facts.find(f => f.id === editingId)?.dateAdded || new Date().toISOString() : new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    if (editingId) {
      setFacts(prev => prev.map(f => f.id === editingId ? fact : f));
      // Update localStorage
      const updatedFacts = facts.map(f => f.id === editingId ? fact : f);
      localStorage.setItem('plumaai_facts', JSON.stringify(updatedFacts));
      setEditingId(null);
    } else {
      setFacts(prev => [...prev, fact]);
      // Save to localStorage
      localStorage.setItem('plumaai_facts', JSON.stringify([...facts, fact]));
      useMessage();
    }

    setFormData({
      title: '',
      content: '',
      category: '',
      tags: '',
      source: '',
      priority: 'medium'
    });
    setShowForm(false);
  };

  const handleEdit = (fact: Fact) => {
    setFormData({
      title: fact.title,
      content: fact.content,
      category: fact.category,
      tags: fact.tags.join(', '),
      source: fact.source,
      priority: fact.priority
    });
    setEditingId(fact.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setFacts(prev => prev.filter(f => f.id !== id));
    // Update localStorage
    const updatedFacts = facts.filter(f => f.id !== id);
    localStorage.setItem('plumaai_facts', JSON.stringify(updatedFacts));
  };

  const exportFacts = () => {
    const dataStr = JSON.stringify(facts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'facts-database.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importFacts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedFacts = JSON.parse(e.target?.result as string);
          if (Array.isArray(importedFacts)) {
            setFacts(prev => [...prev, ...importedFacts]);
          } else {
            setFacts(prev => [...prev, importedFacts]);
          }
        } catch (error) {
          alert('Error importing facts. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredFacts = facts.filter(fact => {
    const matchesSearch = fact.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fact.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || fact.category === selectedCategory;
    const matchesPriority = !selectedPriority || fact.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const getPriorityColor = (priority: Fact['priority']) => {
    const priorityConfig = priorities.find(p => p.value === priority);
    return priorityConfig?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Facts Database</h1>
            <p className="text-gray-600 mt-2">Store and organize research materials</p>
          </div>
          <div className="flex space-x-4">
            <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importFacts}
                className="hidden"
              />
            </label>
            <button
              onClick={exportFacts}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Fact
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search facts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Priorities</option>
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>{priority.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{facts.length}</div>
            <div className="text-sm text-gray-600">Total Facts</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{new Set(facts.map(f => f.category)).size}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{facts.filter(f => f.priority === 'high').length}</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">{filteredFacts.length}</div>
            <div className="text-sm text-gray-600">Filtered Results</div>
          </div>
        </div>

        {/* Facts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacts.map((fact) => (
            <div key={fact.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{fact.title}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        {fact.category}
                      </span>
                      <span className={`inline-block text-xs px-2 py-1 rounded-full ${getPriorityColor(fact.priority)}`}>
                        {fact.priority.charAt(0).toUpperCase() + fact.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-2">
                    <button
                      onClick={() => handleEdit(fact)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(fact.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{fact.content}</p>

                {fact.source && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-gray-600 mb-1">Source:</div>
                    <div className="text-xs text-gray-800 bg-gray-50 p-2 rounded">{fact.source}</div>
                  </div>
                )}

                {fact.tags.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center mb-1">
                      <Tag className="h-3 w-3 text-gray-500 mr-1" />
                      <span className="text-xs font-medium text-gray-600">Tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {fact.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  Added {new Date(fact.dateAdded).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFacts.length === 0 && (
          <div className="text-center py-12">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {facts.length === 0 ? 'No facts yet' : 'No facts match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {facts.length === 0 ? 'Add your first fact to get started' : 'Try adjusting your search or filters'}
            </p>
            {facts.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add First Fact
              </button>
            )}
          </div>
        )}

        {/* Fact Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {editingId ? 'Edit Fact' : 'Add New Fact'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Fact['priority'] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        {priorities.map((priority) => (
                          <option key={priority.value} value={priority.value}>{priority.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="URL, book title, research paper, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setFormData({
                          title: '',
                          content: '',
                          category: '',
                          tags: '',
                          source: '',
                          priority: 'medium'
                        });
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {editingId ? 'Update Fact' : 'Add Fact'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}