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
    // In a real app, you would use FormData to upload the file
    // const formData = new FormData();
    // formData.append('file', file);
    // formData.append('type', type);
    // const response = await apiClient.post<{ url: string }>('/upload', formData);
    // return response.url;

    // For now, let's simulate an upload with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return a placeholder image URL
        resolve(`https://via.placeholder.com/500?text=${file.name}`);
      }, 1500);
    });
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
    // In a real app, you would make a DELETE request to the server
    // await apiClient.delete(`/upload?url=${encodeURIComponent(url)}`);

    // For now, let's simulate deletion with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Deleted image at ${url}`);
        resolve();
      }, 500);
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
};

/**
 * Simulates an image upload when working without a backend
 * @param file - The image file to "upload"
 * @returns A Promise that resolves to a data URL representing the image
 */
export const simulateImageUpload = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      // Simulate a delay to mimic a network request
      setTimeout(() => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error('Failed to read image file'));
        }
      }, 1000);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };
    
    reader.readAsDataURL(file);
  });
};

// Create a named export object
const uploadService = {
  uploadImage,
  deleteImage,
  simulateImageUpload,
};

export default uploadService; 