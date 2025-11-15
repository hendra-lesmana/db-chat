export interface AIConnection {
  connectionString: string;
  name: string;
  databaseType: string;
}

export interface AIQuery {
  summary: string;
  query: string;
}

export interface TableSchema {
  tableName: string;
  columns: string[];
}

export interface DatabaseSchema {
  schemaStructured: TableSchema[];
  schemaRaw: string[];
}

export interface FormModel {
  prompt: string;
}

export interface HistoryItem {
  name: string;
  query: string;
  timestamp?: Date;
}

export type QueryType = 'history' | 'favorite';

export type DatabaseType = 'MSSQL' | 'MYSQL' | 'POSTGRESQL';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIServiceConfig {
  openai?: {
    apiKey: string;
  };
  azureOpenAI?: {
    endpoint: string;
    apiKey?: string;
  };
  ollama?: {
    endpoint: string;
  };
  maxRows: number;
}