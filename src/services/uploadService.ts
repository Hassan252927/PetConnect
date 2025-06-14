import apiClient from './apiClient';

/**
 * Upload an image to the server
 * @param file The file to upload
 * @param type The type of upload (profile, pet, post)
 * @returns The URL of the uploaded image
 */
export const uploadImage = async (
  file: File,
  type: 'profile' | 'pet' | 'post'
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await apiClient.post<{ url: string }>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Delete an uploaded image
 * @param url The URL of the image to delete
 */
export const deleteImage = async (url: string): Promise<void> => {
  try {
    await apiClient.delete(`/upload?url=${encodeURIComponent(url)}`);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
};

// Create a named export object
const uploadService = {
  uploadImage,
  deleteImage,
};

export default uploadService; 