export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
}

export const uploadImage = async (file: File): Promise<CloudinaryUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'ml_unsigned');

  try {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName) {
      throw new Error('Cloudinary cloud name not configured in .env file');
    }

    if (!uploadPreset) {
      throw new Error('Cloudinary upload preset not configured in .env file');
    }

    console.log('Uploading to Cloudinary with cloud name:', cloudName);
    console.log('Using upload preset:', uploadPreset);
    console.log('File size:', file.size, 'bytes');
    console.log('File type:', file.type);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('Cloudinary upload error:', result);
      console.error('Response status:', response.status);
      console.error('Response status text:', response.statusText);
      
      if (result.error) {
        if (result.error.message.includes('preset')) {
          throw new Error(`Upload preset '${uploadPreset}' not found or not configured for unsigned uploads. Please check your Cloudinary settings.`);
        }
        throw new Error(result.error.message);
      }
      
      throw new Error(`Upload failed with status ${response.status}: ${response.statusText}`);
    }

    console.log('Upload successful:', result);
    return result;
  } catch (error) {
    console.error('Error uploading image:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during upload');
  }
};

export const generateOptimizedImageUrl = (imageUrl: string, width: number = 200, height: number = 300) => {
  if (!imageUrl) return '';
  
  // If it's already a Cloudinary URL, add transformations
  if (imageUrl.includes('cloudinary.com')) {
    const parts = imageUrl.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/w_${width},h_${height},c_fill,q_auto,f_auto/${parts[1]}`;
    }
  }
  
  // Return original URL if not Cloudinary
  return imageUrl;
};
