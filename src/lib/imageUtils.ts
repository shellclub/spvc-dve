/**
 * Client-side image compression utility.
 * Uses Canvas API to resize and reduce quality until file ≤ maxSizeMB.
 */

export async function compressImage(file: File, maxSizeMB: number = 1): Promise<File> {
  // If already small enough, return as-is
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Cannot get canvas context"));
          return;
        }

        // Calculate scaled dimensions
        let { width, height } = img;
        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Try decreasing quality until file fits
        const targetBytes = maxSizeMB * 1024 * 1024;
        const mimeType = file.type === "image/png" ? "image/jpeg" : file.type; // convert PNG to JPEG for better compression

        let quality = 0.85;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Compression failed"));
                return;
              }
              if (blob.size <= targetBytes || quality <= 0.1) {
                const compressedFile = new File([blob], file.name.replace(/\.png$/i, ".jpg"), {
                  type: mimeType,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                quality -= 0.1;
                tryCompress();
              }
            },
            mimeType,
            quality
          );
        };
        tryCompress();
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
