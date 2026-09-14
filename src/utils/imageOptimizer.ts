import { CoupleSiteData } from '../types';

/**
 * Checks if a string is a base64 Data URL
 */
export function isBase64Image(url?: string): boolean {
  return typeof url === 'string' && url.startsWith('data:image/');
}

/**
 * Format bytes into human readable string (e.g. 1.2 MB, 450 KB)
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Compress an image file or base64 string using an HTML Canvas.
 * Supports smart WebP with transparency or optimized JPEG.
 */
export async function compressImage(
  source: File | string,
  options: {
    maxDim?: number;
    quality?: number;
    forceFormat?: 'webp' | 'jpeg' | 'png';
  } = {}
): Promise<string> {
  const maxDim = options.maxDim ?? 1200;
  const quality = options.quality ?? 0.80;

  let dataUrl = '';
  let isTransparent = false;

  if (typeof source === 'string') {
    dataUrl = source;
    isTransparent = source.startsWith('data:image/png') || source.startsWith('data:image/webp');
  } else {
    isTransparent =
      source.type === 'image/png' ||
      source.type === 'image/webp' ||
      source.type === 'image/svg+xml' ||
      source.type === 'image/gif';

    dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(source);
    });
  }

  // Load into Image object
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });

  let width = img.width;
  let height = img.height;

  // Downscale if larger than maxDim
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;

  // Clear canvas for transparent formats
  ctx.clearRect(0, 0, width, height);

  // If not transparent, fill with solid white background to avoid dark JPEG artifacts
  if (!isTransparent && options.forceFormat !== 'png' && options.forceFormat !== 'webp') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);

  // Determine optimal output format
  // Modern browsers support WebP with full alpha transparency and high compression
  let targetFormat = 'image/jpeg';
  if (options.forceFormat) {
    targetFormat = `image/${options.forceFormat}`;
  } else if (isTransparent) {
    // Try webp first for transparent images (80% smaller than png)
    targetFormat = 'image/webp';
  }

  try {
    const compressed = canvas.toDataURL(targetFormat, quality);
    // If browser didn't support webp and fell back to png with huge size, verify
    if (compressed.startsWith('data:image/png') && isTransparent) {
      // Keep png if transparent and webp not supported
      return canvas.toDataURL('image/png');
    }
    return compressed;
  } catch {
    return canvas.toDataURL('image/jpeg', quality);
  }
}

/**
 * Scan all fields in CoupleSiteData to calculate memory footprint
 */
export function calculateSiteDataSize(data: CoupleSiteData): {
  totalBytes: number;
  imageBytes: number;
  textBytes: number;
  imageCount: number;
  formattedTotal: string;
  formattedImages: string;
} {
  const json = JSON.stringify(data);
  const totalBytes = new Blob([json]).size;

  let imageBytes = 0;
  let imageCount = 0;

  const checkUrl = (url?: string) => {
    if (isBase64Image(url)) {
      imageBytes += new Blob([url!]).size;
      imageCount += 1;
    }
  };

  checkUrl(data.coverImage);
  checkUrl(data.sidebarAvatar);
  checkUrl(data.mainIllustration);
  checkUrl(data.characterA?.avatar);
  checkUrl(data.characterA?.cornerImage);
  checkUrl(data.characterB?.avatar);
  checkUrl(data.characterB?.cornerImage);

  (data.album || []).forEach((photo) => checkUrl(photo.url));
  (data.alternativeUniverses || []).forEach((au) => checkUrl(au.coverImage));

  const textBytes = Math.max(0, totalBytes - imageBytes);

  return {
    totalBytes,
    imageBytes,
    textBytes,
    imageCount,
    formattedTotal: formatBytes(totalBytes),
    formattedImages: formatBytes(imageBytes),
  };
}

/**
 * Batch optimize all base64 images in CoupleSiteData
 */
export async function batchOptimizeDataImages(
  data: CoupleSiteData,
  onProgress?: (current: number, total: number) => void
): Promise<{ updatedData: CoupleSiteData; savedBytes: number }> {
  const initialSize = new Blob([JSON.stringify(data)]).size;
  const nextData: CoupleSiteData = JSON.parse(JSON.stringify(data));

  // Collect tasks
  const tasks: Array<{
    name: string;
    get: () => string | undefined;
    set: (val: string) => void;
    maxDim: number;
  }> = [
    { name: 'coverImage', get: () => nextData.coverImage, set: (v) => (nextData.coverImage = v), maxDim: 1080 },
    { name: 'sidebarAvatar', get: () => nextData.sidebarAvatar, set: (v) => (nextData.sidebarAvatar = v), maxDim: 400 },
    { name: 'mainIllustration', get: () => nextData.mainIllustration, set: (v) => (nextData.mainIllustration = v), maxDim: 1080 },
    { name: 'charA_avatar', get: () => nextData.characterA?.avatar, set: (v) => { if (nextData.characterA) nextData.characterA.avatar = v; }, maxDim: 400 },
    { name: 'charA_corner', get: () => nextData.characterA?.cornerImage, set: (v) => { if (nextData.characterA) nextData.characterA.cornerImage = v; }, maxDim: 600 },
    { name: 'charB_avatar', get: () => nextData.characterB?.avatar, set: (v) => { if (nextData.characterB) nextData.characterB.avatar = v; }, maxDim: 400 },
    { name: 'charB_corner', get: () => nextData.characterB?.cornerImage, set: (v) => { if (nextData.characterB) nextData.characterB.cornerImage = v; }, maxDim: 600 },
  ];

  (nextData.album || []).forEach((photo, idx) => {
    tasks.push({
      name: `album_${idx}`,
      get: () => photo.url,
      set: (v) => { nextData.album[idx].url = v; },
      maxDim: 1080,
    });
  });

  (nextData.alternativeUniverses || []).forEach((au, idx) => {
    tasks.push({
      name: `au_${idx}`,
      get: () => au.coverImage,
      set: (v) => { nextData.alternativeUniverses[idx].coverImage = v; },
      maxDim: 800,
    });
  });

  const base64Tasks = tasks.filter((t) => isBase64Image(t.get()));
  const total = base64Tasks.length;

  for (let i = 0; i < total; i++) {
    const task = base64Tasks[i];
    const original = task.get();
    if (original && isBase64Image(original)) {
      try {
        const optimized = await compressImage(original, { maxDim: task.maxDim, quality: 0.80 });
        // Only replace if optimized is actually smaller
        if (optimized.length < original.length) {
          task.set(optimized);
        }
      } catch (err) {
        console.warn(`Failed to compress ${task.name}:`, err);
      }
    }
    if (onProgress) onProgress(i + 1, total);
  }

  const finalSize = new Blob([JSON.stringify(nextData)]).size;
  const savedBytes = Math.max(0, initialSize - finalSize);

  return {
    updatedData: nextData,
    savedBytes,
  };
}

/**
 * Strip all massive base64 images to create an ultra-lightweight backup file (<60KB)
 * Leaves all text, stories, diary entries, tags, answers, and external URLs completely intact!
 */
export function stripBase64ForLightweightBackup(data: CoupleSiteData): CoupleSiteData {
  const cleanUrl = (url?: string) => (isBase64Image(url) ? '' : url);

  return {
    ...data,
    coverImage: cleanUrl(data.coverImage),
    sidebarAvatar: cleanUrl(data.sidebarAvatar),
    mainIllustration: cleanUrl(data.mainIllustration),
    characterA: data.characterA
      ? {
          ...data.characterA,
          avatar: cleanUrl(data.characterA.avatar) || '',
          cornerImage: cleanUrl(data.characterA.cornerImage),
        }
      : data.characterA,
    characterB: data.characterB
      ? {
          ...data.characterB,
          avatar: cleanUrl(data.characterB.avatar) || '',
          cornerImage: cleanUrl(data.characterB.cornerImage),
        }
      : data.characterB,
    album: (data.album || []).map((photo) => ({
      ...photo,
      url: cleanUrl(photo.url) || '',
    })),
    alternativeUniverses: (data.alternativeUniverses || []).map((au) => ({
      ...au,
      coverImage: cleanUrl(au.coverImage),
    })),
  };
}
