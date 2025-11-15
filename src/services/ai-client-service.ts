import { AIQuery, DatabaseSchema, ChatMessage } from '@/types/models';

export class AIClientService {
  async getAISQLQuery(
    aiModel: string,
    aiService: string,
    userPrompt: string,
    dbSchema: DatabaseSchema,
    databaseType: string
  ): Promise<AIQuery> {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aiModel,
        aiService,
        userPrompt,
        dbSchema,
        databaseType
      })
    });

    if (!response.ok) {
      throw new Error('AI query generation failed');
    }

    return await response.json();
  }

  async chatPrompt(messages: ChatMessage[], aiModel: string, aiService: string): Promise<string> {
    // Simple client-side implementation for chat
    // This would ideally be moved to an API route in production
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) {
      throw new Error('No messages provided');
    }

    // For demo purposes, return a simple response
    // In production, this should call an API endpoint
    return "I understand you're asking about the data. However, the chat functionality is currently limited. Please use the main query interface for detailed analysis.";
  }
}