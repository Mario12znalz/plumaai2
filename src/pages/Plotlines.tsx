import React, { useState } from 'react';
import { PenTool, Plus, Download, Upload, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

interface PlotPoint {
  id: string;
  title: string;
  description: string;
  type: 'inciting-incident' | 'rising-action' | 'climax' | 'falling-action' | 'resolution' | 'character-development' | 'subplot';
  order: number;
  completed: boolean;
}

interface Plotline {
  id: string;
  title: string;
  description: string;
  genre: string;
  plotPoints: PlotPoint[];
  createdAt: string;
  updatedAt: string;
}

export default function Plotlines() {
  const { useMessage, messagesRemaining } = useSubscription();
  const [plotlines, setPlotlines] = useState<Plotline[]>([]);
  const [selectedPlotline, setSelectedPlotline] = useState<string | null>(null);
  const [showPlotlineForm, setShowPlotlineForm] = useState(false);
  const [showPlotPointForm, setShowPlotPointForm] = useState(false);
  const [editingPlotline, setEditingPlotline] = useState<string | null>(null);
  const [editingPlotPoint, setEditingPlotPoint] = useState<string | null>(null);
  const [expandedPlotlines, setExpandedPlotlines] = useState<Set<string>>(new Set());

  const [plotlineForm, setPlotlineForm] = useState({
    title: '',
    description: '',
    genre: ''
  });

  const [plotPointForm, setPlotPointForm] = useState({
    title: '',
    description: '',
    type: 'rising-action' as PlotPoint['type']
  });

  const genres = ['Fantasy', 'Science Fiction', 'Romance', 'Mystery', 'Thriller', 'Horror', 'Drama', 'Comedy', 'Adventure', 'Historical', 'Other'];
  const plotPointTypes = [
    { value: 'inciting-incident', label: 'Inciting Incident' },
    { value: 'rising-action', label: 'Rising Action' },
    { value: 'climax', label: 'Climax' },
    { value: 'falling-action', label: 'Falling Action' },
    { value: 'resolution', label: 'Resolution' },
    { value: 'character-development', label: 'Character Development' },
    { value: 'subplot', label: 'Subplot' }
  ];

  const getPlotPointColor = (type: PlotPoint['type']) => {
    const colors = {
      'inciting-incident': 'bg-red-100 text-red-800',
      'rising-action': 'bg-orange-100 text-orange-800',
      'climax': 'bg-yellow-100 text-yellow-800',
      'falling-action': 'bg-green-100 text-green-800',
      'resolution': 'bg-blue-100 text-blue-800',
      'character-development': 'bg-purple-100 text-purple-800',
      'subplot': 'bg-pink-100 text-pink-800'
    };
    return colors[type];
  };

  const handleCreatePlotline = (e: React.FormEvent) => {
    e.preventDefault();
    if (messagesRemaining <= 0) {
      alert('No messages remaining. Please upgrade your plan.');
      return;
    }

    const plotline: Plotline = {
      id: editingPlotline || Date.now().toString(),
      title: plotlineForm.title,
      description: plotlineForm.description,
      genre: plotlineForm.genre,
      plotPoints: editingPlotline ? plotlines.find(p => p.id === editingPlotline)?.plotPoints || [] : [],
      createdAt: editingPlotline ? plotlines.find(p => p.id === editingPlotline)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingPlotline) {
      setPlotlines(prev => prev.map(p => p.id === editingPlotline ? plotline : p));
      // Update localStorage
      const updatedPlotlines = plotlines.map(p => p.id === editingPlotline ? plotline : p);
      localStorage.setItem('plumaai_plotlines', JSON.stringify(updatedPlotlines));
      setEditingPlotline(null);
    } else {
      setPlotlines(prev => [...prev, plotline]);
      // Save to localStorage
      localStorage.setItem('plumaai_plotlines', JSON.stringify([...plotlines, plotline]));
      useMessage();
    }

    setPlotlineForm({ title: '', description: '', genre: '' });
    setShowPlotlineForm(false);
  };

  const handleCreatePlotPoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlotline) return;

    if (messagesRemaining <= 0 && !editingPlotPoint) {
      alert('No messages remaining. Please upgrade your plan.');
      return;
    }

    const currentPlotline = plotlines.find(p => p.id === selectedPlotline);
    if (!currentPlotline) return;

    const plotPoint: PlotPoint = {
      id: editingPlotPoint || Date.now().toString(),
      title: plotPointForm.title,
      description: plotPointForm.description,
      type: plotPointForm.type,
      order: editingPlotPoint 
        ? currentPlotline.plotPoints.find(pp => pp.id === editingPlotPoint)?.order || 0
        : currentPlotline.plotPoints.length,
      completed: editingPlotPoint 
        ? currentPlotline.plotPoints.find(pp => pp.id === editingPlotPoint)?.completed || false
        : false
    };

    setPlotlines(prev => prev.map(plotline => {
      if (plotline.id === selectedPlotline) {
        if (editingPlotPoint) {
          return {
            ...plotline,
            plotPoints: plotline.plotPoints.map(pp => pp.id === editingPlotPoint ? plotPoint : pp),
            updatedAt: new Date().toISOString()
          };
        } else {
          return {
            ...plotline,
            plotPoints: [...plotline.plotPoints, plotPoint],
            updatedAt: new Date().toISOString()
          };
        }
      }
      return plotline;
    }));

    if (!editingPlotPoint) {
      useMessage();
    }

    setPlotPointForm({ title: '', description: '', type: 'rising-action' });
    setShowPlotPointForm(false);
    setEditingPlotPoint(null);
  };

  const handleEditPlotline = (plotline: Plotline) => {
    setPlotlineForm({
      title: plotline.title,
      description: plotline.description,
      genre: plotline.genre
    });
    setEditingPlotline(plotline.id);
    setShowPlotlineForm(true);
  };

  const handleEditPlotPoint = (plotPoint: PlotPoint) => {
    setPlotPointForm({
      title: plotPoint.title,
      description: plotPoint.description,
      type: plotPoint.type
    });
    setEditingPlotPoint(plotPoint.id);
    setShowPlotPointForm(true);
  };

  const handleDeletePlotline = (id: string) => {
    setPlotlines(prev => prev.filter(p => p.id !== id));
    // Update localStorage
    const updatedPlotlines = plotlines.filter(p => p.id !== id);
    localStorage.setItem('plumaai_plotlines', JSON.stringify(updatedPlotlines));
    if (selectedPlotline === id) {
      setSelectedPlotline(null);
    }
  };

  const handleDeletePlotPoint = (plotPointId: string) => {
    if (!selectedPlotline) return;
    
    setPlotlines(prev => prev.map(plotline => {
      if (plotline.id === selectedPlotline) {
        return {
          ...plotline,
          plotPoints: plotline.plotPoints.filter(pp => pp.id !== plotPointId),
          updatedAt: new Date().toISOString()
        };
      }
      return plotline;
    }));
  };

  const togglePlotPointComplete = (plotPointId: string) => {
    if (!selectedPlotline) return;
    
    setPlotlines(prev => prev.map(plotline => {
      if (plotline.id === selectedPlotline) {
        return {
          ...plotline,
          plotPoints: plotline.plotPoints.map(pp => 
            pp.id === plotPointId ? { ...pp, completed: !pp.completed } : pp
          ),
          updatedAt: new Date().toISOString()
        };
      }
      return plotline;
    }));
  };

  const toggleExpanded = (plotlineId: string) => {
    setExpandedPlotlines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(plotlineId)) {
        newSet.delete(plotlineId);
      } else {
        newSet.add(plotlineId);
      }
      return newSet;
    });
  };

  const exportPlotline = (plotline: Plotline) => {
    const dataStr = JSON.stringify(plotline, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${plotline.title}-plotline.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportAllPlotlines = () => {
    const dataStr = JSON.stringify(plotlines, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'all-plotlines.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importPlotlines = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          if (Array.isArray(imported)) {
            setPlotlines(prev => [...prev, ...imported]);
          } else {
            setPlotlines(prev => [...prev, imported]);
          }
        } catch (error) {
          alert('Error importing plotlines. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const currentPlotline = selectedPlotline ? plotlines.find(p => p.id === selectedPlotline) : null;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plotlines</h1>
            <p className="text-gray-600 mt-2">Generate and organize story arcs</p>
          </div>
          <div className="flex space-x-4">
            <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importPlotlines}
                className="hidden"
              />
            </label>
            <button
              onClick={exportAllPlotlines}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export All
            </button>
            <button
              onClick={() => setShowPlotlineForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Plotline
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plotlines List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">My Plotlines</h2>
              <div className="space-y-2">
                {plotlines.map((plotline) => (
                  <div key={plotline.id} className="border border-gray-200 rounded-lg">
                    <div
                      className={`p-3 cursor-pointer transition-colors ${
                        selectedPlotline === plotline.id
                          ? 'bg-purple-100'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedPlotline(plotline.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(plotline.id);
                              }}
                              className="mr-2"
                            >
                              {expandedPlotlines.has(plotline.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                            <h3 className="font-medium text-gray-900">{plotline.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 ml-6">
                            {plotline.plotPoints.length} plot points • {plotline.genre}
                          </p>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPlotline(plotline);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportPlotline(plotline);
                            }}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlotline(plotline.id);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {expandedPlotlines.has(plotline.id) && (
                      <div className="px-3 pb-3 ml-6">
                        <div className="space-y-1">
                          {plotline.plotPoints
                            .sort((a, b) => a.order - b.order)
                            .map((point) => (
                              <div
                                key={point.id}
                                className={`text-xs p-2 rounded ${getPlotPointColor(point.type)} ${
                                  point.completed ? 'opacity-50 line-through' : ''
                                }`}
                              >
                                {point.title}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentPlotline ? (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{currentPlotline.title}</h2>
                      <p className="text-gray-600 mt-1">{currentPlotline.description}</p>
                      <span className="inline-block bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded-full mt-2">
                        {currentPlotline.genre}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowPlotPointForm(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Plot Point
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Total Plot Points:</span> {currentPlotline.plotPoints.length}
                    </div>
                    <div>
                      <span className="font-medium">Completed:</span> {currentPlotline.plotPoints.filter(p => p.completed).length}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {currentPlotline.plotPoints
                    .sort((a, b) => a.order - b.order)
                    .map((plotPoint) => (
                      <div
                        key={plotPoint.id}
                        className={`bg-white rounded-xl shadow-lg p-6 transition-opacity ${
                          plotPoint.completed ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <input
                                type="checkbox"
                                checked={plotPoint.completed}
                                onChange={() => togglePlotPointComplete(plotPoint.id)}
                                className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <h3 className={`text-lg font-semibold text-gray-900 ${
                                plotPoint.completed ? 'line-through' : ''
                              }`}>
                                {plotPoint.title}
                              </h3>
                            </div>
                            <span className={`inline-block text-xs px-2 py-1 rounded-full ${getPlotPointColor(plotPoint.type)}`}>
                              {plotPointTypes.find(t => t.value === plotPoint.type)?.label}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditPlotPoint(plotPoint)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePlotPoint(plotPoint.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600">{plotPoint.description}</p>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <PenTool className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Plotline Selected</h2>
                <p className="text-gray-600">Select a plotline from the sidebar or create a new one to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Plotline Form Modal */}
        {showPlotlineForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {editingPlotline ? 'Edit Plotline' : 'Create New Plotline'}
                </h2>
                <form onSubmit={handleCreatePlotline} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={plotlineForm.title}
                      onChange={(e) => setPlotlineForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre
                    </label>
                    <select
                      value={plotlineForm.genre}
                      onChange={(e) => setPlotlineForm(prev => ({ ...prev, genre: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">Select a genre</option>
                      {genres.map((genre) => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={plotlineForm.description}
                      onChange={(e) => setPlotlineForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPlotlineForm(false);
                        setEditingPlotline(null);
                        setPlotlineForm({ title: '', description: '', genre: '' });
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {editingPlotline ? 'Update Plotline' : 'Create Plotline'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Plot Point Form Modal */}
        {showPlotPointForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {editingPlotPoint ? 'Edit Plot Point' : 'Create New Plot Point'}
                </h2>
                <form onSubmit={handleCreatePlotPoint} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={plotPointForm.title}
                      onChange={(e) => setPlotPointForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={plotPointForm.type}
                      onChange={(e) => setPlotPointForm(prev => ({ ...prev, type: e.target.value as PlotPoint['type'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      {plotPointTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={plotPointForm.description}
                      onChange={(e) => setPlotPointForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPlotPointForm(false);
                        setEditingPlotPoint(null);
                        setPlotPointForm({ title: '', description: '', type: 'rising-action' });
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {editingPlotPoint ? 'Update Plot Point' : 'Create Plot Point'}
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