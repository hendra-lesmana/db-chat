import sql from 'mssql';
import { AIConnection } from '@/types/models';

export class SqlServerDatabaseService {
  async testConnection(connection: AIConnection): Promise<boolean> {
    let pool;
    try {
      pool = await sql.connect(connection.connectionString);
      await pool.request().query('SELECT 1');
      await pool.close();
      return true;
    } catch (error) {
      if (pool) {
        await pool.close();
      }
      throw new Error(`SQL Server connection failed: ${error}`);
    }
  }

  async getSchema(connection: AIConnection): Promise<{ structured: any[], raw: string[] }> {
    let pool;
    try {
      pool = await sql.connect(connection.connectionString);
      
      // Get all tables
      const tablesResult = await pool.request().query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
      `);

      const structured = [];
      const raw = [];

      for (const table of tablesResult.recordset) {
        const tableName = table.TABLE_NAME;
        
        // Get columns for each table
        const columnsResult = await pool.request()
          .input('tableName', sql.VarChar, tableName)
          .query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = @tableName
            ORDER BY ORDINAL_POSITION
          `);

        const columnNames = columnsResult.recordset.map((col: any) => col.COLUMN_NAME);
        structured.push({
          tableName,
          columns: columnNames
        });

        raw.push(`Table: ${tableName}`);
        columnsResult.recordset.forEach((col: any) => {
          raw.push(`  ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
        });
      }

      await pool.close();
      return { structured, raw };
    } catch (error) {
      if (pool) {
        await pool.close();
      }
      throw new Error(`Failed to get SQL Server schema: ${error}`);
    }
  }

  async executeQuery(connection: AIConnection, query: string): Promise<any[][]> {
    let pool;
    try {
      pool = await sql.connect(connection.connectionString);
      const result = await pool.request().query(query);
      await pool.close();
      
      if (!result.recordset || result.recordset.length === 0) {
        return [];
      }

      // Convert to array format for table display
      const headers = Object.keys(result.recordset[0]);
      const data = [headers];
      
      result.recordset.forEach((row: any) => {
        data.push(headers.map(header => String(row[header] || '')));
      });

      return data;
    } catch (error) {
      if (pool) {
        await pool.close();
      }
      throw new Error(`Query execution failed: ${error}`);
    }
  }
}