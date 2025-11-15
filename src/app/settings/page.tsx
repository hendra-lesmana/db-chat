'use client';

import { useState } from 'react';
import { Settings, Key, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [openAIKey, setOpenAIKey] = useState('');
  const [azureEndpoint, setAzureEndpoint] = useState('');
  const [azureKey, setAzureKey] = useState('');
  const [ollamaEndpoint, setOllamaEndpoint] = useState('');
  const [maxRows, setMaxRows] = useState(100);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setMessageType('');

    try {
      // In a real application, you would save these to your backend or secure storage
      // For now, we'll just show a success message
      
      if (openAIKey) {
        localStorage.setItem('dbchatpro_openai_key', openAIKey);
      }
      if (azureEndpoint) {
        localStorage.setItem('dbchatpro_azure_endpoint', azureEndpoint);
      }
      if (azureKey) {
        localStorage.setItem('dbchatpro_azure_key', azureKey);
      }
      if (ollamaEndpoint) {
        localStorage.setItem('dbchatpro_ollama_endpoint', ollamaEndpoint);
      }
      if (maxRows) {
        localStorage.setItem('dbchatpro_max_rows', maxRows.toString());
      }

      setMessage('Settings saved successfully!');
      setMessageType('success');
      
      // Clear sensitive fields
      setOpenAIKey('');
      setAzureKey('');
    } catch (error) {
      setMessage('Failed to save settings');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-6">
            <Settings className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>

          {message && (
            <div className={`mb-6 border rounded-md p-4 ${
              messageType === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex">
                {messageType === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                )}
                <div className="ml-3">
                  <p className="text-sm">{message}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {/* OpenAI Configuration */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Key className="h-5 w-5 mr-2" />
                OpenAI Configuration
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="openaiKey" className="block text-sm font-medium text-gray-700">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    id="openaiKey"
                    value={openAIKey}
                    onChange={(e) => setOpenAIKey(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="sk-..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Your OpenAI API key. This is stored locally in your browser.
                  </p>
                </div>
              </div>
            </div>

            {/* Azure OpenAI Configuration */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Azure OpenAI Configuration
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="azureEndpoint" className="block text-sm font-medium text-gray-700">
                    Azure OpenAI Endpoint
                  </label>
                  <input
                    type="url"
                    id="azureEndpoint"
                    value={azureEndpoint}
                    onChange={(e) => setAzureEndpoint(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://your-resource.openai.azure.com/"
                  />
                </div>
                
                <div>
                  <label htmlFor="azureKey" className="block text-sm font-medium text-gray-700">
                    Azure OpenAI API Key (Optional)
                  </label>
                  <input
                    type="password"
                    id="azureKey"
                    value={azureKey}
                    onChange={(e) => setAzureKey(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Optional - for key-based authentication"
                  />
                </div>
              </div>
            </div>

            {/* Ollama Configuration */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Ollama Configuration
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="ollamaEndpoint" className="block text-sm font-medium text-gray-700">
                    Ollama Endpoint
                  </label>
                  <input
                    type="url"
                    id="ollamaEndpoint"
                    value={ollamaEndpoint}
                    onChange={(e) => setOllamaEndpoint(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="http://localhost:11434"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    URL to your local Ollama instance.
                  </p>
                </div>
              </div>
            </div>

            {/* General Settings */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="maxRows" className="block text-sm font-medium text-gray-700">
                    Maximum Rows per Query
                  </label>
                  <input
                    type="number"
                    id="maxRows"
                    min="1"
                    max="10000"
                    value={maxRows}
                    onChange={(e) => setMaxRows(parseInt(e.target.value) || 100)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Maximum number of rows to return from database queries.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Configuration Notes</h3>
                <div className="mt-2 text-sm text-blue-700 space-y-1">
                  <p>• API keys are stored locally in your browser's localStorage.</p>
                  <p>• For production use, consider implementing secure backend storage.</p>
                  <p>• You can use either OpenAI, Azure OpenAI, or Ollama as your AI provider.</p>
                  <p>• Make sure to configure your environment variables for deployment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}