import { HistoryItem, QueryType } from '@/types/models';

export class InMemoryQueryService {
  private readonly HISTORY_KEY = 'dbchatpro_history';
  private readonly FAVORITES_KEY = 'dbchatpro_favorites';

  async getQueries(connectionName: string, queryType: QueryType): Promise<HistoryItem[]> {
    if (typeof window === 'undefined') {
      return [];
    }
    
    const storageKey = queryType === 'history' ? this.HISTORY_KEY : this.FAVORITES_KEY;
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) {
      return [];
    }
    
    const allQueries: HistoryItem[] = JSON.parse(stored);
    return allQueries.filter(q => q.name.startsWith(`${connectionName}:`));
  }

  async saveQuery(prompt: string, connectionName: string, queryType: QueryType): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }
    
    const storageKey = queryType === 'history' ? this.HISTORY_KEY : this.FAVORITES_KEY;
    const existing = localStorage.getItem(storageKey);
    const queries: HistoryItem[] = existing ? JSON.parse(existing) : [];
    
    const newQuery: HistoryItem = {
      name: `${connectionName}: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`,
      query: prompt,
      timestamp: new Date()
    };
    
    queries.unshift(newQuery);
    
    // Keep only last 100 history items or all favorites
    if (queryType === 'history' && queries.length > 100) {
      queries.splice(100);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(queries));
  }

  async deleteQuery(name: string, queryType: QueryType): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }
    
    const storageKey = queryType === 'history' ? this.HISTORY_KEY : this.FAVORITES_KEY;
    const existing = localStorage.getItem(storageKey);
    
    if (!existing) {
      return;
    }
    
    const queries: HistoryItem[] = JSON.parse(existing);
    const filtered = queries.filter(q => q.name !== name);
    
    localStorage.setItem(storageKey, JSON.stringify(filtered));
  }
}