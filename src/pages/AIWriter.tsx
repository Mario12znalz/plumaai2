import React, { useState, useEffect } from 'react';
import { Brain, Wand2, Settings, Copy, RefreshCw, FileText, Users, BookOpen, PenTool, Database, AlertCircle } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

// Import hooks to get user data
const useUserData = () => {
  // Get data from localStorage (same as other components)
  const getStoredData = (key: string) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  return {
    characters: getStoredData('plumaai_characters'),
    lorebooks: getStoredData('plumaai_lorebooks'), 
    plotlines: getStoredData('plumaai_plotlines'),
    facts: getStoredData('plumaai_facts')
  };
};

interface Prediction {
  id: string;
  input: string;
  prediction: string;
  timestamp: string;
  model: string;
  settings: WritingSettings;
  userPrediction?: string;
}

interface WritingSettings {
  style: string;
  temperature: number;
  maxTokens: number;
  minTokens: number;
  genre: string;
}

interface CustomStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

interface CustomGenre {
  id: string;
  name: string;
  description: string;
  characteristics: string;
}

export default function AIWriter() {
  const { useMessage, messagesRemaining, currentPlan } = useSubscription();
  const { characters, lorebooks, plotlines, facts } = useUserData();
  const [inputText, setInputText] = useState('');
  const [prediction, setPrediction] = useState('');
  const [userPrediction, setUserPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCustomStyleForm, setShowCustomStyleForm] = useState(false);
  const [showCustomGenreForm, setShowCustomGenreForm] = useState(false);
  const [editingStyle, setEditingStyle] = useState<string | null>(null);
  const [editingGenre, setEditingGenre] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'writing' | 'resources'>('writing');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [selectedLorebooks, setSelectedLorebooks] = useState<string[]>([]);
  const [selectedPlotlines, setSelectedPlotlines] = useState<string[]>([]);
  const [selectedFacts, setSelectedFacts] = useState<string[]>([]);
  
  const [settings, setSettings] = useState<WritingSettings>({
    style: 'creative',
    temperature: 0.7,
    maxTokens: 150,
    minTokens: 50,
    genre: 'fantasy'
  });

  const [customStyles, setCustomStyles] = useState<CustomStyle[]>([]);
  const [customGenres, setCustomGenres] = useState<CustomGenre[]>([]);

  const [styleForm, setStyleForm] = useState({
    name: '',
    description: '',
    prompt: ''
  });

  const [genreForm, setGenreForm] = useState({
    name: '',
    description: '',
    characteristics: ''
  });

  // Mock data for resources - in production, these would come from the actual pages
  const [availableCharacters] = useState([
    { id: '1', name: 'Luna', description: 'Mysterious mage with violet eyes' },
    { id: '2', name: 'Marcus', description: 'Noble knight with unwavering loyalty' },
    { id: '3', name: 'Aria', description: 'Skilled archer from the forest realm' }
  ]);

  const [availableLorebooks] = useState([
    { id: '1', name: 'Magic System', description: 'Rules and mechanics of magic' },
    { id: '2', name: 'World Geography', description: 'Locations and territories' },
    { id: '3', name: 'Political Factions', description: 'Kingdoms and alliances' }
  ]);

  const [availablePlotlines] = useState([
    { id: '1', name: 'The Ancient Prophecy', description: 'Main quest storyline' },
    { id: '2', name: 'Romance Arc', description: 'Character relationship development' },
    { id: '3', name: 'Political Intrigue', description: 'Court politics and schemes' }
  ]);

  const [availableFacts] = useState([
    { id: '1', title: 'Dragon Lore', category: 'Mythology' },
    { id: '2', title: 'Ancient Artifacts', category: 'Historical' },
    { id: '3', title: 'Magic Crystals', category: 'Worldbuilding' }
  ]);

  // Load custom styles and genres from localStorage
  useEffect(() => {
    const savedStyles = localStorage.getItem('plumaai_custom_styles');
    const savedGenres = localStorage.getItem('plumaai_custom_genres');
    
    if (savedStyles) {
      setCustomStyles(JSON.parse(savedStyles));
    }
    if (savedGenres) {
      setCustomGenres(JSON.parse(savedGenres));
    }
  }, []);

  // Save custom styles and genres to localStorage
  useEffect(() => {
    localStorage.setItem('plumaai_custom_styles', JSON.stringify(customStyles));
  }, [customStyles]);

  useEffect(() => {
    localStorage.setItem('plumaai_custom_genres', JSON.stringify(customGenres));
  }, [customGenres]);

  const defaultStyles = [
    { value: 'creative', label: 'Creative', description: 'Imaginative and expressive' },
    { value: 'descriptive', label: 'Descriptive', description: 'Rich, detailed descriptions' },
    { value: 'dialogue', label: 'Dialogue', description: 'Natural conversation' },
    { value: 'narrative', label: 'Narrative', description: 'Story-driven prose' },
    { value: 'poetic', label: 'Poetic', description: 'Lyrical and artistic' },
    { value: 'dramatic', label: 'Dramatic', description: 'Intense and emotional' }
  ];

  const defaultGenres = [
    'Fantasy', 'Science Fiction', 'Romance', 'Mystery', 'Horror', 'Adventure', 
    'Drama', 'Comedy', 'Thriller', 'Historical', 'Contemporary', 'Fanfiction'
  ];

  const allStyles = [
    ...defaultStyles,
    ...customStyles.map(style => ({
      value: style.id,
      label: style.name,
      description: style.description
    }))
  ];

  const allGenres = [
    ...defaultGenres,
    ...customGenres.map(genre => genre.name)
  ];

  const handleCreateStyle = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newStyle: CustomStyle = {
      id: editingStyle || Date.now().toString(),
      name: styleForm.name,
      description: styleForm.description,
      prompt: styleForm.prompt
    };

    if (editingStyle) {
      setCustomStyles(prev => prev.map(s => s.id === editingStyle ? newStyle : s));
      setEditingStyle(null);
    } else {
      setCustomStyles(prev => [...prev, newStyle]);
    }

    setStyleForm({ name: '', description: '', prompt: '' });
    setShowCustomStyleForm(false);
  };

  const handleCreateGenre = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newGenre: CustomGenre = {
      id: editingGenre || Date.now().toString(),
      name: genreForm.name,
      description: genreForm.description,
      characteristics: genreForm.characteristics
    };

    if (editingGenre) {
      setCustomGenres(prev => prev.map(g => g.id === editingGenre ? newGenre : g));
      setEditingGenre(null);
    } else {
      setCustomGenres(prev => [...prev, newGenre]);
    }

    setGenreForm({ name: '', description: '', characteristics: '' });
    setShowCustomGenreForm(false);
  };

  const handleEditStyle = (style: CustomStyle) => {
    setStyleForm({
      name: style.name,
      description: style.description,
      prompt: style.prompt
    });
    setEditingStyle(style.id);
    setShowCustomStyleForm(true);
  };

  const handleEditGenre = (genre: CustomGenre) => {
    setGenreForm({
      name: genre.name,
      description: genre.description,
      characteristics: genre.characteristics
    });
  const handlePredict = async () => {
    if (!inputText.trim() || messagesRemaining <= 0) {
      if (messagesRemaining <= 0) {
        alert('No messages remaining. Please upgrade your plan.');
      }
      return;
    }

    setLoading(true);

    try {
      // Get custom style prompt if applicable
      const customStyle = customStyles.find(s => s.id === settings.style);
      const customGenre = customGenres.find(g => g.name.toLowerCase() === settings.genre);
      
      // Build context from selected resources
      let contextPrompt = '';
      
      if (selectedCharacters.length > 0) {
        const characters = availableCharacters.filter(c => selectedCharacters.includes(c.id));
        contextPrompt += `\nCharacters involved: ${characters.map(c => `${c.name} (${c.description})`).join(', ')}`;
      }
      
      if (selectedLorebooks.length > 0) {
        const lorebooks = availableLorebooks.filter(l => selectedLorebooks.includes(l.id));
        contextPrompt += `\nWorld context: ${lorebooks.map(l => `${l.name} - ${l.description}`).join(', ')}`;
      }
      
      if (selectedPlotlines.length > 0) {
        const plotlines = availablePlotlines.filter(p => selectedPlotlines.includes(p.id));
        contextPrompt += `\nActive plotlines: ${plotlines.map(p => `${p.name} - ${p.description}`).join(', ')}`;
      }
      
      if (selectedFacts.length > 0) {
        const facts = availableFacts.filter(f => selectedFacts.includes(f.id));
        contextPrompt += `\nRelevant facts: ${facts.map(f => `${f.title} (${f.category})`).join(', ')}`;
      }
      
      let prompt = `Genre: ${settings.genre}. Style: ${settings.style}.${contextPrompt}
      
Continue this text naturally (${settings.minTokens}-${settings.maxTokens} tokens): ${inputText}`;
      
      if (customStyle) {
        prompt = `${customStyle.prompt} Genre: ${settings.genre}.${contextPrompt}
        
Continue this text (${settings.minTokens}-${settings.maxTokens} tokens): ${inputText}`;
      }
      
      if (customGenre) {
        prompt = `Genre: ${customGenre.name} (${customGenre.characteristics}). Style: ${settings.style}.${contextPrompt}
        
Continue this text (${settings.minTokens}-${settings.maxTokens} tokens): ${inputText}`;
      }

      // API call to Chutes
      const response = await fetch('https://api.chutes.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer cpk_cfa7d8cde9394901845f0b6e62fdcfa6.0d6209d2d5f1578ba66d122c1d14d9a0.CXzSDxe2QuSFrzonuqjVhOruVY6mUKyK'
        },
        body: JSON.stringify({
          model: 'cydonia',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: settings.maxTokens,
          min_tokens: settings.minTokens,
          temperature: settings.temperature
        })
      }).catch(() => {
        // Fallback to mock response for demo
        return {
          ok: true,
          json: () => Promise.resolve({
            choices: [{
              message: {
                content: generateMockPrediction(inputText, settings)
              }
            }]
          })
        };
      });

      if (response.ok) {
        const data = await response.json();
        const predictedText = data.choices?.[0]?.message?.content || generateMockPrediction(inputText, settings);
        
        setPrediction(predictedText);
        
        const newPrediction: Prediction = {
          id: Date.now().toString(),
          input: inputText,
          prediction: predictedText,
          timestamp: new Date().toISOString(),
          model: currentPlan?.model || 'Cydonia 22B',
          settings: { ...settings },
          userPrediction: userPrediction || undefined
        };
        
        setPredictions(prev => [newPrediction, ...prev]);
        useMessage();
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Prediction error:', error);
      const mockPrediction = generateMockPrediction(inputText, settings);
      setPrediction(mockPrediction);
      
      const newPrediction: Prediction = {
        id: Date.now().toString(),
        input: inputText,
        prediction: mockPrediction,
        timestamp: new Date().toISOString(),
        model: currentPlan?.model || 'Cydonia 22B',
        settings: { ...settings },
        userPrediction: userPrediction || undefined
      };
      
      setPredictions(prev => [newPrediction, ...prev]);
      useMessage();
    } finally {
      setLoading(false);
    }
  };

  const generateMockPrediction = (input: string, settings: WritingSettings): string => {
    const predictions = {
      creative: [
        " The ancient magic stirred within her veins, responding to the whispered incantation. Shadows danced at the edges of her vision as reality began to bend and shift around her fingertips.",
        " Time seemed to fracture like glass, each shard reflecting a different possibility. She reached out, grasping for the thread of fate that would lead her home.",
        " The dragon's eyes held centuries of wisdom and sorrow, speaking of battles fought and loves lost in the mists of forgotten ages."
      ],
      descriptive: [
        " The cathedral's soaring arches stretched toward heaven, their stone surfaces carved with intricate patterns that seemed to writhe and dance in the flickering candlelight. Dust motes floated like tiny spirits through shafts of colored light.",
        " Her dress was the color of midnight storms, fabric that seemed to absorb light rather than reflect it. Silver threads wove through the material like captured lightning.",
        " The forest floor was carpeted with fallen leaves in shades of amber and crimson, each step releasing the earthy scent of autumn's embrace."
      ],
      dialogue: [
        " \"You don't understand,\" she whispered, her voice barely audible above the wind. \"This isn't just about us anymore. The entire kingdom hangs in the balance.\"",
        " \"I've been waiting for you,\" he said, his eyes never leaving hers. \"For longer than you could possibly imagine.\"",
        " \"The prophecy was wrong,\" she declared, throwing the ancient scroll onto the table. \"It has to be. Because if it's not, then everything we've fought for has been meaningless.\""
      ],
      narrative: [
        " What happened next would change the course of history forever. The decision she made in that moment, standing at the crossroads between duty and desire, would echo through generations.",
        " The letter arrived on a Tuesday, unremarkable in every way except for the seal that bore the mark of a house thought extinct for three hundred years.",
        " She had always known this day would come, had prepared for it in dreams and nightmares alike. Yet nothing could have readied her for the weight of destiny settling upon her shoulders."
      ],
      poetic: [
        " Like moonlight on water, her laughter rippled through the silence, breaking the spell that had held them captive for so long. In that moment, hope bloomed like flowers after rain.",
        " The wind carried whispers of forgotten songs, melodies that spoke of love transcending time and space, of souls finding each other across the vast expanse of eternity.",
        " Stars fell like tears from the velvet sky, each one a wish, a prayer, a promise written in light against the darkness of the world."
      ],
      dramatic: [
        " The blade trembled in her hand as she faced the choice that would define her forever. Behind her lay everything she had ever loved; ahead, the path to salvation paved with sacrifice.",
        " \"You were supposed to protect them!\" The words tore from her throat like a battle cry, raw with grief and fury that threatened to consume everything in its path.",
        " The ground shook beneath their feet as the ancient seal finally shattered, releasing forces that had been bound since the dawn of time."
      ]
    };

    // Check if it's a custom style
    const customStyle = customStyles.find(s => s.id === settings.style);
    if (customStyle) {
      return " " + customStyle.prompt.split('.')[0] + " continued with creative flair...";
    }

    const styleOptions = predictions[settings.style as keyof typeof predictions] || predictions.creative;
    return styleOptions[Math.floor(Math.random() * styleOptions.length)];
  };

  const insertPrediction = () => {
    if (prediction) {
      setInputText(prev => prev + prediction);
      setPrediction('');
      setUserPrediction('');
    }
  };

  const insertUserPrediction = () => {
    if (userPrediction) {
      setInputText(prev => prev + userPrediction);
      setUserPrediction('');
      setPrediction('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportStory = () => {
    const fullText = inputText + (prediction ? prediction : '');
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'story.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Writer</h1>
          <p className="text-gray-600">Let AI inspire your next masterpiece</p>
          <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">{messagesRemaining} messages left</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="text-purple-600 font-medium">{currentPlan?.model}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
                <Settings className="h-5 w-5 text-gray-500" />
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Writing Style
                    </label>
                    <button
                      onClick={() => setShowCustomStyleForm(true)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <select
                    value={settings.style}
                    onChange={(e) => setSettings(prev => ({ ...prev, style: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  >
                    <optgroup label="Default Styles">
                      {defaultStyles.map((style) => (
                        <option key={style.value} value={style.value}>
                          {style.label}
                        </option>
                      ))}
                    </optgroup>
                    {customStyles.length > 0 && (
                      <optgroup label="Custom Styles">
                        {customStyles.map((style) => (
                          <option key={style.id} value={style.id}>
                            {style.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {allStyles.find(s => s.value === settings.style)?.description}
                  </p>

                  {/* Custom Styles Management */}
                  {customStyles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {customStyles.map((style) => (
                        <div key={style.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 truncate">{style.name}</span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditStyle(style)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteStyle(style.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Genre
                    </label>
                    <button
                      onClick={() => setShowCustomGenreForm(true)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <select
                    value={settings.genre}
                    onChange={(e) => setSettings(prev => ({ ...prev, genre: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  >
                    <optgroup label="Default Genres">
                      {defaultGenres.map((genre) => (
                        <option key={genre} value={genre.toLowerCase()}>
                          {genre}
                        </option>
                      ))}
                    </optgroup>
                    {customGenres.length > 0 && (
                      <optgroup label="Custom Genres">
                        {customGenres.map((genre) => (
                          <option key={genre.id} value={genre.name.toLowerCase()}>
                            {genre.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>

                  {/* Custom Genres Management */}
                  {customGenres.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {customGenres.map((genre) => (
                        <div key={genre.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 truncate">{genre.name}</span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditGenre(genre)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteGenre(genre.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Creativity ({settings.temperature})
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Focused</span>
                    <span>Creative</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Length (tokens)
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Minimum: {settings.minTokens}
                      </label>
                      <input
                        type="range"
                        min="25"
                        max="500"
                        step="25"
                        value={settings.minTokens}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          minTokens: parseInt(e.target.value),
                          maxTokens: Math.max(parseInt(e.target.value), prev.maxTokens)
                        }))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Maximum: {settings.maxTokens}
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="1000"
                        step="25"
                        value={settings.maxTokens}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          maxTokens: parseInt(e.target.value),
                          minTokens: Math.min(prev.minTokens, parseInt(e.target.value))
                        }))}
                        className="w-full"
                      />
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      Range: {settings.minTokens} - {settings.maxTokens} tokens
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <History className="h-4 w-4" />
                  <span>History</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Writing Area */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-lg mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('writing')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'writing'
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Writing
                  </button>
                  <button
                    onClick={() => setActiveTab('resources')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'resources'
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Resources
                  </button>
                </nav>
              </div>
            </div>

            {activeTab === 'writing' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Toolbar */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <BookOpen className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {inputText.length} characters
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={exportStory}
                      className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Writing Area */}
              <div className="p-6">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Start writing your story here... The AI will help you continue where you leave off."
                  className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-gray-800 leading-relaxed"
                  style={{ fontFamily: 'Georgia, serif', fontSize: '16px', lineHeight: '1.6' }}
                />

                {/* AI Prediction Display */}
                {prediction && (
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Brain className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">AI Suggestion</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(prediction)}
                          className="text-purple-600 hover:text-purple-800 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-800 leading-relaxed mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                      {prediction}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={insertPrediction}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                      >
                        Insert
                      </button>
                      <button
                        onClick={() => setPrediction('')}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                {/* What Will Happen Next Section */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">What Will Happen Next?</span>
                  </div>
                  <textarea
                    value={userPrediction}
                    onChange={(e) => setUserPrediction(e.target.value)}
                    placeholder="Write your own prediction about what should happen next in the story..."
                    className="w-full h-24 p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-800 leading-relaxed bg-white"
                    style={{ fontFamily: 'Georgia, serif', fontSize: '14px' }}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-blue-600">
                      {userPrediction.length} characters
                    </span>
                    <div className="flex space-x-2">
                      {userPrediction && (
                        <>
                          <button
                            onClick={insertUserPrediction}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Insert My Idea
                          </button>
                          <button
                            onClick={() => copyToClipboard(userPrediction)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors"
                          >
                            Copy
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={handlePredict}
                    disabled={loading || !inputText.trim() || messagesRemaining <= 0}
                    className="flex items-center space-x-2 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Wand2 className="h-5 w-5" />
                    )}
                    <span>{loading ? 'Generating...' : 'Continue Writing'}</span>
                  </button>
                </div>
              </div>
            </div>
            )}

            {activeTab === 'resources' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Select Resources for AI Context</h2>
                <p className="text-gray-600 mb-6">Choose characters, lorebooks, plotlines, and facts to include in the AI's context when generating text.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Characters */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Characters</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableCharacters.map((character) => (
                        <label key={character.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={selectedCharacters.includes(character.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCharacters(prev => [...prev, character.id]);
                              } else {
                                setSelectedCharacters(prev => prev.filter(id => id !== character.id));
                              }
                            }}
                            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{character.name}</div>
                            <div className="text-sm text-gray-600">{character.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Lorebooks */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Lorebooks</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableLorebooks.map((lorebook) => (
                        <label key={lorebook.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={selectedLorebooks.includes(lorebook.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLorebooks(prev => [...prev, lorebook.id]);
                              } else {
                                setSelectedLorebooks(prev => prev.filter(id => id !== lorebook.id));
                              }
                            }}
                            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{lorebook.name}</div>
                            <div className="text-sm text-gray-600">{lorebook.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Plotlines */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Plotlines</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availablePlotlines.map((plotline) => (
                        <label key={plotline.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={selectedPlotlines.includes(plotline.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPlotlines(prev => [...prev, plotline.id]);
                              } else {
                                setSelectedPlotlines(prev => prev.filter(id => id !== plotline.id));
                              }
                            }}
                            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{plotline.name}</div>
                            <div className="text-sm text-gray-600">{plotline.description}</div>
                          </div>
                  {lorebooks.length > 0 ? (
                    <div className="space-y-2">
                      {lorebooks.map((lorebook: any) => (
                        <label key={lorebook.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedLorebooks.includes(lorebook.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLorebooks(prev => [...prev, lorebook.id]);
                              } else {
                                setSelectedLorebooks(prev => prev.filter(id => id !== lorebook.id));
                              }
                            }}
                            className="mt-1"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{lorebook.name}</div>
                            <div className="text-sm text-gray-600">{lorebook.description}</div>
                            <div className="text-xs text-gray-500">{lorebook.entries?.length || 0} entries</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No lorebooks created yet</p>
                      <p className="text-sm">Create lorebooks in the Lorebooks section</p>
                    </div>
                  )}
                          />
                          <div>
                            <div className="font-medium text-gray-900">{fact.title}</div>
                            <div className="text-sm text-gray-600">{fact.category}</div>
                          </div>
                        </label>
                      ))}
                  {plotlines.length > 0 ? (
                    <div className="space-y-2">
                      {plotlines.map((plotline: any) => (
                        <label key={plotline.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedPlotlines.includes(plotline.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPlotlines(prev => [...prev, plotline.id]);
                              } else {
                                setSelectedPlotlines(prev => prev.filter(id => id !== plotline.id));
                              }
                            }}
                            className="mt-1"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{plotline.title}</div>
                            <div className="text-sm text-gray-600">{plotline.description}</div>
                            <div className="text-xs text-gray-500">{plotline.plotPoints?.length || 0} plot points</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <PenTool className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No plotlines created yet</p>
                      <p className="text-sm">Create plotlines in the Plotlines section</p>
                    </div>
                  )}
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {predictions.map((pred) => (
                      <div key={pred.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-xs text-gray-500">
                            {new Date(pred.timestamp).toLocaleString()} • {pred.model}
                  {facts.length > 0 ? (
                    <div className="space-y-2">
                      {facts.map((fact: any) => (
                        <label key={fact.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedFacts.includes(fact.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFacts(prev => [...prev, fact.id]);
                              } else {
                                setSelectedFacts(prev => prev.filter(id => id !== fact.id));
                              }
                            }}
                            className="mt-1"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{fact.title}</div>
                            <div className="text-sm text-gray-600">{fact.content}</div>
                            <div className="text-xs text-gray-500">Category: {fact.category}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Database className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No facts created yet</p>
                      <p className="text-sm">Create facts in the Facts section</p>
                    </div>
                  )}
                            <div className="font-medium text-gray-900">{character.name}</div>
                            <div className="text-sm text-gray-600">{character.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                      {selectedCharacters.length > 0 && (
                        <div>Characters: {characters.filter((c: any) => selectedCharacters.includes(c.id)).map((c: any) => c.name).join(', ')}</div>
                      )}
                      {selectedLorebooks.length > 0 && (
                        <div>Lorebooks: {lorebooks.filter((l: any) => selectedLorebooks.includes(l.id)).map((l: any) => l.name).join(', ')}</div>
                      )}
                      {selectedPlotlines.length > 0 && (
                        <div>Plotlines: {plotlines.filter((p: any) => selectedPlotlines.includes(p.id)).map((p: any) => p.title).join(', ')}</div>
                      )}
                      {selectedFacts.length > 0 && (
                        <div>Facts: {facts.filter((f: any) => selectedFacts.includes(f.id)).map((f: any) => f.title).join(', ')}</div>
                      )}
                    </div>
                  )}
                )}
              </div>
            )}
          </div>
        </div>

        {/* Custom Style Form Modal */}
        {showCustomStyleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {editingStyle ? 'Edit Custom Style' : 'Create Custom Style'}
                </h2>
                <form onSubmit={handleCreateStyle} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Style Name
                    </label>
                    <input
                      type="text"
                      value={styleForm.name}
                      onChange={(e) => setStyleForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Noir Detective"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={styleForm.description}
                      onChange={(e) => setStyleForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Brief description of the style"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Style Prompt
                    </label>
                    <textarea
                      value={styleForm.prompt}
                      onChange={(e) => setStyleForm(prev => ({ ...prev, prompt: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Write in a gritty, noir detective style with short, punchy sentences and dark atmosphere..."
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomStyleForm(false);
                        setEditingStyle(null);
                        setStyleForm({ name: '', description: '', prompt: '' });
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {editingStyle ? 'Update Style' : 'Create Style'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Custom Genre Form Modal */}
        {showCustomGenreForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {editingGenre ? 'Edit Custom Genre' : 'Create Custom Genre'}
                </h2>
                <form onSubmit={handleCreateGenre} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre Name
                    </label>
                    <input
                      type="text"
                      value={genreForm.name}
                      onChange={(e) => setGenreForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Cyberpunk Western"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={genreForm.description}
                      onChange={(e) => setGenreForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Brief description of the genre"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre Characteristics
                    </label>
                    <textarea
                      value={genreForm.characteristics}
                      onChange={(e) => setGenreForm(prev => ({ ...prev, characteristics: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="High-tech dystopian future meets wild west frontier. Features advanced technology, corporate control, and frontier justice..."
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomGenreForm(false);
                        setEditingGenre(null);
                        setGenreForm({ name: '', description: '', characteristics: '' });
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {editingGenre ? 'Update Genre' : 'Create Genre'}
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