import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../../store/postSlice';
import { ExtendedPost } from '../../types/post';

interface ExploreGridProps {
  posts: (Post | ExtendedPost)[];
  isLoading?: boolean;
}

const ExploreGrid: React.FC<ExploreGridProps> = ({ posts, isLoading }) => {
  const navigate = useNavigate();
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);

  const handlePostClick = (postId: string) => {
    navigate(`/posts/${postId}`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 md:gap-2">
        {Array.from({ length: 20 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse rounded-sm"
          />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-8xl mb-6 opacity-50">📸</div>
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">
          No posts found
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md">
          Try adjusting your search or filters to discover amazing pet moments
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 md:gap-2">
      {posts.map((post, index) => (
        <div
          key={post._id}
          className="relative aspect-square cursor-pointer group overflow-hidden rounded-sm bg-gray-100 dark:bg-gray-800"
          onMouseEnter={() => setHoveredPost(post._id)}
          onMouseLeave={() => setHoveredPost(null)}
          onClick={() => handlePostClick(post._id)}
        >
          {/* Post Image */}
          <img
            src={post.media || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={post.caption || 'Pet post'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />

          {/* Hover Overlay */}
          <div
            className={`
              absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center
              transition-opacity duration-300
              ${hoveredPost === post._id ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <div className="flex items-center space-x-6 text-white">
              {/* Likes */}
              <div className="flex items-center space-x-2">
                <svg
                  className="w-6 h-6 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="font-semibold">{post.likes?.length || 0}</span>
              </div>

              {/* Comments */}
              <div className="flex items-center space-x-2">
                <svg
                  className="w-6 h-6 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M21,6H3A1,1 0 0,0 2,7V17A1,1 0 0,0 3,18H9.5L12,20.5L14.5,18H21A1,1 0 0,0 22,17V7A1,1 0 0,0 21,6M20,16H14L12,18L10,16H4V8H20V16Z" />
                </svg>
                <span className="font-semibold">{post.comments?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Post Type Indicator */}
          {post.media && (
            <div className="absolute top-2 right-2">
              {post.media.includes('video') ? (
                <div className="bg-black bg-opacity-60 rounded-full p-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              ) : (
                <div className="bg-black bg-opacity-60 rounded-full p-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* Multiple Photos Indicator */}
          {Array.isArray(post.media) && post.media.length > 1 && (
            <div className="absolute top-2 right-2">
              <div className="bg-black bg-opacity-60 rounded-full p-1">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11.5-6L8 13.5l2.5 3.01L14.5 12 18 16H8l2.5-3.5zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ExploreGrid; 