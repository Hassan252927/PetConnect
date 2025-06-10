import apiClient from './apiClient';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  message: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Get environment variables
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_MODEL = process.env.REACT_APP_OPENAI_MODEL || 'gpt-3.5-turbo';
const MAX_TOKENS = parseInt(process.env.REACT_APP_MAX_TOKENS || '500', 10);
const TEMPERATURE = parseFloat(process.env.REACT_APP_TEMPERATURE || '0.7');
const ENABLE_AI_FEATURES = process.env.REACT_APP_ENABLE_AI_FEATURES === 'true';

/**
 * Send a message to the OpenAI API
 * @param message - The user's message
 * @param history - The conversation history
 * @returns A promise that resolves to the AI's response
 */
export const getOpenAIResponse = async (
  message: string,
  history: ChatMessage[] = []
): Promise<string> => {
  // If AI features are disabled or no API key is available, use the mock service
  if (!ENABLE_AI_FEATURES || !OPENAI_API_KEY) {
    return simulateAIResponse(message);
  }

  try {
    // Prepare the messages array for OpenAI API
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful pet care assistant that only answers questions about animals and pets. If asked about other topics, politely decline and steer the conversation back to pet-related topics. Be friendly, informative, and concise.',
      },
      ...history,
      { role: 'user', content: message },
    ];

    // Make the API request to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting AI response:', error);
    // Fallback to the mock service if there's an error
    return simulateAIResponse(message);
  }
};

/**
 * Send a message to the AI assistant
 * @param message - The user's message
 * @param history - The conversation history
 * @returns A promise that resolves to the AI's response
 */
export const getPetAssistantResponse = async (
  message: string,
  history: ChatMessage[] = []
): Promise<string> => {
  // Try to use OpenAI first
  if (ENABLE_AI_FEATURES && OPENAI_API_KEY) {
    try {
      return await getOpenAIResponse(message, history);
    } catch (error) {
      console.error('Error with OpenAI, falling back to API client:', error);
    }
  }

  // Fallback to the backend API
  try {
    const response = await apiClient.post<ChatResponse>('/ai/chat', {
      message,
      history,
    });

    return response.message;
  } catch (error) {
    console.error('Error getting AI response from backend:', error);
    // Last resort: use the mock service
    return simulateAIResponse(message);
  }
};

/**
 * Interface for pet recommendation preferences
 */
export interface PetRecommendationPreferences {
  lifestyle: string;
  experience: string;
  homeType: string;
  allergies: boolean;
}

/**
 * Get pet recommendations based on user preferences
 * @param preferences - The user's preferences
 * @returns A promise that resolves to the AI's recommendations
 */
export const getPetRecommendations = async (
  preferences: PetRecommendationPreferences
): Promise<string> => {
  try {
    const response = await apiClient.post<{ recommendations: string }>('/ai/recommendations', {
      preferences,
    });

    return response.recommendations;
  } catch (error) {
    console.error('Error getting pet recommendations:', error);
    throw new Error('Failed to get pet recommendations');
  }
};

/**
 * Get breed information from the AI
 * @param breed - The breed to get information about
 * @param animal - The type of animal (dog, cat, etc.)
 * @returns A promise that resolves to the AI's information about the breed
 */
export const getBreedInfo = async (breed: string, animal: string): Promise<string> => {
  try {
    const response = await apiClient.get<{ information: string }>('/ai/breed-info', {
      params: {
        breed,
        animal,
      },
    });

    return response.information;
  } catch (error) {
    console.error('Error getting breed information:', error);
    throw new Error('Failed to get breed information');
  }
};

/**
 * Get pet care tips from the AI
 * @param animal - The type of animal (dog, cat, etc.)
 * @param age - The age of the pet (puppy, adult, senior, etc.)
 * @param specificQuery - A specific query about pet care
 * @returns A promise that resolves to the AI's pet care tips
 */
export const getPetCareTips = async (
  animal: string,
  age?: string,
  specificQuery?: string
): Promise<string> => {
  try {
    const response = await apiClient.get<{ tips: string }>('/ai/pet-care', {
      params: {
        animal,
        age,
        query: specificQuery,
      },
    });

    return response.tips;
  } catch (error) {
    console.error('Error getting pet care tips:', error);
    throw new Error('Failed to get pet care tips');
  }
};

/**
 * Checks if a message is related to animals/pets
 * @param message - The user's message
 * @returns boolean indicating if the message is about animals
 */
const isAnimalRelatedQuery = (message: string): boolean => {
  const message_lower = message.toLowerCase();
  
  // List of animal/pet related keywords
  const animalKeywords = [
    'animal', 'pet', 'dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'guinea pig', 
    'reptile', 'lizard', 'snake', 'turtle', 'frog', 'amphibian', 'mammal', 
    'puppy', 'kitten', 'breed', 'species', 'veterinarian', 'vet', 'adoption',
    'food', 'feed', 'diet', 'nutrition', 'train', 'training', 'walk', 'groom', 'grooming',
    'care', 'health', 'vaccine', 'vaccination', 'illness', 'disease', 'treatment',
    'behavior', 'toy', 'play', 'exercise', 'shelter', 'rescue', 'kennel', 'cage', 'leash',
    'collar', 'fur', 'feather', 'scale', 'habitat', 'crate', 'litter', 'aquarium', 'tank'
  ];
  
  // Check if any animal keyword is in the message
  return animalKeywords.some(keyword => message_lower.includes(keyword));
};

// For development/testing when backend is not available
export const simulateAIResponse = (message: string): Promise<string> => {
  return new Promise((resolve) => {
    // Check if the message is about animals
    if (!isAnimalRelatedQuery(message)) {
      resolve("I'm sorry, but I can only answer questions about animals and pet care. If you have any questions about pets, breeds, training, care, or adoption, I'd be happy to help!");
      return;
    }
    
    // List of simulated responses for testing
    const responses = [
      "I'd recommend a Labrador Retriever for an active family. They're friendly, good with kids, and love outdoor activities.",
      "Cats are relatively low-maintenance pets. They're independent but still affectionate, perfect for busy individuals.",
      "For apartment living, consider smaller breeds like a Bichon Frise or a cat. They adapt well to smaller spaces.",
      "To keep your pet healthy, regular vet check-ups, proper diet, and daily exercise are essential.",
      "When training a new puppy, consistency is key. Use positive reinforcement and establish a routine.",
      "Goldfish can be great starter pets for children. They teach responsibility without requiring too much care.",
      "Birds like parakeets are social creatures that need daily interaction. They're intelligent and can learn tricks.",
      "If you have allergies, hypoallergenic breeds like Poodles or Bichon Frises might be good options.",
      "Rabbits make wonderful indoor pets. They're quiet, can be litter-trained, and have distinct personalities.",
      "Senior pets often make wonderful companions. They're usually calmer and already trained.",
    ];

    // Simulate network delay
    setTimeout(() => {
      // Pick a response based on the query
      let response = '';
      if (message.toLowerCase().includes('dog')) {
        response = "Dogs make wonderful companions! They're loyal, affectionate, and come in various breeds to match different lifestyles.";
      } else if (message.toLowerCase().includes('cat')) {
        response = "Cats are independent yet loving pets. They're perfect for people who want companionship without needing constant attention.";
      } else if (message.toLowerCase().includes('fish')) {
        response = "Fish can be fascinating pets! Watching an aquarium can be relaxing, and many species are relatively low-maintenance.";
      } else if (message.toLowerCase().includes('bird')) {
        response = "Birds are intelligent and social creatures. Many species can learn to talk or whistle tunes!";
      } else if (message.toLowerCase().includes('rabbit')) {
        response = "Rabbits are wonderful pets! They're quiet, can be litter-trained, and each has a unique personality. They need daily exercise outside their cage and a diet rich in hay.";
      } else if (message.toLowerCase().includes('reptile') || message.toLowerCase().includes('snake') || message.toLowerCase().includes('lizard')) {
        response = "Reptiles can be fascinating pets! They generally require specific temperature and humidity conditions. Bearded dragons and leopard geckos are good beginner reptiles.";
      } else if (message.toLowerCase().includes('hamster') || message.toLowerCase().includes('guinea pig')) {
        response = "Small rodents like hamsters and guinea pigs make great first pets! They're relatively low-maintenance but still interactive and each has its own personality.";
      } else {
        // Random response if no specific animal is mentioned
        response = responses[Math.floor(Math.random() * responses.length)];
      }
      
      resolve(response);
    }, 1000);
  });
};

// Create a named export object
const aiService = {
  getPetAssistantResponse,
  getOpenAIResponse,
  getPetRecommendations,
  getBreedInfo,
  getPetCareTips,
  simulateAIResponse,
  isAnimalRelatedQuery,
};

export default aiService; 