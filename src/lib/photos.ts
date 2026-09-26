import photoData from '@/data/photos.json';

// Freely licensed photos (Wikimedia Commons). Every use must show the credit line.
export type Photo = { src: string; alt: string; author: string; license: string; url: string };

const PHOTOS = photoData.items as Record<string, Photo>;

export function getPhoto(id: string): Photo | undefined {
  return PHOTOS[id];
}

// 720px copy for cards and rows.
export function thumbSrc(photo: Photo): string {
  return photo.src.replace('/photos/', '/photos/sm/');
}
