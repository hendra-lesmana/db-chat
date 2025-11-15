import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/services/ai-service';
import { AIQuery, DatabaseSchema } from '@/types/models';

const aiService = new AIService({
  openai: {
    apiKey: process.env.OPENAI_API_KEY || ''
  },
  maxRows: parseInt(process.env.MAX_ROWS || '100')
});

export async function POST(request: NextRequest) {
  try {
    const { aiModel, aiService: service, userPrompt, dbSchema, databaseType } = await request.json();
    
    if (!aiModel || !service || !userPrompt || !dbSchema || !databaseType) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Check if AI service is properly configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API key is not configured. Please add your API key to the .env.local file.' 
      }, { status: 400 });
    }

    const result = await aiService.getAISQLQuery(aiModel, service, userPrompt, dbSchema, databaseType);
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI service error' },
      { status: 500 }
    );
  }
}