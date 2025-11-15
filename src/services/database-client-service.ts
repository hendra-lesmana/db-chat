import { AIConnection, DatabaseSchema } from '@/types/models';

export class DatabaseClientService {
  async testConnection(connection: AIConnection): Promise<boolean> {
    const response = await fetch('/api/database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connection, action: 'test' })
    });
    
    if (!response.ok) {
      throw new Error('Connection test failed');
    }
    
    const result = await response.json();
    return result.success;
  }

  async generateSchema(connection: AIConnection): Promise<{ structured: any[], raw: string[] }> {
    const response = await fetch('/api/database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connection, action: 'schema' })
    });
    
    if (!response.ok) {
      throw new Error('Schema generation failed');
    }
    
    return await response.json();
  }

  async getDataTable(connection: AIConnection, query: string): Promise<any[][]> {
    const response = await fetch('/api/database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connection, action: 'query', query })
    });
    
    if (!response.ok) {
      throw new Error('Query execution failed');
    }
    
    const result = await response.json();
    return result.data;
  }
}