import { Client } from 'pg';
import { AIConnection } from '@/types/models';

export class PostgresDatabaseService {
  async testConnection(connection: AIConnection): Promise<boolean> {
    const client = new Client({
      connectionString: connection.connectionString
    });
    
    try {
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      return true;
    } catch (error) {
      if (client) {
        await client.end();
      }
      throw new Error(`PostgreSQL connection failed: ${error}`);
    }
  }

  async getSchema(connection: AIConnection): Promise<{ structured: any[], raw: string[] }> {
    const client = new Client({
      connectionString: connection.connectionString
    });

    try {
      await client.connect();
      
      // Get all tables
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `);

      const structured = [];
      const raw = [];

      for (const table of tablesResult.rows) {
        const tableName = table.table_name;
        
        // Get columns for each table
        const columnsResult = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position
        `, [tableName]);

        const columnNames = columnsResult.rows.map((row: any) => row.column_name);
        structured.push({
          tableName,
          columns: columnNames
        });

        raw.push(`Table: ${tableName}`);
        columnsResult.rows.forEach((col: any) => {
          raw.push(`  ${col.column_name} (${col.data_type})`);
        });
      }

      await client.end();
      return { structured, raw };
    } catch (error) {
      if (client) {
        await client.end();
      }
      throw new Error(`Failed to get PostgreSQL schema: ${error}`);
    }
  }

  async executeQuery(connection: AIConnection, query: string): Promise<any[][]> {
    const client = new Client({
      connectionString: connection.connectionString
    });

    try {
      await client.connect();
      const result = await client.query(query);
      await client.end();
      
      if (!result.rows || result.rows.length === 0) {
        return [];
      }

      // Convert to array format for table display
      const headers = result.fields.map((field: any) => field.name);
      const data = [headers];
      
      result.rows.forEach((row: any) => {
        data.push(headers.map(header => String(row[header] || '')));
      });

      return data;
    } catch (error) {
      if (client) {
        await client.end();
      }
      throw new Error(`Query execution failed: ${error}`);
    }
  }
}