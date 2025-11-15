import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { generateObject, generateText, CoreMessage } from 'ai';
import { Ollama } from 'ollama';
import { AIQuery, DatabaseSchema, AIServiceConfig, ChatMessage } from '@/types/models';
import { createOpenAI } from '@ai-sdk/openai';

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

    if (aiService === 'Ollama' && this.config.ollama?.endpoint) {
      try {
        const ollama = new Ollama({ host: this.config.ollama.endpoint });

        const response = await ollama.chat({
          model: aiModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          options: {
            temperature: 0.1,
          }
        });

        // Clean the response by removing markdown code blocks and newlines
        const cleanedResponse = response.message.content
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .replace(/\n/g, ' ')
          .trim();

        return JSON.parse(cleanedResponse);
      } catch (error: any) {
        throw new Error(`Ollama service error: ${error.message}`);
      }
    } else {
      const messages: CoreMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      let response;

      if (aiService === 'OpenAI' && this.config.openai?.apiKey) {
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
      } else if (aiService === 'Anthropic' && process.env.ANTHROPIC_API_KEY) {
        try {
          response = await generateText({
            model: anthropic(aiModel),
            messages,
            temperature: 0.1,
          });
        } catch (error: any) {
          if (error.statusCode === 401) {
            throw new Error('Invalid Anthropic API key. Please check your API key configuration.');
          }
          throw new Error(`AI service error: ${error.message}`);
        }
      } else if (aiService === 'Google' && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        try {
          response = await generateText({
            model: google(aiModel),
            messages,
            temperature: 0.1,
          });
        } catch (error: any) {
          if (error.statusCode === 401) {
            throw new Error('Invalid Google API key. Please check your API key configuration.');
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
  }

  async chatPrompt(
    messages: ChatMessage[],
    aiModel: string,
    aiService: string
  ): Promise<string> {
    if (aiService === 'Ollama' && this.config.ollama?.endpoint) {
      try {
        const ollama = new Ollama({ host: this.config.ollama.endpoint });

        const ollamaMessages = messages.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content
        }));

        const response = await ollama.chat({
          model: aiModel,
          messages: ollamaMessages,
          options: {
            temperature: 0.7,
          }
        });

        return response.message.content;
      } catch (error: any) {
        throw new Error(`Ollama service error: ${error.message}`);
      }
    } else {
      const coreMessages: CoreMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      let response;

      if (aiService === 'OpenAI' && this.config.openai?.apiKey) {
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
      } else if (aiService === 'Anthropic' && process.env.ANTHROPIC_API_KEY) {
        try {
          response = await generateText({
            model: anthropic(aiModel),
            messages: coreMessages,
            temperature: 0.7,
          });
        } catch (error: any) {
          if (error.statusCode === 401) {
            throw new Error('Invalid Anthropic API key. Please check your API key configuration.');
          }
          throw new Error(`AI service error: ${error.message}`);
        }
      } else if (aiService === 'Google' && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        try {
          response = await generateText({
            model: google(aiModel),
            messages: coreMessages,
            temperature: 0.7,
          });
        } catch (error: any) {
          if (error.statusCode === 401) {
            throw new Error('Invalid Google API key. Please check your API key configuration.');
          }
          throw new Error(`AI service error: ${error.message}`);
        }
      } else {
        throw new Error(`AI service ${aiService} not configured or not supported`);
      }

      return response.text;
    }
  }
}