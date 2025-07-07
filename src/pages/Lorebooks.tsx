import React, { useState } from 'react';
import { BookOpen, Plus, Download, Upload, Edit, Trash2, Search } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

interface LorebookEntry {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Lorebook {
  id: string;
  name: string;
  description: string;
  entries: LorebookEntry[];
  createdAt: string;
}

export default function Lorebooks() {
  const { useMessage, messagesRemaining } = useSubscription();
  const [lorebooks, setLorebooks] = useState<Lorebook[]>([]);
  const [selectedLorebook, setSelectedLorebook] = useState<string | null>(null);
  const [showLorebookForm, setShowLorebookForm] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [lorebookForm, setLorebookForm] = useState({
    name: '',
    description: ''
  });

  const [entryForm, setEntryForm] = useState({
    title: '',
    category: '',
    description: '',
    content: '',
    tags: ''
  });

  const categories = ['Characters', 'Locations', 'Organizations', 'History', 'Magic', 'Technology', 'Culture', 'Other'];

  const handleCreateLorebook = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newLorebook: Lorebook = {
      id: Date.now().toString(),
      name: lorebookForm.name,
      description: lorebookForm.description,
      entries: [],
      createdAt: new Date().toISOString()
    };

    setLorebooks(prev => [...prev, newLorebook]);
    setLorebookForm({ name: '', description: '' });
    setShowLorebookForm(false);
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (messagesRemaining <= 0) {
      alert('No messages remaining. Please upgrade your plan.');
      return;
    }

    if (!selectedLorebook) return;

    const entry: LorebookEntry = {
      id: editingEntry || Date.now().toString(),
      title: entryForm.title,
      category: entryForm.category,
      description: entryForm.description,
      content: entryForm.content,
      tags: entryForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: editingEntry ? lorebooks.find(l => l.id === selectedLorebook)?.entries.find(e => e.id === editingEntry)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setLorebooks(prev => prev.map(lorebook => {
      if (lorebook.id === selectedLorebook) {
        if (editingEntry) {
          return {
            ...lorebook,
            entries: lorebook.entries.map(e => e.id === editingEntry ? entry : e)
          };
        } else {
          return {
            ...lorebook,
            entries: [...lorebook.entries, entry]
          };
        }
      }
      return lorebook;
    }));

    if (!editingEntry) {
      useMessage();
    }

    setEntryForm({ title: '', category: '', description: '', content: '', tags: '' });
    setShowEntryForm(false);
    setEditingEntry(null);
  };

  const handleEditEntry = (entry: LorebookEntry) => {
    setEntryForm({
      title: entry.title,
      category: entry.category,
      description: entry.description,
      content: entry.content,
      tags: entry.tags.join(', ')
    });
    setEditingEntry(entry.id);
    setShowEntryForm(true);
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!selectedLorebook) return;
    
    setLorebooks(prev => prev.map(lorebook => {
      if (lorebook.id === selectedLorebook) {
        return {
          ...lorebook,
          entries: lorebook.entries.filter(e => e.id !== entryId)
        };
      }
      return lorebook;
    }));
  };

  const handleDeleteLorebook = (lorebookId: string) => {
    setLorebooks(prev => prev.filter(l => l.id !== lorebookId));
    if (selectedLorebook === lorebookId) {
      setSelectedLorebook(null);
    }
  };

  const exportLorebook = (lorebook: Lorebook) => {
    const dataStr = JSON.stringify(lorebook, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${lorebook.name}-lorebook.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportAllLorebooks = () => {
    const dataStr = JSON.stringify(lorebooks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'all-lorebooks.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importLorebooks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          if (Array.isArray(imported)) {
            setLorebooks(prev => [...prev, ...imported]);
          } else {
            setLorebooks(prev => [...prev, imported]);
          }
        } catch (error) {
          alert('Error importing lorebooks. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const currentLorebook = selectedLorebook ? lorebooks.find(l => l.id === selectedLorebook) : null;
  const filteredEntries = currentLorebook?.entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lorebooks</h1>
            <p className="text-gray-600 mt-2">Build comprehensive world encyclopedias</p>
          </div>
          <div className="flex space-x-4">
            <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importLorebooks}
                className="hidden"
              />
            </label>
            <button
              onClick={exportAllLorebooks}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export All
            </button>
            <button
              onClick={() => setShowLorebookForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Lorebook
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Lorebooks Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">My Lorebooks</h2>
              <div className="space-y-2">
                {lorebooks.map((lorebook) => (
                  <div
                    key={lorebook.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedLorebook === lorebook.id
                        ? 'bg-purple-100 border-purple-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedLorebook(lorebook.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{lorebook.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{lorebook.entries.length} entries</p>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportLorebook(lorebook);
                          }}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLorebook(lorebook.id);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentLorebook ? (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{currentLorebook.name}</h2>
                      <p className="text-gray-600">{currentLorebook.description}</p>
                    </div>
                    <button
                      onClick={() => setShowEntryForm(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Entry
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search entries..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredEntries.map((entry) => (
                    <div key={entry.id} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
                          <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                            {entry.category}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditEntry(entry)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-3">{entry.description}</p>
                      <p className="text-gray-800 text-sm mb-3 line-clamp-3">{entry.content}</p>

                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entry.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Lorebook Selected</h2>
                <p className="text-gray-600">Select a lorebook from the sidebar or create a new one to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Lorebook Form Modal */}
        {showLorebookForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Lorebook</h2>
                <form onSubmit={handleCreateLorebook} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lorebook Name
                    </label>
                    <input
                      type="text"
                      value={lorebookForm.name}
                      onChange={(e) => setLorebookForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={lorebookForm.description}
                      onChange={(e) => setLorebookForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowLorebookForm(false);
                        setLorebookForm({ name: '', description: '' });
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Create Lorebook
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Entry Form Modal */}
        {showEntryForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {editingEntry ? 'Edit Entry' : 'Create New Entry'}
                </h2>
                <form onSubmit={handleCreateEntry} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={entryForm.title}
                      onChange={(e) => setEntryForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={entryForm.category}
                      onChange={(e) => setEntryForm(prev => ({ ...prev, category: e.target.value }))}
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
                      Description
                    </label>
                    <textarea
                      value={entryForm.description}
                      onChange={(e) => setEntryForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      value={entryForm.content}
                      onChange={(e) => setEntryForm(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={entryForm.tags}
                      onChange={(e) => setEntryForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="tag1, tag2, tag3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEntryForm(false);
                        setEditingEntry(null);
                        setEntryForm({ title: '', category: '', description: '', content: '', tags: '' });
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {editingEntry ? 'Update Entry' : 'Create Entry'}
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