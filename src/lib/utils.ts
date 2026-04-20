import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Compresses a base64 image string to reduce its size.
 * Resizes to max 1200px and uses JPEG quality 0.7.
 */
export async function compressImage(base64: string, maxWidth = 1200, quality = 0.7): Promise<string> {
  // If not a data URL or small enough, return as is (optional safeguard)
  if (!base64.startsWith('data:image')) return base64;
  if (base64.length < 100000) return base64; // Skip if already smallish (~75KB)

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      // Convert to JPEG with compression
      const result = canvas.toDataURL('image/jpeg', quality);
      resolve(result);
    };
    img.onerror = (err) => {
      console.error("Image compression failed:", err);
      resolve(base64);
    };
  });
}
