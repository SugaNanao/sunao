import { CoupleSiteData } from '../types';
import { DEFAULT_COUPLE_DATA } from '../data/defaultData';
import { stripBase64ForLightweightBackup } from './imageOptimizer';

const STORAGE_KEY = 'love_archive_couple_data_v1';
const DB_NAME = 'LoveArchiveDB';
const STORE_NAME = 'siteData';
const DB_VERSION = 1;

/**
 * Open native IndexedDB for persistent large-capacity storage
 * (Supports 100MB+ for high-res images, custom music, and rich albums)
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Asynchronously load full couple data from IndexedDB
 */
export async function loadCoupleDataFromIndexedDB(): Promise<CoupleSiteData | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(STORAGE_KEY);
      req.onsuccess = () => {
        if (req.result) {
          resolve({ ...DEFAULT_COUPLE_DATA, ...req.result });
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Asynchronously persist full data to IndexedDB
 */
export async function saveCoupleDataToIndexedDB(data: CoupleSiteData): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, STORAGE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB write skipped or failed:', err);
  }
}

/**
 * Helper to strip massive base64 media for lightweight localStorage fallback
 * so localStorage never throws QuotaExceededError
 */
function createLightweightFallback(data: CoupleSiteData): CoupleSiteData {
  try {
    return {
      ...data,
      album: (data.album || []).slice(0, 10).map((photo) => ({
        ...photo,
        url: photo.url?.startsWith('data:') && photo.url.length > 200000 ? '' : photo.url,
      })),
    };
  } catch {
    return data;
  }
}

/**
 * Safely encode couple data for shareable URL without causing RangeError or URIError.
 * Text and structure are completely preserved; all inline base64 images are stripped to keep URL short and safe.
 */
export function encodeShareData(data: CoupleSiteData): string {
  try {
    const compact = stripBase64ForLightweightBackup(data);
    const jsonStr = JSON.stringify(compact);
    const utf8Bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    const len = utf8Bytes.length;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    console.error('encodeShareData error:', e);
    return '';
  }
}

/**
 * Decode shared data from URL hash or query string
 */
export function decodeShareData(encoded: string): CoupleSiteData | null {
  try {
    if (!encoded) return null;
    let base64 = decodeURIComponent(encoded).replace(/-/g, '+').replace(/_/g, '/').replace(/ /g, '+');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === 'object') {
      return { ...DEFAULT_COUPLE_DATA, ...parsed };
    }
  } catch (err) {
    // Try legacy decoding
    try {
      const legacyJson = decodeURIComponent(atob(decodeURIComponent(encoded)));
      const parsed = JSON.parse(legacyJson);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_COUPLE_DATA, ...parsed };
      }
    } catch {}
    console.warn('decodeShareData failed:', err);
  }
  return null;
}

/**
 * Extract shared data from current location (URL hash or query)
 */
export function extractShareDataFromUrl(): CoupleSiteData | null {
  try {
    const hash = window.location.hash;
    let rawEncoded = '';
    if (hash) {
      const match = hash.match(/[#&]data=([^&]+)/);
      if (match) {
        rawEncoded = match[1];
      } else if (hash.startsWith('#data=')) {
        rawEncoded = hash.slice(6);
      }
    }
    if (!rawEncoded) {
      const params = new URLSearchParams(window.location.search);
      rawEncoded = params.get('data') || '';
    }
    if (rawEncoded) {
      return decodeShareData(rawEncoded);
    }
  } catch (e) {
    console.warn('extractShareDataFromUrl error:', e);
  }
  return null;
}

/**
 * Synchronous initial load for React state initialization
 */
export function loadCoupleData(): CoupleSiteData {
  try {
    // 1. Check if there is a shared state in URL hash or search params
    const sharedData = extractShareDataFromUrl();
    if (sharedData) {
      return sharedData;
    }

    // 2. Read from localStorage
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      return { ...DEFAULT_COUPLE_DATA, ...parsed };
    }
  } catch (e) {
    console.warn('Error reading localStorage:', e);
  }
  return DEFAULT_COUPLE_DATA;
}

/**
 * Save data with dual-layer persistence:
 * 1. Full data in IndexedDB (immune to 5MB quota)
 * 2. Safe localStorage save with QuotaExceeded guard
 */
export function saveCoupleData(data: CoupleSiteData): void {
  // Always persist full data to IndexedDB
  saveCoupleDataToIndexedDB(data).catch(() => {});

  // Safely persist to localStorage without crashing on quota limit
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // QuotaExceededError: save lightweight fallback
    try {
      const lightweight = createLightweightFallback(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
    } catch {
      // If even lightweight cannot fit, do nothing (IndexedDB has the full state)
    }
  }
}

export function resetCoupleData(): CoupleSiteData {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Error resetting localStorage:', e);
  }
  try {
    openDB().then((db) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(STORAGE_KEY);
    }).catch(() => {});
  } catch {}
  return DEFAULT_COUPLE_DATA;
}

export function isSharedUrl(): boolean {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('shared') === '1' || searchParams.get('mode') === 'guest') {
      return true;
    }
    const hash = window.location.hash;
    if (hash && (hash.includes('data=') || hash.includes('shared=1'))) {
      return true;
    }
  } catch (e) {
    console.error(e);
  }
  return false;
}

export function exportDataAsJSON(data: CoupleSiteData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `love_archive_${data.siteTitle.replace(/\s+/g, '_')}_full_backup.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportLightweightBackupJSON(data: CoupleSiteData): void {
  const lightweight = stripBase64ForLightweightBackup(data);
  const jsonStr = JSON.stringify(lightweight, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `love_archive_${data.siteTitle.replace(/\s+/g, '_')}_lightweight.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function getCleanSiteUrl(): string {
  try {
    return window.location.origin + window.location.pathname;
  } catch {
    return window.location.href.split('#')[0].split('?')[0];
  }
}

export function generateShareableUrl(data: CoupleSiteData): string {
  try {
    const encoded = encodeShareData(data);
    const base = window.location.origin + window.location.pathname;
    const url = new URL(base);
    url.searchParams.set('shared', '1');
    url.searchParams.set('mode', 'guest');
    url.hash = `data=${encoded}`;
    return url.toString();
  } catch (e) {
    console.error('Failed to generate share URL', e);
    return window.location.href;
  }
}
