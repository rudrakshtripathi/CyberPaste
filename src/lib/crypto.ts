'use client';

// Helper to convert strings to ArrayBuffer and back
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Generates a new AES-GCM key
export async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Converts a CryptoKey to a base64 string for storage in the URL hash
export async function keyToBase64(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

// Converts a base64 string from the URL hash back to a CryptoKey
export async function base64ToKey(keyStr: string): Promise<CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(keyStr);
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypts content with a given key
export async function encrypt(content: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const encodedContent = encoder.encode(content);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedContent
  );

  // Prepend IV to ciphertext and return as a single base64 string
  const fullMessage = new Uint8Array(iv.length + ciphertext.byteLength);
  fullMessage.set(iv);
  fullMessage.set(new Uint8Array(ciphertext), iv.length);

  return arrayBufferToBase64(fullMessage.buffer);
}

// Decrypts content with a given key
export async function decrypt(encryptedContent: string, key: CryptoKey): Promise<string> {
  const fullMessage = base64ToArrayBuffer(encryptedContent);
  const iv = fullMessage.slice(0, 12);
  const ciphertext = fullMessage.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return decoder.decode(decrypted);
}
