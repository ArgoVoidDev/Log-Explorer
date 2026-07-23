"use client";

import { useCallback, useEffect, useState } from "react";

export const GEMINI_API_KEY_STORAGE_KEY = "log-explorer:gemini-api-key" as const;

export type UseApiKeyResult = {
  apiKey: string | null;
  isConfigured: boolean;
  isHydrated: boolean;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function readGeminiApiKey(): string | null {
  if (!canUseStorage()) return null;

  try {
    const value = window.localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch {
    return null;
  }
}

export function writeGeminiApiKey(key: string): void {
  if (!canUseStorage()) return;

  const trimmed = key.trim();
  if (trimmed.length === 0) return;

  window.localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, trimmed);
}

export function deleteGeminiApiKey(): void {
  if (!canUseStorage()) return;

  window.localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
}

export function useApiKey(): UseApiKeyResult {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setApiKeyState(readGeminiApiKey());
    setIsHydrated(true);

    function handleStorage(event: StorageEvent) {
      if (event.key !== GEMINI_API_KEY_STORAGE_KEY) return;
      setApiKeyState(readGeminiApiKey());
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setApiKey = useCallback((key: string) => {
    const trimmed = key.trim();
    if (trimmed.length === 0) return;

    writeGeminiApiKey(trimmed);
    setApiKeyState(trimmed);
  }, []);

  const clearApiKey = useCallback(() => {
    deleteGeminiApiKey();
    setApiKeyState(null);
  }, []);

  return {
    apiKey,
    isConfigured: apiKey !== null,
    isHydrated,
    setApiKey,
    clearApiKey,
  };
}
