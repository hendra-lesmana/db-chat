'use client';

import { useState, useEffect } from 'react';
import { AIClientService } from '@/services/ai-client-service';
import { DatabaseClientService } from '@/services/database-client-service';
import { InMemoryConnectionService } from '@/services/in-memory-connection-service';
import { InMemoryQueryService } from '@/services/in-memory-query-service';
import { AIConnection, DatabaseSchema, HistoryItem, ChatMessage } from '@/types/models';
import { Send, Database, Settings, MessageSquare, History, Star, Play, Download } from 'lucide-react';

const aiClientService = new AIClientService();
const databaseService = new DatabaseClientService();
const connectionService = new InMemoryConnectionService();
const queryService = new InMemoryQueryService();

export default function HomePage() {
  const [connections, setConnections] = useState<AIConnection[]>([]);
  const [activeConnection, setActiveConnection] = useState<AIConnection | null>(null);
  const [dbSchema, setDbSchema] = useState<DatabaseSchema>({ schemaStructured: [], schemaRaw: [] });
  const [prompt, setPrompt] = useState('');
  const [aiModel, setAiModel] = useState('gemma3:1b');
  const [aiServiceType, setAiServiceType] = useState('Ollama');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [summary, setSummary] = useState('');
  const [rowData, setRowData] = useState<any[][]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<HistoryItem[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showSchema, setShowSchema] = useState(true);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const conns = await connectionService.getAIConnections();
      setConnections(conns);

      if (conns.length > 0 && !activeConnection) {
        const firstConnection = conns[0];
        setActiveConnection(firstConnection);
        await loadDatabaseSchema(firstConnection);
        await loadHistory(firstConnection.name);
      }
    } catch (error) {
      console.error('Failed to load connections:', error);
    }
  };

  const loadDatabaseSchema = async (connection: AIConnection) => {
    try {
      const schema = await databaseService.generateSchema(connection);
      setDbSchema({
        schemaStructured: schema.structured,
        schemaRaw: schema.raw
      });
    } catch (error) {
      console.error('Failed to load schema:', error);
      setError('Failed to load database schema');
    }
  };

  const loadHistory = async (connectionName: string) => {
    try {
      const hist = await queryService.getQueries(connectionName, 'history');
      const favs = await queryService.getQueries(connectionName, 'favorite');
      setHistory(hist);
      setFavorites(favs);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleDatabaseChange = async (connectionName: string) => {
    const connection = connections.find(c => c.name === connectionName);
    if (connection) {
      setActiveConnection(connection);
      await loadDatabaseSchema(connection);
      await loadHistory(connection.name);
      clearUI();
    }
  };

  const clearUI = () => {
    setPrompt('');
    setSummary('');
    setQuery('');
    setError('');
    setRowData([]);
    setChatHistory([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !activeConnection) return;

    await runDataChat(prompt);
  };

  const runDataChat = async (userPrompt: string) => {
    if (!activeConnection) return;

    setLoading(true);
    setError('');
    setLoadingMessage('Getting the AI query...');

    try {
      const aiResponse = await aiClientService.getAISQLQuery(
        aiModel,
        aiServiceType,
        userPrompt,
        dbSchema,
        activeConnection.databaseType
      );

      setQuery(aiResponse.query);
      setSummary(aiResponse.summary);

      setLoadingMessage('Running the Database query...');
      const data = await databaseService.getDataTable(activeConnection, aiResponse.query);
      setRowData(data);

      // Add system message to chat history
      setChatHistory([{
        role: 'system',
        content: `You are a helpful AI assistant. Provide helpful insights about the following data: ${JSON.stringify(data)}`
      }]);

      // Save to history
      await queryService.saveQuery(userPrompt, activeConnection.name, 'history');
      await loadHistory(activeConnection.name);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim() || rowData.length === 0) return;

    setChatLoading(true);
    const userMessage: ChatMessage = { role: 'user', content: chatPrompt };
    setChatHistory(prev => [...prev, userMessage]);
    setChatPrompt('');

    try {
      const aiResponse = await aiClientService.chatPrompt(chatHistory, aiModel, aiServiceType);
      const assistantMessage: ChatMessage = { role: 'assistant', content: aiResponse };
      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleEditQuery = async () => {
    if (!activeConnection || !query) return;

    try {
      const data = await databaseService.getDataTable(activeConnection, query);
      setRowData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Query execution failed');
    }
  };

  const handleSaveFavorite = async () => {
    if (!activeConnection || !prompt) return;

    try {
      await queryService.saveQuery(prompt, activeConnection.name, 'favorite');
      await loadHistory(activeConnection.name);
    } catch (error) {
      console.error('Failed to save favorite:', error);
    }
  };

  const loadQuery = async (queryText: string) => {
    setPrompt(queryText);
    await runDataChat(queryText);
  };

  if (connections.length === 0) {
    return (
      <div className="text-center py-12">
        <Database className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No databases connected</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by connecting to a database.</p>
        <div className="mt-6">
          <a
            href="/connect-db"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Database className="-ml-1 mr-2 h-4 w-4" />
            Connect Database
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Chat with your database</h1>
            <button
              onClick={() => setShowSchema(!showSchema)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Settings className="h-4 w-4 mr-2" />
              {showSchema ? 'Hide' : 'Show'} Schema
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="database" className="block text-sm font-medium text-gray-700">
                  Select Database
                </label>
                <select
                  id="database"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={activeConnection?.name || ''}
                  onChange={(e) => handleDatabaseChange(e.target.value)}
                >
                  {connections.map((conn) => (
                    <option key={conn.name} value={conn.name}>
                      {conn.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="aiService" className="block text-sm font-medium text-gray-700">
                  AI Service
                </label>
                <select
                  id="aiService"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={aiServiceType}
                  onChange={(e) => setAiServiceType(e.target.value)}
                >
                  <option value="Ollama">Ollama</option>
                  <option value="OpenAI">OpenAI</option>
                  <option value="Anthropic">Anthropic</option>
                  <option value="Google">Google</option>
                </select>
              </div>

              <div>
                <label htmlFor="aiModel" className="block text-sm font-medium text-gray-700">
                  AI Model
                </label>
                <input
                  type="text"
                  id="aiModel"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  placeholder="gpt-3.5-turbo"
                />
              </div>
            </div>

            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                Your prompt
              </label>
              <textarea
                id="prompt"
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask a question about your data..."
              />
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit
              </button>

              {rowData.length > 0 && (
                <button
                  type="button"
                  onClick={handleSaveFavorite}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Save Favorite
                </button>
              )}
            </div>
          </form>

          {loading && (
            <div className="flex items-center text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              {loadingMessage}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}
        </div>
      </div>

      {rowData.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <nav className="-mb-px flex space-x-8">
                <button className="border-blue-500 text-blue-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                  Results
                </button>
                <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                  SQL Editor
                </button>
                <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                  Insights
                </button>
              </nav>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {rowData[0]?.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rowData.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showSchema && activeConnection && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Database Schema for {activeConnection.name}
            </h3>
            <div className="space-y-4">
              {dbSchema.schemaStructured.map((table) => (
                <div key={table.tableName} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{table.tableName}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {table.columns.map((column) => (
                      <div key={column} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        {column}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {rowData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Chat with AI
              </h3>

              <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                {chatHistory.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${message.role === 'user'
                        ? 'bg-blue-50 ml-8'
                        : message.role === 'assistant'
                          ? 'bg-gray-50 mr-8'
                          : 'bg-green-50'
                      }`}
                  >
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      {message.role === 'user' ? 'You' : message.role === 'assistant' ? 'AI Assistant' : 'System'}:
                    </div>
                    <div className="text-sm text-gray-900">{message.content}</div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleChatSubmit} className="space-y-3">
                <textarea
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  placeholder="Ask the AI about your query results..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatPrompt.trim()}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {chatLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <History className="h-5 w-5 mr-2" />
                Query History
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => loadQuery(item.query)}
                    className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      {item.timestamp?.toLocaleString()}
                    </div>
                  </button>
                ))}
                {history.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No query history yet</p>
                )}
              </div>

              {favorites.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <Star className="h-4 w-4 mr-2" />
                    Favorites
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {favorites.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => loadQuery(item.query)}
                        className="w-full text-left p-2 border border-yellow-200 bg-yellow-50 rounded-md hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
