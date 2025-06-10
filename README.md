# PetConnect - Pet Care Social Network

PetConnect is a social network application focused on pets and animal care, featuring an AI assistant that can answer questions about pet care, breeds, training, and more.

## Features

- AI-powered pet care assistant that answers animal-related questions
- Integrated with OpenAI API for intelligent responses
- Floating chat button accessible from anywhere in the app
- Social networking features for pet owners
- Pet profiles, posts, and messaging

## Installation

1. Clone the repository
2. Install dependencies

```bash
cd pet-connect
npm install
```

3. Set up environment variables by creating a `.env` file in the root of the pet-connect directory:

```
# API Keys
REACT_APP_OPENAI_API_KEY=your-openai-api-key-here

# API Configuration
REACT_APP_OPENAI_MODEL=gpt-3.5-turbo
REACT_APP_MAX_TOKENS=500
REACT_APP_TEMPERATURE=0.7

# Feature Flags
REACT_APP_ENABLE_AI_FEATURES=true
```

Replace `your-openai-api-key-here` with your actual OpenAI API key.

4. Start the development server

```bash
npm start
```

## Environment Setup

You can use the included setup script to create your `.env` file:

```bash
npm run setup-env
```

This will guide you through setting up your environment variables and OpenAI API key.

## AI Features

The PetConnect AI assistant is designed to answer only animal and pet-related questions. It uses:

1. OpenAI API integration for intelligent, contextual responses
2. Fallback to simulated responses if no API key is provided
3. Conversation memory that persists between sessions
4. Context-aware responses that build upon previous messages

## Project Structure

- `/src/components` - React components organized by feature
- `/src/hooks` - Custom React hooks
- `/src/pages` - Page components
- `/src/services` - API and service functions
- `/src/store` - Redux store configuration
- `/src/types` - TypeScript type definitions

## Technologies Used

- React
- TypeScript
- Redux Toolkit
- OpenAI API
- React Router
- Tailwind CSS 