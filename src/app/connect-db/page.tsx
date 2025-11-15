'use client';

import { useState, useEffect } from 'react';
import { DatabaseClientService } from '@/services/database-client-service';
import { InMemoryConnectionService } from '@/services/in-memory-connection-service';
import { AIConnection } from '@/types/models';
import { Database, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const databaseService = new DatabaseClientService();
const connectionService = new InMemoryConnectionService();

export default function ConnectDatabasePage() {
  const [connections, setConnections] = useState<AIConnection[]>([]);
  const [formData, setFormData] = useState<AIConnection>({
    name: '',
    connectionString: '',
    databaseType: 'MYSQL'
  });
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [schemaPreview, setSchemaPreview] = useState<any>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const conns = await connectionService.getAIConnections();
      setConnections(conns);
    } catch (error) {
      console.error('Failed to load connections:', error);
      setError('Failed to load existing connections');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const testConnection = async () => {
    if (!formData.name || !formData.connectionString) {
      setError('Please fill in all fields');
      return;
    }

    setTesting(true);
    setError('');
    setSuccess('');
    setSchemaPreview(null);

    try {
      // Test the connection
      await databaseService.testConnection(formData);
      
      // Get schema preview
      const schema = await databaseService.generateSchema(formData);
      setSchemaPreview(schema);
      setSuccess('Connection successful! Schema loaded.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const saveConnection = async () => {
    if (!formData.name || !formData.connectionString || !schemaPreview) {
      setError('Please test the connection first');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await connectionService.addConnection(formData);
      setSuccess('Connection saved successfully!');
      
      // Reset form
      setFormData({
        name: '',
        connectionString: '',
        databaseType: 'MYSQL'
      });
      setSchemaPreview(null);
      
      // Reload connections
      await loadConnections();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save connection');
    } finally {
      setSaving(false);
    }
  };

  const deleteConnection = async (name: string) => {
    if (!confirm(`Are you sure you want to delete the connection "${name}"?`)) {
      return;
    }

    try {
      await connectionService.deleteConnection(name);
      setSuccess(`Connection "${name}" deleted successfully`);
      await loadConnections();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete connection');
    }
  };

  const getConnectionStringExamples = () => {
    switch (formData.databaseType) {
      case 'MYSQL':
        return 'mysql://username:password@localhost:3306/database_name';
      case 'POSTGRESQL':
        return 'postgresql://username:password@localhost:5432/database_name';
      case 'MSSQL':
        return 'Server=localhost;Database=database_name;User Id=username;Password=password;';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-6">
            <Database className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Manage Database Connections</h1>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add New Connection Form */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Connection</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="databaseType" className="block text-sm font-medium text-gray-700">
                    Database Type
                  </label>
                  <select
                    id="databaseType"
                    name="databaseType"
                    value={formData.databaseType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="MYSQL">MySQL</option>
                    <option value="POSTGRESQL">PostgreSQL</option>
                    <option value="MSSQL">SQL Server</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Connection Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="My Database"
                  />
                </div>

                <div>
                  <label htmlFor="connectionString" className="block text-sm font-medium text-gray-700">
                    Connection String
                  </label>
                  <textarea
                    id="connectionString"
                    name="connectionString"
                    rows={3}
                    value={formData.connectionString}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={getConnectionStringExamples()}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Example: {getConnectionStringExamples()}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={testConnection}
                    disabled={testing || !formData.name || !formData.connectionString}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {testing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Testing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </button>

                  {schemaPreview && (
                    <button
                      type="button"
                      onClick={saveConnection}
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Save Connection
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {schemaPreview && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Schema Preview</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {schemaPreview.structured.map((table: any, index: number) => (
                      <div key={index} className="bg-white rounded border p-2">
                        <div className="font-medium text-sm text-gray-900">{table.tableName}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {table.columns.slice(0, 5).join(', ')}
                          {table.columns.length > 5 && ` +${table.columns.length - 5} more`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Existing Connections */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Existing Connections</h2>
              
              {connections.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Database className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No connections</h3>
                  <p className="mt-1 text-sm text-gray-500">Add your first database connection above.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {connections.map((connection) => (
                    <div key={connection.name} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{connection.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">{connection.databaseType}</p>
                        </div>
                        <button
                          onClick={() => deleteConnection(connection.name)}
                          className="inline-flex items-center px-2 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Security Information</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    The AI service does NOT have access to your database or data records - it only understands the schema structure.
                    Connection strings are stored locally in your browser and are never sent to external services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}