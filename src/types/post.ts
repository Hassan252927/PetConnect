import { Post } from '../store/postSlice';

// Extended Post interface for our application needs
export interface ExtendedPost extends Post {
  content: string;
  author: {
    username: string;
  };
  petDetails?: {
    name: string;
    animal: string;
    breed: string;
  };
}

// Type assertion function to help with type conversions
export const asPost = (post: ExtendedPost): Post => post as unknown as Post;
export const asExtendedPost = (post: Post): ExtendedPost => post as unknown as ExtendedPost; 