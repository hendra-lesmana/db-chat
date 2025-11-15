import mysql from 'mysql2/promise';
import { AIConnection } from '@/types/models';

export class MySqlDatabaseService {
  async testConnection(connection: AIConnection): Promise<boolean> {
    let connectionPool;
    try {
      connectionPool = await mysql.createConnection(connection.connectionString);
      await connectionPool.ping();
      await connectionPool.end();
      return true;
    } catch (error) {
      if (connectionPool) {
        await connectionPool.end();
      }
      throw new Error(`MySQL connection failed: ${error}`);
    }
  }

  async getSchema(connection: AIConnection): Promise<{ structured: any[], raw: string[] }> {
    let connectionPool;
    try {
      connectionPool = await mysql.createConnection(connection.connectionString);

      // Get all tables
      const [tables] = await connectionPool.execute(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()"
      ) as any[];

      const structured = [];
      const raw = [];

      for (const table of tables) {
        const tableName = table.TABLE_NAME;

        // Get columns for each table
        const [columns] = await connectionPool.execute(
          "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT " +
          "FROM INFORMATION_SCHEMA.COLUMNS " +
          "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
          [tableName]
        ) as any[];

        const columnNames = columns.map((col: any) => col.COLUMN_NAME);
        structured.push({
          tableName,
          columns: columnNames
        });

        raw.push(`Table: ${tableName}`);
        columns.forEach((col: any) => {
          raw.push(`  ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
        });
      }

      await connectionPool.end();
      return { structured, raw };
    } catch (error) {
      if (connectionPool) {
        await connectionPool.end();
      }
      throw new Error(`Failed to get MySQL schema: ${error}`);
    }
  }

  async executeQuery(connection: AIConnection, query: string): Promise<any[][]> {
    let connectionPool;
    try {
      connectionPool = await mysql.createConnection(connection.connectionString);
      const [rows] = await connectionPool.execute(query) as any[];
      await connectionPool.end();

      if (!Array.isArray(rows) || rows.length === 0) {
        return [];
      }

      // Convert to array format for table display
      const headers = Object.keys(rows[0]);
      const result = [headers];

      rows.forEach((row: any) => {
        result.push(headers.map(header => String(row[header] || '')));
      });

      return result;
    } catch (error) {
      if (connectionPool) {
        await connectionPool.end();
      }

      // Check if the error is related to unknown column
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.toLowerCase().includes('unknown column')) {
        throw new Error(`Database query failed: ${errorMessage}. This error typically occurs when the query references a column that doesn't exist in the database. Please check if the column name in your query is correct based on your database schema.`);
      } else {
        throw new Error(`Query execution failed: ${errorMessage}`);
      }
    }
  }
}