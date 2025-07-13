import React, { useState } from 'react';
import { Users, Plus, Download, Upload, Edit, Trash2, Image as ImageIcon, Info } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  scenario: string;
  first_mes: string;
  mes_example: string;
  creator_notes?: string;
  system_prompt?: string;
  post_history_instructions?: string;
  alternate_greetings?: string[];
  character_book?: any;
  tags?: string[];
  creator?: string;
  character_version?: string;
  image?: string;
  createdAt: string;
}

interface CharacterCardV2 {
  spec: string;
  spec_version: string;
  data: {
    name: string;
    description: string;
    personality: string;
    scenario: string;
    first_mes: string;
    mes_example: string;
    creator_notes?: string;
    system_prompt?: string;
    post_history_instructions?: string;
    alternate_greetings?: string[];
    character_book?: any;
    tags?: string[];
    creator?: string;
    character_version?: string;
  };
}

export default function CharacterCards() {
  const { useMessage, messagesRemaining } = useSubscription();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    personality: '',
    scenario: '',
    first_mes: '',
    mes_example: '',
    creator_notes: '',
    tags: '',
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
      name: formData.name,
      description: formData.description,
      personality: formData.personality,
      scenario: formData.scenario,
      first_mes: formData.first_mes,
      mes_example: formData.mes_example,
      creator_notes: formData.creator_notes,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      creator: 'PlumaAI User',
      character_version: '1.0',
      image: formData.image,
      createdAt: new Date().toISOString()
    };

    if (editingId) {
      setCharacters(prev => prev.map(c => c.id === editingId ? character : c));
      // Update localStorage
      const updatedCharacters = characters.map(c => c.id === editingId ? character : c);
      localStorage.setItem('plumaai_characters', JSON.stringify(updatedCharacters));
      setEditingId(null);
    } else {
      setCharacters(prev => [...prev, character]);
      // Save to localStorage
      const newCharacters = [...characters, character];
      localStorage.setItem('plumaai_characters', JSON.stringify(newCharacters));
      useMessage();
    }

    setFormData({
      name: '',
      description: '',
      personality: '',
      scenario: '',
      first_mes: '',
      mes_example: '',
      creator_notes: '',
      tags: '',
      image: ''
    });
    setShowForm(false);
  };

  const handleEdit = (character: Character) => {
    setFormData({
      name: character.name,
      description: character.description,
      personality: character.personality,
      scenario: character.scenario,
      first_mes: character.first_mes,
      mes_example: character.mes_example,
      creator_notes: character.creator_notes || '',
      tags: character.tags?.join(', ') || '',
      image: character.image || ''
    });
    setEditingId(character.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
    // Update localStorage
    const updatedCharacters = characters.filter(c => c.id !== id);
    localStorage.setItem('plumaai_characters', JSON.stringify(updatedCharacters));
  };

  // Create proper character card PNG with embedded JSON
  const exportCharacter = async (character: Character) => {
    // Create the character card data in V2 format
    const cardData: CharacterCardV2 = {
      spec: 'chara_card_v2',
      spec_version: '2.0',
      data: {
        name: character.name,
        description: character.description,
        personality: character.personality,
        scenario: character.scenario,
        first_mes: character.first_mes,
        mes_example: character.mes_example,
        creator_notes: character.creator_notes,
        system_prompt: character.system_prompt,
        post_history_instructions: character.post_history_instructions,
        alternate_greetings: character.alternate_greetings,
        character_book: character.character_book,
        tags: character.tags,
        creator: character.creator || 'PlumaAI',
        character_version: character.character_version || '1.0'
      }
    };

    // Create canvas for the character card
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 768;

    if (ctx) {
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Character name with background
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, 20, canvas.width - 40, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(character.name, canvas.width / 2, 60);

      // Creator and version info
      ctx.font = '14px Arial';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`v${character.character_version || '1.0'} | @${character.creator || 'PlumaAI'}`, canvas.width / 2, 100);

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
            ctx.fillText(line, 30, currentY);
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

      let y = 130;
      
      // Description section
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('Description:', 30, y);
      y += 25;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#334155';
      y = wrapText(character.description, y, 22, 4);

      y += 15;
      
      // Personality section
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('Personality:', 30, y);
      y += 25;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#334155';
      y = wrapText(character.personality, y, 22, 3);

      y += 15;
      
      // Scenario section
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('Scenario:', 30, y);
      y += 25;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#334155';
      y = wrapText(character.scenario, y, 22, 3);

      y += 15;
      
      // First Message section
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('First Message:', 30, y);
      y += 25;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#334155';
      y = wrapText(character.first_mes, y, 22, 4);

      // Tags
      if (character.tags && character.tags.length > 0) {
        y += 15;
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Tags:', 30, y);
        y += 20;
        ctx.font = '14px Arial';
        ctx.fillStyle = '#64748b';
        ctx.fillText(character.tags.join(', '), 30, y);
      }

      // Footer
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Character Card v2.0 | Generated by PlumaAI', canvas.width / 2, canvas.height - 20);

      // Convert to blob and add metadata
      canvas.toBlob(async (blob) => {
        if (blob) {
          // Create a new PNG with embedded character data
          const arrayBuffer = await blob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Convert character data to base64 encoded JSON
          const jsonString = JSON.stringify(cardData);
          const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
          
          // Create tEXt chunk with character data
          const keyword = 'chara';
          const textData = keyword + '\0' + base64Data;
          const textBytes = new TextEncoder().encode(textData);
          
          // Calculate CRC32 for the chunk
          const crc32 = (data: Uint8Array) => {
            const table = new Uint32Array(256);
            for (let i = 0; i < 256; i++) {
              let c = i;
              for (let j = 0; j < 8; j++) {
                c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
              }
              table[i] = c;
            }
            
            let crc = 0xFFFFFFFF;
            for (let i = 0; i < data.length; i++) {
              crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
            }
            return (crc ^ 0xFFFFFFFF) >>> 0;
          };
          
          // Create the complete tEXt chunk
          const chunkType = new TextEncoder().encode('tEXt');
          const chunkLength = new Uint32Array([textBytes.length]);
          const chunkCRC = new Uint32Array([crc32(new Uint8Array([...chunkType, ...textBytes]))]);
          
          // Convert to big-endian
          const lengthBytes = new Uint8Array(chunkLength.buffer).reverse();
          const crcBytes = new Uint8Array(chunkCRC.buffer).reverse();
          
          // Find IEND chunk position
          let iendPos = uint8Array.length - 12; // IEND is typically at the end
          for (let i = uint8Array.length - 20; i >= 0; i--) {
            if (uint8Array[i] === 0x49 && uint8Array[i+1] === 0x45 && 
                uint8Array[i+2] === 0x4E && uint8Array[i+3] === 0x44) {
              iendPos = i - 4;
              break;
            }
          }
          
          // Create new PNG with embedded data
          const newPNG = new Uint8Array(uint8Array.length + 12 + textBytes.length);
          newPNG.set(uint8Array.slice(0, iendPos), 0);
          newPNG.set(lengthBytes, iendPos);
          newPNG.set(chunkType, iendPos + 4);
          newPNG.set(textBytes, iendPos + 8);
          newPNG.set(crcBytes, iendPos + 8 + textBytes.length);
          newPNG.set(uint8Array.slice(iendPos), iendPos + 12 + textBytes.length);
          
          // Download the file
          const newBlob = new Blob([newPNG], { type: 'image/png' });
          const url = URL.createObjectURL(newBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${character.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
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

  // Parse character card from PNG with embedded data
  const parseCharacterCardPNG = async (file: File): Promise<Character | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Parse PNG chunks to find tEXt chunks
          let offset = 8; // Skip PNG signature
          
          while (offset < uint8Array.length) {
            // Read chunk length (4 bytes, big-endian)
            const length = (uint8Array[offset] << 24) | (uint8Array[offset + 1] << 16) | 
                          (uint8Array[offset + 2] << 8) | uint8Array[offset + 3];
            offset += 4;
            
            // Read chunk type (4 bytes)
            const type = String.fromCharCode(uint8Array[offset], uint8Array[offset + 1], 
                                           uint8Array[offset + 2], uint8Array[offset + 3]);
            offset += 4;
            
            // Check for tEXt chunks
            if (type === 'tEXt') {
              const chunkData = uint8Array.slice(offset, offset + length);
              const text = new TextDecoder('latin1').decode(chunkData);
              
              // Look for character data
              const nullIndex = text.indexOf('\0');
              if (nullIndex !== -1) {
                const keyword = text.substring(0, nullIndex);
                const data = text.substring(nullIndex + 1);
                
                if (keyword === 'chara' || keyword === 'character') {
                  try {
                    // Try to decode base64 data
                    const decodedData = atob(data);
                    const characterData = JSON.parse(decodedData);
                    
                    // Handle both V1 and V2 formats
                    let charInfo;
                    if (characterData.spec === 'chara_card_v2') {
                      charInfo = characterData.data;
                    } else {
                      charInfo = characterData;
                    }
                    
                    const character: Character = {
                      id: Date.now().toString(),
                      name: charInfo.name || 'Imported Character',
                      description: charInfo.description || charInfo.char_persona || '',
                      personality: charInfo.personality || charInfo.char_personality || '',
                      scenario: charInfo.scenario || charInfo.world_scenario || '',
                      first_mes: charInfo.first_mes || charInfo.char_greeting || '',
                      mes_example: charInfo.mes_example || charInfo.example_dialogue || '',
                      creator_notes: charInfo.creator_notes || '',
                      system_prompt: charInfo.system_prompt || '',
                      post_history_instructions: charInfo.post_history_instructions || '',
                      alternate_greetings: charInfo.alternate_greetings || [],
                      character_book: charInfo.character_book || null,
                      tags: charInfo.tags || [],
                      creator: charInfo.creator || 'Unknown',
                      character_version: charInfo.character_version || '1.0',
                      createdAt: new Date().toISOString()
                    };
                    
                    resolve(character);
                    return;
                  } catch (parseError) {
                    console.error('Error parsing character data:', parseError);
                  }
                }
              }
            }
            
            // Move to next chunk
            offset += length + 4; // +4 for CRC
          }
          
          resolve(null);
        } catch (error) {
          console.error('Error reading PNG:', error);
          resolve(null);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleImportCharacters = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/json') {
      // Handle JSON files
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          let importedCharacters: Character[] = [];
          
          if (Array.isArray(importedData)) {
            importedCharacters = importedData;
          } else if (importedData.spec === 'chara_card_v2') {
            // Handle V2 format
            const charData = importedData.data;
            importedCharacters = [{
              id: Date.now().toString(),
              name: charData.name,
              description: charData.description,
              personality: charData.personality,
              scenario: charData.scenario,
              first_mes: charData.first_mes,
              mes_example: charData.mes_example,
              creator_notes: charData.creator_notes || '',
              tags: charData.tags || [],
              creator: charData.creator || 'Unknown',
              character_version: charData.character_version || '1.0',
              createdAt: new Date().toISOString()
            }];
          } else {
            // Handle single character or V1 format
            importedCharacters = [importedData];
          }
          
          setCharacters(prev => [...prev, ...importedCharacters]);
          alert(`Successfully imported ${importedCharacters.length} character(s)!`);
        } catch (error) {
          alert('Error importing JSON file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      // Handle PNG character cards
      const character = await parseCharacterCardPNG(file);
      
      if (character) {
        // Add the image to the character
        const reader = new FileReader();
        reader.onload = (e) => {
          character.image = e.target?.result as string;
          setCharacters(prev => [...prev, character]);
          alert(`Character "${character.name}" imported successfully from PNG!`);
        };
        reader.readAsDataURL(file);
      } else {
        alert('No character data found in PNG file. Please ensure this is a valid character card PNG with embedded data.');
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
            <p className="text-sm text-gray-500 mt-1">
              Compatible with Character.AI, Tavern AI, SillyTavern, and other platforms
            </p>
          </div>
          <div className="flex space-x-4">
            <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Import PNG/JSON
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

        {/* Format Information */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Character Card Format Support</h3>
              <div className="text-blue-800 text-sm space-y-1">
                <p>• <strong>PNG Import:</strong> Supports Character Card V2 format with embedded JSON data</p>
                <p>• <strong>PNG Export:</strong> Creates standard character cards compatible with most AI chat platforms</p>
                <p>• <strong>JSON Import/Export:</strong> Full data preservation for backup and sharing</p>
                <p>• <strong>Fields:</strong> Name, Description, Personality, Scenario, First Message, Example Messages, Tags</p>
              </div>
            </div>
          </div>
        </div>

        {/* Character Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {editingId ? 'Edit Character' : 'Create New Character'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Character Name *
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
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="fantasy, adventure, magic"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Brief description of the character..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Personality *
                    </label>
                    <textarea
                      value={formData.personality}
                      onChange={(e) => setFormData(prev => ({ ...prev, personality: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Character traits, behavior, mannerisms..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scenario *
                    </label>
                    <textarea
                      value={formData.scenario}
                      onChange={(e) => setFormData(prev => ({ ...prev, scenario: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Setting, situation, or context for interactions..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Message *
                    </label>
                    <textarea
                      value={formData.first_mes}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_mes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="The character's opening message or greeting..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Example Messages
                    </label>
                    <textarea
                      value={formData.mes_example}
                      onChange={(e) => setFormData(prev => ({ ...prev, mes_example: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Example dialogue between {{user}} and {{char}}..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Creator Notes
                    </label>
                    <textarea
                      value={formData.creator_notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, creator_notes: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Additional notes about the character..."
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
                          personality: '',
                          scenario: '',
                          first_mes: '',
                          mes_example: '',
                          creator_notes: '',
                          tags: '',
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
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{character.name}</h3>
                    <p className="text-sm text-gray-500">v{character.character_version} | @{character.creator}</p>
                  </div>
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
                      title="Export as PNG Character Card"
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
                    <p className="text-gray-600 text-sm line-clamp-2">{character.description}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Personality</h4>
                    <p className="text-gray-600 text-sm line-clamp-2">{character.personality}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">First Message</h4>
                    <p className="text-gray-600 text-sm line-clamp-2">{character.first_mes}</p>
                  </div>

                  {character.tags && character.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {character.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {character.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{character.tags.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {characters.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No characters yet</h3>
            <p className="text-gray-600 mb-6">Create your first character or import a PNG character card</p>
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