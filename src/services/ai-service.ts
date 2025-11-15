import { openai } from '@ai-sdk/openai';
import { generateText, CoreMessage } from 'ai';
import { AIQuery, DatabaseSchema, AIServiceConfig, ChatMessage } from '@/types/models';

export class AIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  async getAISQLQuery(
    aiModel: string,
    aiService: string,
    userPrompt: string,
    dbSchema: DatabaseSchema,
    databaseType: string
  ): Promise<AIQuery> {
    // Check if API key is configured
    if (!this.config.openai?.apiKey) {
      throw new Error('OpenAI API key is not configured. Please add your API key to the .env.local file.');
    }

    const maxRows = this.config.maxRows || 100;
    
    const systemPrompt = `Your are a helpful, cheerful database assistant. Do not respond with any information unrelated to databases or queries. Use the following database schema when creating your answers:

${dbSchema.schemaRaw.join('\n')}

Include column name headers in the query results.
Always provide your answer in the JSON format below:
{ "summary": "your-summary", "query": "your-query" }
Output ONLY JSON formatted on a single line. Do not use new line characters.
In the preceding JSON response, substitute "your-query" with the database query used to retrieve the requested data.
In the preceding JSON response, substitute "your-summary" with an explanation of each step you took to create this query in a detailed paragraph.
Only use ${databaseType} syntax for database queries.
Always limit the SQL Query to ${maxRows} rows.
Always include all of the table columns and details.`;

    const messages: CoreMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    let response;
    
    if (aiService === 'OpenAI' && this.config.openai) {
      try {
        response = await generateText({
          model: openai(aiModel),
          messages,
          temperature: 0.1,
        });
      } catch (error: any) {
        if (error.statusCode === 401) {
          throw new Error('Invalid OpenAI API key. Please check your API key configuration.');
        }
        throw new Error(`AI service error: ${error.message}`);
      }
    } else {
      throw new Error(`AI service ${aiService} not configured or not supported`);
    }

    try {
      // Clean the response by removing markdown code blocks and newlines
      const cleanedResponse = response.text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/\n/g, ' ')
        .trim();
      
      return JSON.parse(cleanedResponse);
    } catch (error) {
      throw new Error(`Failed to parse AI response as a SQL Query. The AI response was: ${response.text}`);
    }
  }

  async chatPrompt(
    messages: ChatMessage[],
    aiModel: string,
    aiService: string
  ): Promise<string> {
    // Check if API key is configured
    if (!this.config.openai?.apiKey) {
      throw new Error('OpenAI API key is not configured. Please add your API key to the .env.local file.');
    }

    const coreMessages: CoreMessage[] = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    let response;
    
    if (aiService === 'OpenAI' && this.config.openai) {
      try {
        response = await generateText({
          model: openai(aiModel),
          messages: coreMessages,
          temperature: 0.7,
        });
      } catch (error: any) {
        if (error.statusCode === 401) {
          throw new Error('Invalid OpenAI API key. Please check your API key configuration.');
        }
        throw new Error(`AI service error: ${error.message}`);
      }
    } else {
      throw new Error(`AI service ${aiService} not configured or not supported`);
    }

    return response.text;
  }
}