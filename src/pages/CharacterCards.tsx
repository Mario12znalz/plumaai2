import React, { useState } from 'react';
import { Users, Plus, Download, Upload, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

interface Character {
  id: string;
  name: string;
  description: string;
  appearance: string;
  personality: string;
  backstory: string;
  image?: string;
  createdAt: string;
}

export default function CharacterCards() {
  const { useMessage, messagesRemaining } = useSubscription();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    appearance: '',
    personality: '',
    backstory: '',
    image: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messagesRemaining <= 0) {
      alert('No messages remaining. Please upgrade your plan.');
      return;
    }

    const character: Character = {
      id: editingId || Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString()
    };

    if (editingId) {
      setCharacters(prev => prev.map(c => c.id === editingId ? character : c));
      setEditingId(null);
    } else {
      setCharacters(prev => [...prev, character]);
      useMessage();
    }

    setFormData({
      name: '',
      description: '',
      appearance: '',
      personality: '',
      backstory: '',
      image: ''
    });
    setShowForm(false);
  };

  const handleEdit = (character: Character) => {
    setFormData({
      name: character.name,
      description: character.description,
      appearance: character.appearance,
      personality: character.personality,
      backstory: character.backstory,
      image: character.image || ''
    });
    setEditingId(character.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  };

  const exportCharacter = (character: Character) => {
    // Create a canvas to generate proper character card PNG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 768;

    if (ctx) {
      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Character name
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(character.name, canvas.width / 2, 50);

      // Version and Creator
      ctx.font = '14px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('v1.0 | @PlumaAI', canvas.width / 2, 75);

      // Card sections
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      const maxWidth = canvas.width - 60;
      
      const wrapText = (text: string, y: number, lineHeight: number, maxLines = 10) => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        let lineCount = 0;
        
        for (let n = 0; n < words.length && lineCount < maxLines; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, 20, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
            lineCount++;
          } else {
            line = testLine;
          }
        }
        if (lineCount < maxLines) {
          ctx.fillText(line, 30, currentY);
        }
        return currentY + lineHeight;
      };

      let y = 110;
      
      // Description section
      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('Description:', 30, y);
      y += 25;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#374151';
      y = wrapText(character.description, y, 22, 3);

      y += 15;
      
      // First Message section
      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('First Message:', 30, y);
      y += 25;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#374151';
      const firstMessage = `"Hello! I'm ${character.name}. ${character.description.split('.')[0]}."`;
      y = wrapText(firstMessage, y, 22, 3);

      y += 15;
      
      // Summary section
      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('Summary:', 30, y);
      y += 25;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#374151';
      y = wrapText(character.backstory.substring(0, 200) + '...', y, 22, 3);

      y += 15;
      
      // Scenario section
      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('Scenario:', 30, y);
      y += 25;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#374151';
      const scenario = `You meet ${character.name} in their world. ${character.appearance}`;
      y = wrapText(scenario, y, 22, 2);

      y += 15;
      
      // Character Notes section
      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('Character Notes:', 30, y);
      y += 25;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#374151';
      y = wrapText(`Personality: ${character.personality}`, y, 22, 4);

      // Footer
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Generated by PlumaAI', canvas.width / 2, canvas.height - 20);

      // Download
      const link = document.createElement('a');
      link.download = `${character.name}-character-card.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const exportAllCharacters = () => {
    const dataStr = JSON.stringify(characters, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'characters.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importCharacters = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedCharacters = JSON.parse(e.target?.result as string);
          setCharacters(prev => [...prev, ...importedCharacters]);
        } catch (error) {
          alert('Error importing characters. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Character Cards</h1>
            <p className="text-gray-600 mt-2">Create and manage your story characters</p>
          </div>
          <div className="flex space-x-4">
            <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importCharacters}
                className="hidden"
              />
            </label>
            <button
              onClick={exportAllCharacters}
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
              New Character
            </button>
          </div>
        </div>

        {/* Character Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {editingId ? 'Edit Character' : 'Create New Character'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Character Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Appearance
                    </label>
                    <textarea
                      value={formData.appearance}
                      onChange={(e) => setFormData(prev => ({ ...prev, appearance: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Personality
                    </label>
                    <textarea
                      value={formData.personality}
                      onChange={(e) => setFormData(prev => ({ ...prev, personality: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Backstory
                    </label>
                    <textarea
                      value={formData.backstory}
                      onChange={(e) => setFormData(prev => ({ ...prev, backstory: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setFormData({
                          name: '',
                          description: '',
                          appearance: '',
                          personality: '',
                          backstory: '',
                          image: ''
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
                      {editingId ? 'Update Character' : 'Create Character'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Characters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <div key={character.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{character.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(character)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => exportCharacter(character)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(character.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {character.image && (
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                    <p className="text-gray-600 text-sm">{character.description}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Appearance</h4>
                    <p className="text-gray-600 text-sm">{character.appearance}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Personality</h4>
                    <p className="text-gray-600 text-sm">{character.personality}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {characters.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No characters yet</h3>
            <p className="text-gray-600 mb-6">Create your first character to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create First Character
            </button>
          </div>
        )}
      </div>
    </div>
  );
}