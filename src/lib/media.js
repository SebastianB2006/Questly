/**
 * Pozele și videoclipurile adăugate la o provocare terminată.
 * Pozele se micșorează înainte de încărcare (o poză de 5 MB devine ~300–500 KB).
 * Se salvează în Firebase Storage la quests/{questId}/..., iar în Firestore păstrăm doar linkurile.
 */
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase';

export const MAX_MEDIA = 6;
export const MAX_VIDEO_SECONDS = 60;
const MAX_VIDEO_MB = 100; // aceeași limită ca în storage.rules
const MAX_IMAGE_SIDE = 1600;
const IMAGE_QUALITY = 0.8;

/**
 * Deschide galeria sau camera. `source` = 'library' | 'photo' | 'video'.
 * Returnează [{ uri, type: 'image' | 'video', width, height, duration, mimeType }].
 */
export async function pickMedia(source, remaining) {
  if (remaining <= 0) return [];
  const camera = source !== 'library';
  if (camera && Platform.OS !== 'web') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw { code: 'media/camera-permission' };
  }
  const options = {
    mediaTypes: source === 'photo' ? ['images'] : source === 'video' ? ['videos'] : ['images', 'videos'],
    quality: 1, // micșorăm noi pozele, controlat
    allowsEditing: false,
    allowsMultipleSelection: !camera,
    selectionLimit: remaining,
    videoMaxDuration: MAX_VIDEO_SECONDS,
  };
  const res = camera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (res.canceled || !res.assets?.length) return [];

  const items = res.assets.slice(0, remaining).map((a) => ({
    uri: a.uri,
    type: a.type === 'video' ? 'video' : 'image',
    width: a.width ?? null,
    height: a.height ?? null,
    duration: a.duration ?? null, // milisecunde, doar la video
    fileSize: a.fileSize ?? null,
    mimeType: a.mimeType ?? null,
  }));

  const tooLong = items.find((i) => i.type === 'video' && i.duration && i.duration > (MAX_VIDEO_SECONDS + 1) * 1000);
  if (tooLong) throw { code: 'media/too-long' };
  const tooBig = items.find((i) => i.type === 'video' && i.fileSize && i.fileSize > MAX_VIDEO_MB * 1024 * 1024);
  if (tooBig) throw { code: 'media/too-large', message: `That video is over ${MAX_VIDEO_MB} MB. Pick a shorter one.` };
  return items;
}

export function mediaErrorMessage(e) {
  if (e?.code === 'media/camera-permission') return 'Allow camera access in your phone settings.';
  if (e?.code === 'media/too-long') return `Videos can be up to ${MAX_VIDEO_SECONDS} seconds long.`;
  if (e?.code === 'media/too-large') return e.message;
  return 'Couldn’t open that file. Try another one.';
}

/** Micșorează o poză și o salvează ca JPEG. Returnează { uri, width, height }. */
async function prepareImage(item) {
  try {
    const ctx = ImageManipulator.manipulate(item.uri);
    const w = item.width || 0;
    const h = item.height || 0;
    if (!w || !h || Math.max(w, h) > MAX_IMAGE_SIDE) {
      if (h > w) ctx.resize({ height: MAX_IMAGE_SIDE });
      else ctx.resize({ width: MAX_IMAGE_SIDE });
    }
    const img = await ctx.renderAsync();
    const out = await img.saveAsync({ compress: IMAGE_QUALITY, format: SaveFormat.JPEG });
    return { uri: out.uri, width: out.width ?? w, height: out.height ?? h, mimeType: 'image/jpeg' };
  } catch {
    // Rezervă: încărcăm poza originală.
    return { uri: item.uri, width: item.width, height: item.height, mimeType: item.mimeType || 'image/jpeg' };
  }
}

function videoType(item) {
  const fromMime = item.mimeType?.startsWith('video/') ? item.mimeType : null;
  const isMov = /\.mov$/i.test(item.uri) || fromMime === 'video/quicktime';
  return { contentType: fromMime || (isMov ? 'video/quicktime' : 'video/mp4'), ext: isMov ? 'mov' : 'mp4' };
}

function uploadWithProgress(path, blob, contentType, onBytes) {
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(ref(storage, path), blob, { contentType });
    task.on('state_changed', (s) => onBytes(s.totalBytes ? s.bytesTransferred / s.totalBytes : 0), reject, resolve);
  });
}

/**
 * Încarcă fișierele în Storage. `onProgress(0..1)` pentru bara de progres.
 * Returnează lista salvată în Firestore: [{ url, path, type, width, height, duration }].
 */
export async function uploadQuestMedia(questId, items, onProgress) {
  if (!isFirebaseConfigured) {
    // Mod demo: păstrăm fișierele locale de pe telefon (se pierd la repornirea aplicației).
    onProgress?.(1);
    return items.map((i) => ({
      url: i.uri,
      path: null,
      type: i.type,
      width: i.width ?? null,
      height: i.height ?? null,
      duration: i.duration ?? null,
    }));
  }

  const saved = [];
  for (let n = 0; n < items.length; n++) {
    const item = items[n];
    const prepared = item.type === 'image' ? await prepareImage(item) : item;
    const { contentType, ext } = item.type === 'image' ? { contentType: 'image/jpeg', ext: 'jpg' } : videoType(item);
    const path = `quests/${questId}/${Date.now()}_${n}.${ext}`;

    const blob = await (await fetch(prepared.uri)).blob();
    try {
      if (item.type === 'video' && blob.size > MAX_VIDEO_MB * 1024 * 1024) {
        throw { code: 'media/too-large', message: `That video is over ${MAX_VIDEO_MB} MB. Pick a shorter one.` };
      }
      await uploadWithProgress(path, blob, contentType, (p) => onProgress?.((n + p) / items.length));
    } finally {
      blob.close?.(); // eliberează memoria în React Native
    }

    saved.push({
      url: await getDownloadURL(ref(storage, path)),
      path,
      type: item.type,
      width: prepared.width ?? null,
      height: prepared.height ?? null,
      duration: item.duration ?? null,
    });
  }
  onProgress?.(1);
  return saved;
}
