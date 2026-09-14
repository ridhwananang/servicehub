/**
 * Compresses an image file using an off-screen HTML5 Canvas.
 * Resizes images exceeding max dimensions and converts to optimized JPEG.
 * Fulfills the "Foto Compress" requirement and optimizes Laravel Cloud Bucket storage.
 */
export async function compressImage(
    file: File,
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82
): Promise<File> {
    if (!file || !file.type.startsWith('image/')) {
        return file;
    }

    return new Promise((resolve) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            let width = img.width;
            let height = img.height;

            // Calculate scaled aspect ratio
            if (width > maxWidth || height > maxHeight) {
                if (width / height > maxWidth / maxHeight) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                } else {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(file);
                return;
            }

            // Draw image on canvas
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        resolve(file);
                        return;
                    }
                    const baseName = file.name.replace(/\.[^/.]+$/, '');
                    const compressedFile = new File(
                        [blob],
                        `${baseName}.jpg`,
                        { type: 'image/jpeg', lastModified: Date.now() }
                    );
                    resolve(compressedFile);
                },
                'image/jpeg',
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(file);
        };

        img.src = objectUrl;
    });
}
