# DBChatPro Next.js

A Next.js application that allows you to chat with your databases using AI. Connect to multiple databases (MySQL, PostgreSQL, SQL Server) and generate SQL queries using natural language with the power of AI.

## Features

- 🔌 Connect to multiple databases (MySQL, PostgreSQL, SQL Server)
- 🤖 AI-powered SQL query generation using OpenAI
- 💬 Chat interface for analyzing query results
- 📊 Visual query results with data tables
- 🔖 Save and manage favorite queries
- 📜 Query history tracking
- 🔒 Local storage for connection strings and API keys
- 📱 Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **AI Integration**: OpenAI SDK, AI SDK
- **Database**: MySQL2, pg (PostgreSQL), mssql (SQL Server)
- **UI Components**: Lucide React, Radix UI
- **State Management**: React hooks and context
- **Storage**: Browser localStorage

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key
- Database connections (MySQL, PostgreSQL, or SQL Server)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd db-chat
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your OpenAI API key:
```
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### AI Providers

The application supports multiple AI providers:

#### OpenAI (Recommended)
- Set `NEXT_PUBLIC_OPENAI_API_KEY` in your `.env.local` file
- Use models like `gpt-3.5-turbo` or `gpt-4`

#### Azure OpenAI (Optional)
- Set `NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT` and optionally `NEXT_PUBLIC_AZURE_OPENAI_KEY`
- Configure your Azure OpenAI deployment

#### Ollama (Optional)
- Set `NEXT_PUBLIC_OLLAMA_ENDPOINT` (default: `http://localhost:11434`)
- Run Ollama locally with your preferred models

### Database Connections

The application supports three database types:

#### MySQL
Connection string format:
```
mysql://username:password@localhost:3306/database_name
```

#### PostgreSQL
Connection string format:
```
postgresql://username:password@localhost:5432/database_name
```

#### SQL Server
Connection string format:
```
Server=localhost;Database=database_name;User Id=username;Password=password;
```

## Usage

1. **Connect Database**: Go to "Connect Database" page and add your database connection
2. **Test Connection**: Click "Test Connection" to verify connectivity and load schema
3. **Save Connection**: Save the connection for future use
4. **Chat with Database**:
   - Select your database from the dropdown
   - Choose your AI model and service
   - Enter your question in natural language
   - Submit to generate and execute SQL queries
5. **Analyze Results**: Use the chat feature to get insights about your query results
6. **Save Favorites**: Save frequently used queries as favorites

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_OPENAI_API_KEY` | OpenAI API key | Yes (for OpenAI) |
| `NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint | No |
| `NEXT_PUBLIC_AZURE_OPENAI_KEY` | Azure OpenAI key | No |
| `NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY` | Google Generative AI API key | No |
| `NEXT_PUBLIC_OLLAMA_ENDPOINT` | Ollama endpoint URL | No |
| `NEXT_PUBLIC_MAX_ROWS` | Maximum rows per query (default: 100) | No |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Docker

Build and run with Docker:
```bash
docker build -t dbchatpro-nextjs .
docker run -p 3000:3000 --env-file .env.local dbchatpro-nextjs
```

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.