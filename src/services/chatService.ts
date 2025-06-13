import apiClient from './apiClient';

// Types
export interface Message {
  _id: string;
  senderID: string;
  receiverID: string;
  content: string;
  media?: string;
  timestamp: string;
  isRead: boolean;
  isDeleted: boolean;
}

export interface Chat {
  _id: string;
  participants: {
    _id: string;
    username: string;
    profilePic: string;
  }[];
  messages: Message[];
  lastMessage: Message;
  unreadCount: number;
}

/**
 * Get all chats for a user
 */
export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const response = await apiClient.get(`/messages/${userId}`);
    return response;
  } catch (error) {
    console.error('Error fetching user chats:', error);
    throw error;
  }
};

/**
 * Get messages for a specific chat thread
 */
export const getChatMessages = async (user1Id: string, user2Id: string): Promise<Message[]> => {
  try {
    const response = await apiClient.get(`/messages/thread/${user1Id}/${user2Id}`);
    return response.messages;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
};

/**
 * Send a new message
 */
export const sendNewMessage = async (message: {
  senderID: string;
  receiverID: string;
  content: string;
  media?: string;
}): Promise<Message> => {
  try {
    const response = await apiClient.post('/messages/send', message);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Mark messages as read
 */
export const markAsRead = async (senderID: string, receiverID: string): Promise<void> => {
  try {
    await apiClient.patch('/messages/mark-read', { senderID });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

/**
 * Get unread message count
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const response = await apiClient.get('/messages/unread/count');
    return response.unreadCount;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

export default {
  getUserChats,
  getChatMessages,
  sendNewMessage,
  markAsRead,
  getUnreadCount,
}; 