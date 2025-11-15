import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/services/ai-service';
import { AIQuery, DatabaseSchema } from '@/types/models';

export async function POST(request: NextRequest) {
  try {
    const { aiModel, aiService: service, userPrompt, dbSchema, databaseType } = await request.json();

    if (!aiModel || !service || !userPrompt || !dbSchema || !databaseType) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Build the AI service configuration based on the selected service and environment
    const config: any = {
      maxRows: parseInt(process.env.MAX_ROWS || '100')
    };

    if (service === 'OpenAI') {
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({
          error: 'OpenAI API key is not configured. Please add your API key to the .env.local file.'
        }, { status: 400 });
      }
      config.openai = { apiKey: process.env.OPENAI_API_KEY };
    } else if (service === 'Ollama') {
      if (!process.env.OLLAMA_ENDPOINT) {
        return NextResponse.json({
          error: 'Ollama endpoint is not configured. Please add OLLAMA_ENDPOINT to your .env.local file.'
        }, { status: 400 });
      }
      config.ollama = { endpoint: process.env.OLLAMA_ENDPOINT };
    } else if (service === 'Anthropic') {
      if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json({
          error: 'Anthropic API key is not configured. Please add ANTHROPIC_API_KEY to your .env.local file.'
        }, { status: 400 });
      }
    } else if (service === 'Google') {
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        return NextResponse.json({
          error: 'Google API key is not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to your .env.local file.'
        }, { status: 400 });
      }
    }

    const aiService = new AIService(config);
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