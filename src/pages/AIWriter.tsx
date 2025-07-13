import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Download, Upload, Edit, Trash2, Search, Calendar, User, Tag, Eye, Star, Clock } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

// Import interfaces from other components
interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  scenario: string;
  first_mes: string;
  mes_example: string;
  creator_notes?: string;
  tags?: string[];
  image?: string;
  createdAt: string;
}

interface LorebookEntry {
  id: string;
  keys: string[];
  content: string;
  comment?: string;
  enabled?: boolean;
  name?: string;
}

interface Lorebook {
  id: string;
  name: string;
  description: string;
  entries: LorebookEntry[];
}

interface PlotPoint {
  id: string;
  title: string;
  description: string;
  type: string;
  completed: boolean;
}

interface Plotline {
  id: string;
  title: string;
  description: string;
  genre: string;
  plotPoints: PlotPoint[];
}

interface Fact {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

interface Story {
  id: string;
  title: string;
  content: string;
  description: string;
  genre: string;
  tags: string[];
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isPublic: boolean;
  author: string;
  status: 'draft' | 'in-progress' | 'completed';
}

export default function StoryLibrary() {
  const { useMessage, messagesRemaining } = useSubscription();
  const [stories, setStories] = useState<Story[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedStory, setSelectedStory] = useState<string | null>(null);

  // User data from localStorage
  const [characters, setCharacters] = useState<Character[]>([]);
  const [lorebooks, setLorebooks] = useState<Lorebook[]>([]);
  const [plotlines, setPlotlines] = useState<Plotline[]>([]);
  const [facts, setFacts] = useState<Fact[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    genre: '',
    tags: '',
    status: 'draft' as Story['status'],
    isPublic: false
  });

  const genres = ['Fantasy', 'Science Fiction', 'Romance', 'Mystery', 'Thriller', 'Horror', 'Drama', 'Comedy', 'Adventure', 'Historical', 'Contemporary', 'Other'];
  const statuses = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' }
  ];

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const savedCharacters = localStorage.getItem('plumaai_characters');
        if (savedCharacters) {
          setCharacters(JSON.parse(savedCharacters));
        }

        const savedLorebooks = localStorage.getItem('plumaai_lorebooks');
        if (savedLorebooks) {
          setLorebooks(JSON.parse(savedLorebooks));
        }

        const savedPlotlines = localStorage.getItem('plumaai_plotlines');
        if (savedPlotlines) {
          setPlotlines(JSON.parse(savedPlotlines));
        }

        const savedFacts = localStorage.getItem('plumaai_facts');
        if (savedFacts) {
          setFacts(JSON.parse(savedFacts));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messagesRemaining <= 0 && !editingId) {
      alert('No messages remaining. Please upgrade your plan.');
      return;
    }

    const wordCount = formData.content.trim().split(/\s+/).length;
    
    const story: Story = {
      id: editingId || Date.now().toString(),
      title: formData.title,
      content: formData.content,
      description: formData.description,
      genre: formData.genre,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      wordCount,
      status: formData.status,
      isPublic: formData.isPublic,
      isFavorite: editingId ? stories.find(s => s.id === editingId)?.isFavorite || false : false,
      author: 'You',
      createdAt: editingId ? stories.find(s => s.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingId) {
      setStories(prev => prev.map(s => s.id === editingId ? story : s));
      setEditingId(null);
    } else {
      setStories(prev => [...prev, story]);
      useMessage();
    }

    setFormData({
      title: '',
      content: '',
      description: '',
      genre: '',
      tags: '',
      status: 'draft',
      isPublic: false
    });
    setShowForm(false);
  };

  const handleEdit = (story: Story) => {
    setFormData({
      title: story.title,
      content: story.content,
      description: story.description,
      genre: story.genre,
      tags: story.tags.join(', '),
      status: story.status,
      isPublic: story.isPublic
    });
    setEditingId(story.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setStories(prev => prev.filter(s => s.id !== id));
    if (selectedStory === id) {
      setSelectedStory(null);
    }
  };

  const toggleFavorite = (id: string) => {
    setStories(prev => prev.map(story => 
      story.id === id ? { ...story, isFavorite: !story.isFavorite } : story
    ));
  };

  const exportStory = (story: Story) => {
    const exportData = {
      title: story.title,
      content: story.content,
      description: story.description,
      genre: story.genre,
      tags: story.tags,
      wordCount: story.wordCount,
      status: story.status,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${story.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportAllStories = () => {
    const dataStr = JSON.stringify(stories, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'story-library.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importStories = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          let importedStories: Story[] = [];
          
          if (Array.isArray(importedData)) {
            importedStories = importedData.map((story, index) => ({
              ...story,
              id: `${Date.now()}_${index}`,
              author: 'Imported',
              createdAt: story.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }));
          } else {
            importedStories = [{
              ...importedData,
              id: Date.now().toString(),
              author: 'Imported',
              createdAt: importedData.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }];
          }
          
          setStories(prev => [...prev, ...importedStories]);
          alert(`Successfully imported ${importedStories.length} story(ies)!`);
        } catch (error) {
          alert('Error importing stories. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGenre = !selectedGenre || story.genre === selectedGenre;
    const matchesStatus = !selectedStatus || story.status === selectedStatus;
    
    return matchesSearch && matchesGenre && matchesStatus;
  });

  const getStatusColor = (status: Story['status']) => {
    const statusConfig = statuses.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const currentStory = selectedStory ? stories.find(s => s.id === selectedStory) : null;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Story Library</h1>
            <p className="text-gray-600 mt-2">Organize and manage your creative writing</p>
          </div>
          <div className="flex space-x-4">
            <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importStories}
                className="hidden"
              />
            </label>
            <button
              onClick={exportAllStories}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export All
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Story
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search stories..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                List
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stories.length}</div>
              <div className="text-sm text-gray-600">Total Stories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stories.filter(s => s.status === 'completed').length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stories.filter(s => s.status === 'in-progress').length}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stories.reduce((total, story) => total + story.wordCount, 0).toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Words</div>
            </div>
          </div>
        </div>

        {/* Stories Display */}
        {currentStory ? (
          /* Story Reader View */
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <button
                    onClick={() => setSelectedStory(null)}
                    className="text-purple-600 hover:text-purple-800 mb-2 text-sm"
                  >
                    ← Back to Library
                  </button>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentStory.title}</h1>
                  <p className="text-gray-600 mb-4">{currentStory.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {currentStory.author}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(currentStory.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {currentStory.wordCount.toLocaleString()} words
                    </span>
                    <span className={`inline-block text-xs px-2 py-1 rounded-full ${getStatusColor(currentStory.status)}`}>
                      {statuses.find(s => s.value === currentStory.status)?.label}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleFavorite(currentStory.id)}
                    className={`${currentStory.isFavorite ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600`}
                  >
                    <Star className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(currentStory)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => exportStory(currentStory)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed" style={{ fontFamily: 'Georgia, serif', fontSize: '16px', lineHeight: '1.8' }}>
                  {currentStory.content}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Library Grid/List View */
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredStories.map((story) => (
              <div
                key={story.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                onClick={() => setSelectedStory(story.id)}
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{story.title}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          {story.genre}
                        </span>
                        <span className={`inline-block text-xs px-2 py-1 rounded-full ${getStatusColor(story.status)}`}>
                          {statuses.find(s => s.value === story.status)?.label}
                        </span>
                        {story.isFavorite && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(story.id);
                        }}
                        className={`${story.isFavorite ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600`}
                      >
                        <Star className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(story);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportStory(story);
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(story.id);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{story.description}</p>

                  {story.tags.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {story.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {story.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{story.tags.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {story.wordCount.toLocaleString()} words
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(story.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button className="flex items-center text-purple-600 hover:text-purple-800">
                      <Eye className="h-3 w-3 mr-1" />
                      Read
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredStories.length === 0 && !currentStory && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {stories.length === 0 ? 'No stories yet' : 'No stories match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {stories.length === 0 ? 'Start writing your first story' : 'Try adjusting your search or filters'}
            </p>
            {stories.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Write First Story
              </button>
            )}
          </div>
        )}

        {/* Story Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {editingId ? 'Edit Story' : 'Create New Story'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Genre
                      </label>
                      <select
                        value={formData.genre}
                        onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="">Select a genre</option>
                        {genres.map((genre) => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Brief description of your story..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Write your story here..."
                      required
                      style={{ fontFamily: 'Georgia, serif' }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="adventure, magic, friendship"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Story['status'] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {statuses.map((status) => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Make this story public</span>
                    </label>
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
                          description: '',
                          genre: '',
                          tags: '',
                          status: 'draft',
                          isPublic: false
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
                      {editingId ? 'Update Story' : 'Save Story'}
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