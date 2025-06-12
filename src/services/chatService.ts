import apiClient from './apiClient';

// Types
export interface Message {
  _id: string;
  chatID: string;
  sender: string;
  senderName: string;
  senderProfilePic: string;
  content: string;
  media?: string; // URL to media file (optional)
  timestamp: string;
  isRead: boolean;
}

export interface Chat {
  _id: string;
  users: {
    userID: string;
    username: string;
    profilePic: string;
  }[];
  lastMessage: Message | null;
  messages: Message[];
  unreadCount: number;
}

// Generate a mock avatar URL
const getAvatarUrl = (userId: string) => {
  return `https://ui-avatars.com/api/?name=${userId}&background=random&size=50`;
};

// Mock user data
const mockUsers = [
  { userID: 'user1', username: 'john_doe', profilePic: getAvatarUrl('john_doe') },
  { userID: 'user2', username: 'jane_smith', profilePic: getAvatarUrl('jane_smith') },
  { userID: 'user3', username: 'mike_johnson', profilePic: getAvatarUrl('mike_johnson') },
  { userID: 'user4', username: 'emily_wilson', profilePic: getAvatarUrl('emily_wilson') },
];

// Mock chat data
const mockChats: Chat[] = [
  {
    _id: 'chat1',
    users: [mockUsers[0], mockUsers[1]],
    lastMessage: {
      _id: 'message1',
      chatID: 'chat1',
      sender: 'user2',
      senderName: 'jane_smith',
      senderProfilePic: mockUsers[1].profilePic,
      content: 'Hey, cute dog!',
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      isRead: false,
    },
    messages: [],
    unreadCount: 1,
  },
  {
    _id: 'chat2',
    users: [mockUsers[0], mockUsers[2]],
    lastMessage: {
      _id: 'message2',
      chatID: 'chat2',
      sender: 'user1',
      senderName: 'john_doe',
      senderProfilePic: mockUsers[0].profilePic,
      content: 'Can you recommend a good vet?',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      isRead: true,
    },
    messages: [],
    unreadCount: 0,
  },
  {
    _id: 'chat3',
    users: [mockUsers[0], mockUsers[3]],
    lastMessage: {
      _id: 'message3',
      chatID: 'chat3',
      sender: 'user4',
      senderName: 'emily_wilson',
      senderProfilePic: mockUsers[3].profilePic,
      content: 'Your cat is adorable! What breed is it?',
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      isRead: true,
    },
    messages: [],
    unreadCount: 0,
  },
];

// Mock messages for each chat
const mockMessages: { [key: string]: Message[] } = {
  chat1: [
    {
      _id: 'message1_1',
      chatID: 'chat1',
      sender: 'user1',
      senderName: 'john_doe',
      senderProfilePic: mockUsers[0].profilePic,
      content: 'Hi Jane! Check out my new puppy!',
      media: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      isRead: true,
    },
    {
      _id: 'message1_2',
      chatID: 'chat1',
      sender: 'user2',
      senderName: 'jane_smith',
      senderProfilePic: mockUsers[1].profilePic,
      content: 'Hey, cute dog!',
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      isRead: false,
    },
    {
      _id: 'message1_3',
      chatID: 'chat1',
      sender: 'user2',
      senderName: 'jane_smith',
      senderProfilePic: mockUsers[1].profilePic,
      content: 'Here\'s my cat!',
      media: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      timestamp: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
      isRead: false,
    },
  ],
  chat2: [
    {
      _id: 'message2_1',
      chatID: 'chat2',
      sender: 'user3',
      senderName: 'mike_johnson',
      senderProfilePic: mockUsers[2].profilePic,
      content: 'Hello John, how are your pets doing?',
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      isRead: true,
    },
    {
      _id: 'message2_2',
      chatID: 'chat2',
      sender: 'user1',
      senderName: 'john_doe',
      senderProfilePic: mockUsers[0].profilePic,
      content: 'They\'re great! But I need to find a new vet.',
      timestamp: new Date(Date.now() - 129600000).toISOString(), // 1.5 days ago
      isRead: true,
    },
    {
      _id: 'message2_3',
      chatID: 'chat2',
      sender: 'user1',
      senderName: 'john_doe',
      senderProfilePic: mockUsers[0].profilePic,
      content: 'Can you recommend a good vet?',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      isRead: true,
    },
    {
      _id: 'message2_4',
      chatID: 'chat2',
      sender: 'user3',
      senderName: 'mike_johnson',
      senderProfilePic: mockUsers[2].profilePic,
      content: 'I take my pets to Dr. Smith at PetCare Clinic. Here\'s their website.',
      media: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      isRead: true,
    },
  ],
  chat3: [
    {
      _id: 'message3_1',
      chatID: 'chat3',
      sender: 'user4',
      senderName: 'emily_wilson',
      senderProfilePic: mockUsers[3].profilePic,
      content: 'Your cat is adorable! What breed is it?',
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      isRead: true,
    },
    {
      _id: 'message3_2',
      chatID: 'chat3',
      sender: 'user1',
      senderName: 'john_doe',
      senderProfilePic: mockUsers[0].profilePic,
      content: 'It\'s a Maine Coon! Here are some more pictures.',
      media: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      isRead: true,
    },
  ],
};

/**
 * Get all chats for a user
 */
export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    // Try real API first
    return await apiClient.get(`/chats/user/${userId}`);
  } catch (error) {
    console.log('Using mock chat data');
    // Return mock data for development
    return mockChats.map(chat => ({
      ...chat,
      users: chat.users.map(user => ({
        ...user,
        userID: user.userID === 'user1' ? userId : user.userID,
        username: user.userID === 'user1' ? 'You' : user.username,
      })),
    }));
  }
};

/**
 * Get messages for a specific chat
 */
export const getChatMessages = async (chatId: string): Promise<Message[]> => {
  try {
    // Try real API first
    return await apiClient.get(`/chats/${chatId}/messages`);
  } catch (error) {
    console.log('Using mock message data');
    // Return mock data for development
    return mockMessages[chatId] || [];
  }
};

/**
 * Send a new message
 */
export const sendNewMessage = async (message: Omit<Message, '_id' | 'timestamp' | 'isRead'>): Promise<Message> => {
  try {
    // Try real API first
    return await apiClient.post(`/chats/${message.chatID}/messages`, message);
  } catch (error) {
    console.log('Using mock message sending');
    // Create a mock message response
    const newMessage: Message = {
      _id: `message_${Date.now()}`,
      ...message,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    
    // Add to mock data (in a real scenario, this would be handled by the server)
    if (mockMessages[message.chatID]) {
      mockMessages[message.chatID].push(newMessage);
    } else {
      mockMessages[message.chatID] = [newMessage];
    }
    
    // Update the last message in the chat
    const chat = mockChats.find(c => c._id === message.chatID);
    if (chat) {
      chat.lastMessage = newMessage;
    }
    
    // Return the new message after a small delay to simulate network latency
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(newMessage);
      }, 300);
    });
  }
};

/**
 * Mark messages as read
 */
export const markAsRead = async (chatId: string, userId: string): Promise<void> => {
  try {
    // Try real API first
    return await apiClient.put(`/chats/${chatId}/read`, { userId });
  } catch (error) {
    console.log('Using mock read status update');
    // Update mock data
    const chat = mockChats.find(c => c._id === chatId);
    if (chat) {
      chat.unreadCount = 0;
      
      // Mark all messages as read
      if (mockMessages[chatId]) {
        mockMessages[chatId] = mockMessages[chatId].map(msg => ({
          ...msg,
          isRead: true,
        }));
      }
    }
  }
};

export default {
  getUserChats,
  getChatMessages,
  sendNewMessage,
  markAsRead,
}; 