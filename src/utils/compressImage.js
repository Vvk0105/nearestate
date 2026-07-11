import imageCompression from 'browser-image-compression';

/**
 * Compresses an image File before upload.
 * - Gallery / event images: max 1MB, max 1600px
 * - Thumbnails / small previews: max 400KB, max 800px
 *
 * @param {File} file - The original File object from the upload input
 * @param {'gallery'|'thumb'} mode - Compression preset
 * @returns {Promise<File>} - Compressed File object (same name, JPEG)
 */
export async function compressImage(file, mode = 'gallery') {
    // Skip non-image files (e.g. PDFs for payment screenshots)
    if (!file.type.startsWith('image/')) return file;

    const options =
        mode === 'thumb'
            ? { maxSizeMB: 0.4, maxWidthOrHeight: 800, useWebWorker: true, fileType: 'image/jpeg' }
            : { maxSizeMB: 1, maxWidthOrHeight: 1600, useWebWorker: true, fileType: 'image/jpeg' };

    try {
        const compressed = await imageCompression(file, options);
        // Preserve original filename
        return new File([compressed], file.name, { type: 'image/jpeg' });
    } catch (err) {
        console.warn('[compressImage] Compression failed, using original file:', err);
        return file;
    }
}

/**
 * Compresses an array of File objects concurrently.
 * @param {File[]} files
 * @param {'gallery'|'thumb'} mode
 * @returns {Promise<File[]>}
 */
export async function compressImages(files, mode = 'gallery') {
    return Promise.all(files.map((f) => compressImage(f, mode)));
}
