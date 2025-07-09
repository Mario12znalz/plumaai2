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
      if (file.type === 'application/json') {
        // Handle JSON files
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedCharacters = JSON.parse(e.target?.result as string);
            setCharacters(prev => [...prev, ...importedCharacters]);
          } catch (error) {
            alert('Error importing JSON characters. Please check the file format.');
          }
        };
        reader.readAsText(file);
      } else if (file.type.startsWith('image/')) {
        // Handle PNG character cards
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const img = new Image();
            img.onload = () => {
              // Create canvas to read image data
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = img.width;
              canvas.height = img.height;
              
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                
                // Try to extract text from image using OCR-like approach
                // For now, we'll create a character based on filename and prompt user
                const fileName = file.name.replace(/\.[^/.]+$/, "");
                const character: Character = {
                  id: Date.now().toString(),
                  name: fileName || 'Imported Character',
                  description: 'Character imported from PNG card. Please edit to add details.',
                  appearance: 'Please add appearance details from the character card.',
                  personality: 'Please add personality details from the character card.',
                  backstory: 'Please add backstory details from the character card.',
                  image: e.target?.result as string,
                  createdAt: new Date().toISOString()
                };
                
                setCharacters(prev => [...prev, character]);
                alert(`Character "${character.name}" imported from PNG. Please edit to add the details from your character card.`);
              }
            };
            img.src = e.target?.result as string;
          } catch (error) {
            alert('Error importing PNG character card. Please try again.');
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select a JSON file or PNG character card.');
      }
    }
  };

  // Add function to parse character card text format
  const parseCharacterCardText = (text: string): Partial<Character> => {
    const lines = text.split('\n');
    const character: Partial<Character> = {};
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('Name:')) {
        character.name = trimmed.replace('Name:', '').trim();
      } else if (trimmed.startsWith('Description:')) {
        character.description = trimmed.replace('Description:', '').trim();
      } else if (trimmed.startsWith('Personality:')) {
        character.personality = trimmed.replace('Personality:', '').trim();
      } else if (trimmed.startsWith('Appearance:')) {
        character.appearance = trimmed.replace('Appearance:', '').trim();
      } else if (trimmed.startsWith('Backstory:') || trimmed.startsWith('Summary:')) {
        character.backstory = trimmed.replace(/^(Backstory:|Summary:)/, '').trim();
      }
    }
    
    return character;
  };

  // Enhanced import with text parsing
  const importCharacterWithTextParsing = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/json') {
        // Handle JSON files
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedCharacters = JSON.parse(e.target?.result as string);
            setCharacters(prev => [...prev, ...importedCharacters]);
          } catch (error) {
            alert('Error importing JSON characters. Please check the file format.');
          }
        };
        reader.readAsText(file);
      } else if (file.type.startsWith('image/')) {
        // Handle PNG character cards with text extraction
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              
              // Create character with image and prompt for manual entry
              const fileName = file.name.replace(/\.[^/.]+$/, "");
              
              // Show modal for manual character data entry
              const characterData = prompt(`Please enter character data for "${fileName}" in this format:
Name: Character Name
Description: Brief description
Personality: Character personality
Appearance: Physical appearance
Backstory: Character background

Paste the character card text here:`);
              
              if (characterData) {
                const parsedData = parseCharacterCardText(characterData);
                const character: Character = {
                  id: Date.now().toString(),
                  name: parsedData.name || fileName || 'Imported Character',
                  description: parsedData.description || 'Please add description',
                  appearance: parsedData.appearance || 'Please add appearance',
                  personality: parsedData.personality || 'Please add personality',
                  backstory: parsedData.backstory || 'Please add backstory',
                  image: e.target?.result as string,
                  createdAt: new Date().toISOString()
                };
                
                setCharacters(prev => [...prev, character]);
                alert(`Character "${character.name}" imported successfully!`);
              }
            }
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select a JSON file or PNG character card.');
      }
    }
  };

  // Add advanced PNG parsing for embedded JSON
  const parseEmbeddedCharacterData = async (file: File): Promise<Character | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Look for JSON data in PNG chunks or metadata
          const text = new TextDecoder().decode(uint8Array);
          
          // Try to find JSON-like patterns
          const jsonMatch = text.match(/\{[^{}]*"name"[^{}]*\}/g);
          if (jsonMatch) {
            try {
              const characterData = JSON.parse(jsonMatch[0]);
              const character: Character = {
                id: Date.now().toString(),
                name: characterData.name || 'Imported Character',
                description: characterData.description || characterData.desc || 'Imported character',
                appearance: characterData.appearance || characterData.looks || 'Please add appearance',
                personality: characterData.personality || characterData.persona || 'Please add personality',
                backstory: characterData.backstory || characterData.background || 'Please add backstory',
                createdAt: new Date().toISOString()
              };
              resolve(character);
              return;
            } catch (parseError) {
              // Continue to manual parsing
            }
          }
          
          resolve(null);
        } catch (error) {
          resolve(null);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Updated import function with better PNG support
  const handleImportCharacters = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/json') {
      // Handle JSON files
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedCharacters = JSON.parse(e.target?.result as string);
          if (Array.isArray(importedCharacters)) {
            setCharacters(prev => [...prev, ...importedCharacters]);
          } else {
            setCharacters(prev => [...prev, importedCharacters]);
          }
          alert('Characters imported successfully!');
        } catch (error) {
          alert('Error importing JSON characters. Please check the file format.');
        }
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      // Try to parse embedded character data first
      const embeddedCharacter = await parseEmbeddedCharacterData(file);
      
      if (embeddedCharacter) {
        setCharacters(prev => [...prev, embeddedCharacter]);
        alert(`Character "${embeddedCharacter.name}" imported from PNG!`);
      } else {
        // Fallback to manual entry with image preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileName = file.name.replace(/\.[^/.]+$/, "");
          
          // Create a more user-friendly input dialog
          const characterName = prompt('Character Name:', fileName) || fileName;
          const description = prompt('Description:', '') || 'Imported character';
          const personality = prompt('Personality:', '') || 'Please add personality';
          const appearance = prompt('Appearance:', '') || 'Please add appearance';
          const backstory = prompt('Backstory:', '') || 'Please add backstory';
          
          if (characterName) {
            const character: Character = {
              id: Date.now().toString(),
              name: characterName,
              description,
              appearance,
              personality,
              backstory,
              image: e.target?.result as string,
              createdAt: new Date().toISOString()
            };
            
            setCharacters(prev => [...prev, character]);
            alert(`Character "${character.name}" imported successfully!`);
          }
        };
        reader.readAsDataURL(file);
      }
    } else {
      alert('Please select a JSON file or PNG character card.');
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
                accept=".json,.png,.jpg,.jpeg"
                onChange={handleImportCharacters}
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