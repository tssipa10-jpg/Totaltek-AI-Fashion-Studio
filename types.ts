
export enum AppTab {
  OUTFIT_STUDIO = 'Outfit Studio',
  IMAGE_GENERATOR = 'Image Generator',
  IMAGE_EDITOR = 'Image Editor',
  STYLE_TRANSFER = 'Style Transfer',
  VIDEO_GENERATOR = 'Video Generator',
  GALLERY = 'My Gallery',
}

export interface ImageFile {
  base64: string;
  mimeType: string;
  name: string;
}

export interface GalleryImage extends ImageFile {
  id: string;
  prompt: string;
  timestamp: number;
}

export type AspectRatio = '16:9' | '9:16';