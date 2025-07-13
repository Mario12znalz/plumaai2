import React, { useState } from 'react';
import { BookOpen, Plus, Download, Upload, Edit, Trash2, Search, Hash, Eye, EyeOff, RotateCcw, Copy, Info } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

interface LorebookEntry {
  id: string;
  keys: string[];
  content: string;
  comment?: string;
  constant?: boolean;
  selective?: boolean;
  secondary_keys?: string[];
  priority?: number;
  order?: number;
  position?: 'before_char' | 'after_char';
  enabled?: boolean;
  case_sensitive?: boolean;
  name?: string;
  insertion_order?: number;
  extensions?: any;
}

interface Lorebook {
  id: string;
  name: string;
  description: string;
  scan_depth?: number;
  token_budget?: number;
  recursive_scanning?: boolean;
  extensions?: any;
  entries: LorebookEntry[];
  createdAt: string;
  global_priority?: number;
}

interface WorldInfoV2 {
  name: string;
  description?: string;
  scan_depth?: number;
  token_budget?: number;
  recursive_scanning?: boolean;
  entries: LorebookEntry[];
}

export default function Lorebooks() {
  const { useMessage, messagesRemaining } = useSubscription();
  const [lorebooks, setLorebooks] = useState<Lorebook[]>([]);
  const [selectedLorebook, setSelectedLorebook] = useState<string | null>(null);
  const [showLorebookForm, setShowLorebookForm] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [lorebookForm, setLorebookForm] = useState({
    name: '',
    description: '',
    scan_depth: 1000,
    token_budget: 400,
    recursive_scanning: false
  });

  const [entryForm, setEntryForm] = useState({
    name: '',
    keys: '',
    secondary_keys: '',
    content: '',
    comment: '',
    constant: false,
    selective: false,
    priority: 400,
    order: 100,
    position: 'after_char' as 'before_char' | 'after_char',
    enabled: true,
    case_sensitive: false
  });

  const handleCreateLorebook = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newLorebook: Lorebook = {
      id: Date.now().toString(),
      name: lorebookForm.name,
      description: lorebookForm.description,
      scan_depth: lorebookForm.scan_depth,
      token_budget: lorebookForm.token_budget,
      recursive_scanning: lorebookForm.recursive_scanning,
      entries: [],
      createdAt: new Date().toISOString(),
      global_priority: 0
    };

    setLorebooks(prev => [...prev, newLorebook]);
    // Save to localStorage
    localStorage.setItem('plumaai_lorebooks', JSON.stringify([...lorebooks, newLorebook]));
    setLorebookForm({ 
      name: '', 
      description: '', 
      scan_depth: 1000, 
      token_budget: 400, 
      recursive_scanning: false 
    });
    setShowLorebookForm(false);
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (messagesRemaining <= 0) {
      alert('No messages remaining. Please upgrade your plan.');
      return;
    }

    if (!selectedLorebook) return;

    const currentLorebook = lorebooks.find(l => l.id === selectedLorebook);
    if (!currentLorebook) return;

    const entry: LorebookEntry = {
      id: editingEntry || Date.now().toString(),
      name: entryForm.name,
      keys: entryForm.keys.split(',').map(key => key.trim()).filter(key => key),
      secondary_keys: entryForm.secondary_keys ? entryForm.secondary_keys.split(',').map(key => key.trim()).filter(key => key) : [],
      content: entryForm.content,
      comment: entryForm.comment,
      constant: entryForm.constant,
      selective: entryForm.selective,
      priority: entryForm.priority,
      order: entryForm.order,
      position: entryForm.position,
      enabled: entryForm.enabled,
      case_sensitive: entryForm.case_sensitive,
      insertion_order: editingEntry 
        ? currentLorebook.entries.find(e => e.id === editingEntry)?.insertion_order || 0
        : currentLorebook.entries.length
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
    
    // Save to localStorage
    localStorage.setItem('plumaai_lorebooks', JSON.stringify(lorebooks));

    setEntryForm({ 
      name: '',
      keys: '', 
      secondary_keys: '',
      content: '', 
      comment: '',
      constant: false,
      selective: false,
      priority: 400,
      order: 100,
      position: 'after_char',
      enabled: true,
      case_sensitive: false
    });
    setShowEntryForm(false);
    setEditingEntry(null);
  };

  const handleEditEntry = (entry: LorebookEntry) => {
    setEntryForm({
      name: entry.name || '',
      keys: entry.keys.join(', '),
      secondary_keys: entry.secondary_keys?.join(', ') || '',
      content: entry.content,
      comment: entry.comment || '',
      constant: entry.constant || false,
      selective: entry.selective || false,
      priority: entry.priority || 400,
      order: entry.order || 100,
      position: entry.position || 'after_char',
      enabled: entry.enabled !== false,
      case_sensitive: entry.case_sensitive || false
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

  const toggleEntryEnabled = (entryId: string) => {
    if (!selectedLorebook) return;
    
    setLorebooks(prev => prev.map(lorebook => {
      if (lorebook.id === selectedLorebook) {
        return {
          ...lorebook,
          entries: lorebook.entries.map(e => 
            e.id === entryId ? { ...e, enabled: !e.enabled } : e
          )
        };
      }
      return lorebook;
    }));
  };

  const handleDeleteLorebook = (lorebookId: string) => {
    setLorebooks(prev => prev.filter(l => l.id !== lorebookId));
    // Update localStorage
    const updatedLorebooks = lorebooks.filter(l => l.id !== lorebookId);
    localStorage.setItem('plumaai_lorebooks', JSON.stringify(updatedLorebooks));
    if (selectedLorebook === lorebookId) {
      setSelectedLorebook(null);
    }
  };

  const exportLorebook = (lorebook: Lorebook) => {
    // Export in World Info V2 format compatible with most AI platforms
    const worldInfo: WorldInfoV2 = {
      name: lorebook.name,
      description: lorebook.description,
      scan_depth: lorebook.scan_depth,
      token_budget: lorebook.token_budget,
      recursive_scanning: lorebook.recursive_scanning,
      entries: lorebook.entries.map(entry => ({
        ...entry,
        keys: entry.keys,
        content: entry.content,
        comment: entry.comment,
        constant: entry.constant,
        selective: entry.selective,
        secondary_keys: entry.secondary_keys,
        priority: entry.priority,
        order: entry.order,
        position: entry.position,
        enabled: entry.enabled,
        case_sensitive: entry.case_sensitive
      }))
    };

    const dataStr = JSON.stringify(worldInfo, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${lorebook.name.replace(/[^a-zA-Z0-9]/g, '_')}_lorebook.json`;
    
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
            // Multiple lorebooks
            setLorebooks(prev => [...prev, ...imported]);
          } else if (imported.entries && Array.isArray(imported.entries)) {
            // Single World Info format
            const newLorebook: Lorebook = {
              id: Date.now().toString(),
              name: imported.name || 'Imported Lorebook',
              description: imported.description || '',
              scan_depth: imported.scan_depth || 1000,
              token_budget: imported.token_budget || 400,
              recursive_scanning: imported.recursive_scanning || false,
              entries: imported.entries.map((entry: any, index: number) => ({
                id: `${Date.now()}_${index}`,
                name: entry.name || `Entry ${index + 1}`,
                keys: Array.isArray(entry.keys) ? entry.keys : [entry.key || ''].filter(k => k),
                secondary_keys: entry.secondary_keys || [],
                content: entry.content || entry.value || '',
                comment: entry.comment || '',
                constant: entry.constant || false,
                selective: entry.selective || false,
                priority: entry.priority || 400,
                order: entry.order || 100,
                position: entry.position || 'after_char',
                enabled: entry.enabled !== false,
                case_sensitive: entry.case_sensitive || false,
                insertion_order: index
              })),
              createdAt: new Date().toISOString(),
              global_priority: 0
            };
            setLorebooks(prev => [...prev, newLorebook]);
          } else {
            // Single lorebook
            setLorebooks(prev => [...prev, imported]);
          }
          
          alert('Lorebook(s) imported successfully!');
        } catch (error) {
          alert('Error importing lorebooks. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const copyEntryContent = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('Entry content copied to clipboard!');
  };

  const currentLorebook = selectedLorebook ? lorebooks.find(l => l.id === selectedLorebook) : null;
  const filteredEntries = currentLorebook?.entries.filter(entry =>
    entry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.keys.some(key => key.toLowerCase().includes(searchTerm.toLowerCase())) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => (b.priority || 0) - (a.priority || 0)) || [];

  const getEntryStatusColor = (entry: LorebookEntry) => {
    if (!entry.enabled) return 'bg-gray-100 text-gray-500';
    if (entry.constant) return 'bg-blue-100 text-blue-800';
    if (entry.selective) return 'bg-purple-100 text-purple-800';
    return 'bg-green-100 text-green-800';
  };

  const getEntryStatusText = (entry: LorebookEntry) => {
    if (!entry.enabled) return 'Disabled';
    if (entry.constant) return 'Constant';
    if (entry.selective) return 'Selective';
    return 'Normal';
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lorebooks</h1>
            <p className="text-gray-600 mt-2">Advanced world information and context management</p>
            <p className="text-sm text-gray-500 mt-1">
              Compatible with Character.AI, Tavern AI, SillyTavern, and other roleplay platforms
            </p>
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

        {/* Format Information */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Lorebook Features</h3>
              <div className="text-blue-800 text-sm space-y-1">
                <p>• <strong>Activation Keys:</strong> Primary and secondary keywords that trigger entries</p>
                <p>• <strong>Priority System:</strong> Higher priority entries are inserted first</p>
                <p>• <strong>Constant Entries:</strong> Always active regardless of keywords</p>
                <p>• <strong>Selective Mode:</strong> Only activates when specific conditions are met</p>
                <p>• <strong>Token Budget:</strong> Controls maximum tokens used by lorebook entries</p>
                <p>• <strong>Scan Depth:</strong> How far back in conversation to scan for keywords</p>
              </div>
            </div>
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
                        <p className="text-sm text-gray-600 mt-1">
                          {lorebook.entries.length} entries • {lorebook.entries.filter(e => e.enabled !== false).length} active
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          Budget: {lorebook.token_budget} tokens
                        </div>
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

                  {/* Lorebook Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">{currentLorebook.token_budget}</div>
                      <div className="text-sm text-gray-600">Token Budget</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">{currentLorebook.scan_depth}</div>
                      <div className="text-sm text-gray-600">Scan Depth</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {currentLorebook.recursive_scanning ? 'Yes' : 'No'}
                      </div>
                      <div className="text-sm text-gray-600">Recursive Scan</div>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search entries by name, keys, or content..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredEntries.map((entry) => (
                    <div key={entry.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 mr-3">
                                {entry.name || 'Unnamed Entry'}
                              </h3>
                              <span className={`inline-block text-xs px-2 py-1 rounded-full ${getEntryStatusColor(entry)}`}>
                                {getEntryStatusText(entry)}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                Priority: {entry.priority || 400}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mb-3">
                              {entry.keys.map((key, index) => (
                                <span
                                  key={index}
                                  className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded flex items-center"
                                >
                                  <Hash className="h-3 w-3 mr-1" />
                                  {key}
                                </span>
                              ))}
                              {entry.secondary_keys && entry.secondary_keys.map((key, index) => (
                                <span
                                  key={`sec_${index}`}
                                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center"
                                >
                                  <Hash className="h-3 w-3 mr-1" />
                                  {key} (2nd)
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => toggleEntryEnabled(entry.id)}
                              className={`${entry.enabled ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}`}
                              title={entry.enabled ? 'Disable entry' : 'Enable entry'}
                            >
                              {entry.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => copyEntryContent(entry.content)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Copy content"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditEntry(entry)}
                              className="text-orange-600 hover:text-orange-800"
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

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-800 text-sm whitespace-pre-wrap">{entry.content}</p>
                        </div>

                        {entry.comment && (
                          <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400">
                            <p className="text-yellow-800 text-sm">
                              <strong>Comment:</strong> {entry.comment}
                            </p>
                          </div>
                        )}

                        <div className="mt-3 flex items-center text-xs text-gray-500 space-x-4">
                          <span>Position: {entry.position === 'before_char' ? 'Before Character' : 'After Character'}</span>
                          <span>Order: {entry.order || 100}</span>
                          {entry.case_sensitive && <span>Case Sensitive</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredEntries.length === 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {currentLorebook.entries.length === 0 ? 'No entries yet' : 'No entries match your search'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {currentLorebook.entries.length === 0 ? 'Add your first lorebook entry' : 'Try adjusting your search terms'}
                    </p>
                    {currentLorebook.entries.length === 0 && (
                      <button
                        onClick={() => setShowEntryForm(true)}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add First Entry
                      </button>
                    )}
                  </div>
                )}
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
            <div className="bg-white rounded-xl max-w-2xl w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Lorebook</h2>
                <form onSubmit={handleCreateLorebook} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lorebook Name *
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
                      placeholder="Brief description of this lorebook's purpose..."
                    />
                  </div>

                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={showAdvanced}
                      onChange={(e) => setShowAdvanced(e.target.checked)}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">Show advanced settings</label>
                  </div>

                  {showAdvanced && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Token Budget
                        </label>
                        <input
                          type="number"
                          value={lorebookForm.token_budget}
                          onChange={(e) => setLorebookForm(prev => ({ ...prev, token_budget: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          min="50"
                          max="2000"
                        />
                        <p className="text-xs text-gray-500 mt-1">Maximum tokens for lorebook entries</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Scan Depth
                        </label>
                        <input
                          type="number"
                          value={lorebookForm.scan_depth}
                          onChange={(e) => setLorebookForm(prev => ({ ...prev, scan_depth: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          min="100"
                          max="5000"
                        />
                        <p className="text-xs text-gray-500 mt-1">Characters to scan for keywords</p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={lorebookForm.recursive_scanning}
                            onChange={(e) => setLorebookForm(prev => ({ ...prev, recursive_scanning: e.target.checked }))}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Enable recursive scanning</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Scan activated entries for additional keywords</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowLorebookForm(false);
                        setLorebookForm({ 
                          name: '', 
                          description: '', 
                          scan_depth: 1000, 
                          token_budget: 400, 
                          recursive_scanning: false 
                        });
                        setShowAdvanced(false);
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
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {editingEntry ? 'Edit Entry' : 'Create New Entry'}
                </h2>
                <form onSubmit={handleCreateEntry} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entry Name
                      </label>
                      <input
                        type="text"
                        value={entryForm.name}
                        onChange={(e) => setEntryForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Optional name for this entry"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <input
                        type="number"
                        value={entryForm.priority}
                        onChange={(e) => setEntryForm(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="0"
                        max="1000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activation Keys * (comma separated)
                    </label>
                    <input
                      type="text"
                      value={entryForm.keys}
                      onChange={(e) => setEntryForm(prev => ({ ...prev, keys: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="character name, location, item"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Keywords that trigger this entry</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secondary Keys (comma separated)
                    </label>
                    <input
                      type="text"
                      value={entryForm.secondary_keys}
                      onChange={(e) => setEntryForm(prev => ({ ...prev, secondary_keys: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="alternative names, synonyms"
                    />
                    <p className="text-xs text-gray-500 mt-1">Additional keywords for selective mode</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content *
                    </label>
                    <textarea
                      value={entryForm.content}
                      onChange={(e) => setEntryForm(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="The information that will be injected when this entry is activated..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comment
                    </label>
                    <input
                      type="text"
                      value={entryForm.comment}
                      onChange={(e) => setEntryForm(prev => ({ ...prev, comment: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Optional note about this entry"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                      </label>
                      <select
                        value={entryForm.position}
                        onChange={(e) => setEntryForm(prev => ({ ...prev, position: e.target.value as 'before_char' | 'after_char' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="after_char">After Character</option>
                        <option value="before_char">Before Character</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order
                      </label>
                      <input
                        type="number"
                        value={entryForm.order}
                        onChange={(e) => setEntryForm(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="0"
                        max="1000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={entryForm.enabled}
                        onChange={(e) => setEntryForm(prev => ({ ...prev, enabled: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Enabled</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={entryForm.constant}
                        onChange={(e) => setEntryForm(prev => ({ ...prev, constant: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Constant</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={entryForm.selective}
                        onChange={(e) => setEntryForm(prev => ({ ...prev, selective: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Selective</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={entryForm.case_sensitive}
                        onChange={(e) => setEntryForm(prev => ({ ...prev, case_sensitive: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Case Sensitive</span>
                    </label>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Entry Types:</h4>
                    <div className="text-blue-800 text-sm space-y-1">
                      <p>• <strong>Normal:</strong> Activates when keywords are found in recent messages</p>
                      <p>• <strong>Constant:</strong> Always active, ignores keywords</p>
                      <p>• <strong>Selective:</strong> Requires both primary and secondary keys</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEntryForm(false);
                        setEditingEntry(null);
                        setEntryForm({ 
                          name: '',
                          keys: '', 
                          secondary_keys: '',
                          content: '', 
                          comment: '',
                          constant: false,
                          selective: false,
                          priority: 400,
                          order: 100,
                          position: 'after_char',
                          enabled: true,
                          case_sensitive: false
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