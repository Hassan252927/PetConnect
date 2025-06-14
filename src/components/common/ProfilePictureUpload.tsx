import React, { useState, useRef, ChangeEvent, useEffect } from 'react';

interface ProfilePictureUploadProps {
  onImageSelected: (file: File, previewUrl: string) => void;
  currentImage?: string;
  size?: 'small' | 'medium' | 'large';
  isUploading?: boolean;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ 
  onImageSelected, 
  currentImage,
  size = 'medium',
  isUploading = false
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview URL when currentImage prop changes
  useEffect(() => {
    if (currentImage && currentImage !== previewUrl) {
      setPreviewUrl(currentImage);
    }
  }, [currentImage, previewUrl]);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const selectedFile = e.target.files[0];
    const fileType = selectedFile.type;

    // Validate file is an image
    if (!fileType.match(/^image\/(jpeg|jpg|png|gif)$/)) {
      alert('Please select a valid image file (jpg, jpeg, png, gif).');
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('File size too large. Maximum size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      onImageSelected(selectedFile, result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleBrowseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        <div 
          className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600 cursor-pointer hover:border-primary transition-colors`}
          onClick={handleBrowseClick}
        >
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
            </div>
          )}
        </div>
        
        {/* Upload overlay */}
        <div 
          className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
          onClick={handleBrowseClick}
        >
          {isUploading ? (
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
          )}
        </div>
      </div>
      
      <button
        type="button"
        onClick={handleBrowseClick}
        disabled={isUploading}
        className="text-sm text-primary hover:text-primary/80 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? 'Uploading...' : 'Change Photo'}
      </button>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/jpeg, image/png, image/jpg, image/gif"
        className="hidden"
      />
    </div>
  );
};

export default ProfilePictureUpload; 