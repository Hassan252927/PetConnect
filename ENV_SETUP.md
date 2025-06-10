# PetConnect Environment Setup

## Environment Variables
Copy the following lines to your `.env` file in the root of the pet-connect directory:

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

## Using the Environment Variables

The AI service is already configured to use these environment variables. When you start the application, it will automatically use your OpenAI API key for the pet assistant if available.

If no API key is provided, the system will fall back to using a simulated AI response.

## Starting the Application

After setting up your environment variables, start the application with:

```bash
npm start
``` 