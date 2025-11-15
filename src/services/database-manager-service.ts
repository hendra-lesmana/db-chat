import { AIConnection } from '@/types/models';
import { MySqlDatabaseService } from './mysql-database-service';
import { PostgresDatabaseService } from './postgres-database-service';
import { SqlServerDatabaseService } from './sqlserver-database-service';

export class DatabaseManagerService {
  private mysqlService: MySqlDatabaseService;
  private postgresService: PostgresDatabaseService;
  private sqlServerService: SqlServerDatabaseService;

  constructor() {
    this.mysqlService = new MySqlDatabaseService();
    this.postgresService = new PostgresDatabaseService();
    this.sqlServerService = new SqlServerDatabaseService();
  }

  async testConnection(connection: AIConnection): Promise<boolean> {
    switch (connection.databaseType.toUpperCase()) {
      case 'MYSQL':
        return this.mysqlService.testConnection(connection);
      case 'POSTGRESQL':
        return this.postgresService.testConnection(connection);
      case 'MSSQL':
        return this.sqlServerService.testConnection(connection);
      default:
        throw new Error(`Unsupported database type: ${connection.databaseType}`);
    }
  }

  async generateSchema(connection: AIConnection): Promise<{ structured: any[], raw: string[] }> {
    switch (connection.databaseType.toUpperCase()) {
      case 'MYSQL':
        return this.mysqlService.getSchema(connection);
      case 'POSTGRESQL':
        return this.postgresService.getSchema(connection);
      case 'MSSQL':
        return this.sqlServerService.getSchema(connection);
      default:
        throw new Error(`Unsupported database type: ${connection.databaseType}`);
    }
  }

  async getDataTable(connection: AIConnection, query: string): Promise<any[][]> {
    switch (connection.databaseType.toUpperCase()) {
      case 'MYSQL':
        return this.mysqlService.executeQuery(connection, query);
      case 'POSTGRESQL':
        return this.postgresService.executeQuery(connection, query);
      case 'MSSQL':
        return this.sqlServerService.executeQuery(connection, query);
      default:
        throw new Error(`Unsupported database type: ${connection.databaseType}`);
    }
  }
}