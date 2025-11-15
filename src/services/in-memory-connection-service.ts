import { AIConnection } from '@/types/models';

export class InMemoryConnectionService {
  private readonly STORAGE_KEY = 'dbchatpro_connections';

  async getAIConnections(): Promise<AIConnection[]> {
    if (typeof window === 'undefined') {
      return [];
    }
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  async addConnection(connection: AIConnection): Promise<void> {
    const connections = await this.getAIConnections();
    
    // Check if connection with same name already exists
    if (connections.some(c => c.name === connection.name)) {
      throw new Error(`Connection with name "${connection.name}" already exists`);
    }
    
    connections.push(connection);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(connections));
  }

  async deleteConnection(name: string): Promise<void> {
    const connections = await this.getAIConnections();
    const filtered = connections.filter(c => c.name !== name);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  async updateConnection(name: string, connection: AIConnection): Promise<void> {
    const connections = await this.getAIConnections();
    const index = connections.findIndex(c => c.name === name);
    
    if (index === -1) {
      throw new Error(`Connection with name "${name}" not found`);
    }
    
    connections[index] = connection;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(connections));
  }
}