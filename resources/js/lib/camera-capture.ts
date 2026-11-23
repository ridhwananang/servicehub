/**
 * Captures the exact visible (object-cover cropped) region of a <video> element
 * onto an offscreen canvas and returns a JPEG Blob, so the captured photo matches
 * what the user sees on the device screen 1:1.
 */
export function captureVisibleVideoFrame(
    video: HTMLVideoElement,
    options: {
        mirror?: boolean;
        quality?: number;
        mimeType?: string;
    } = {},
): Promise<Blob | null> {
    const {
        mirror = false,
        quality = 0.92,
        mimeType = 'image/jpeg',
    } = options;

    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;
    const rect = video.getBoundingClientRect();
    const dw = rect.width || vw;
    const dh = rect.height || vh;

    const videoRatio = vw / vh;
    const displayRatio = dw / dh;

    let sx = 0;
    let sy = 0;
    let sw = vw;
    let sh = vh;

    if (videoRatio > displayRatio) {
        // Video is wider than viewport: object-cover clips left & right edges
        sh = vh;
        sw = vh * displayRatio;
        sx = (vw - sw) / 2;
    } else if (videoRatio < displayRatio) {
        // Video is taller than viewport: object-cover clips top & bottom edges
        sw = vw;
        sh = vw / displayRatio;
        sy = (vh - sh) / 2;
    }

    const cropX = Math.max(0, Math.round(sx));
    const cropY = Math.max(0, Math.round(sy));
    const cropW = Math.max(1, Math.min(vw - cropX, Math.round(sw)));
    const cropH = Math.max(1, Math.min(vh - cropY, Math.round(sh)));

    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return Promise.resolve(null);
    }

    if (mirror) {
        ctx.translate(cropW, 0);
        ctx.scale(-1, 1);
    }

    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), mimeType, quality);
    });
}
