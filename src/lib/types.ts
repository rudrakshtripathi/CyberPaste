export type EditorTab = {
  id: string; // client-side id for React keys
  name: string;
  lang: string;
  content: string;
};

export type StoredTab = {
  name: string;
  lang: string;
  content: string; // can be ciphertext
};

export type StoredPaste = {
  id: string; // server-side id
  createdAt: number; // timestamp
  ttl: number; // seconds, 0 for never
  views: number;
  encrypted: boolean;
  tabs: StoredTab[];
};
