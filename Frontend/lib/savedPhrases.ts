import AsyncStorage from "@react-native-async-storage/async-storage";

export type SavedPhrase = {
  id: string;
  text: string;
  signUri?: string;
  createdAt: number;
};

const KEY = "savedPhrases";

export async function loadPhrases(): Promise<SavedPhrase[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function savePhrases(list: SavedPhrase[]) {
  return AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export async function addPhrase(text: string, signUri?: string) {
  const list = await loadPhrases();
  const newPhrase: SavedPhrase = {
    id: Date.now().toString(),
    text,
    signUri,
    createdAt: Date.now(),
  };
  const updated = [newPhrase, ...list];
  await savePhrases(updated);
}

export async function removePhrase(id: string) {
  const list = await loadPhrases();
  const updated = list.filter(p => p.id !== id);
  await savePhrases(updated);
}
