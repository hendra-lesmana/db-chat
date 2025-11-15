import { NextRequest, NextResponse } from 'next/server';
import { DatabaseManagerService } from '@/services/database-manager-service';
import { AIConnection } from '@/types/models';

const databaseService = new DatabaseManagerService();

export async function POST(request: NextRequest) {
  try {
    const { connection, action, query } = await request.json();
    
    if (!connection) {
      return NextResponse.json({ error: 'Connection is required' }, { status: 400 });
    }

    switch (action) {
      case 'test':
        const testResult = await databaseService.testConnection(connection);
        return NextResponse.json({ success: testResult });
        
      case 'schema':
        const schema = await databaseService.generateSchema(connection);
        return NextResponse.json(schema);
        
      case 'query':
        if (!query) {
          return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }
        const result = await databaseService.getDataTable(connection, query);
        return NextResponse.json({ data: result });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Database API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Database operation failed' },
      { status: 500 }
    );
  }
}