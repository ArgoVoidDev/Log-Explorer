"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, RotateCcw } from "lucide-react";

import { buttonVariants, Button, Typography } from "@core/ui";
import { cn } from "@core/lib/utils";

import { useApiKey } from "../hooks/use-api-key";
import type { TextEmbedding } from "../lib/embeddings";
import { ChatInterface } from "./chat-interface";
import { LogUploader } from "./log-uploader";

type EmbeddedLog = {
  fileName: string;
  embeddings: TextEmbedding[];
};

export function DashboardLogExplorer() {
  const { apiKey, isConfigured, isHydrated } = useApiKey();
  const [embeddedLog, setEmbeddedLog] = useState<EmbeddedLog | null>(null);

  function handleReset() {
    setEmbeddedLog(null);
  }

  if (!isHydrated) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--saas-surface)]" />
        <div className="h-64 animate-pulse rounded-xl bg-[var(--saas-surface)]" />
      </div>
    );
  }

  if (!isConfigured || !apiKey) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Gemini API key required</p>
          <p className="mt-1 text-amber-900/80">
            Add your API key in{" "}
            <Link
              href="/dashboard/profile"
              className={cn(
                buttonVariants({ variant: "link", size: "sm" }),
                "h-auto px-0 text-amber-950 underline"
              )}
            >
              Profile settings
            </Link>{" "}
            before uploading logs for semantic search.
          </p>
        </div>
        <LogUploader />
      </div>
    );
  }

  if (embeddedLog) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--saas-line)] bg-[var(--saas-panel)] px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--saas-surface)] text-[var(--saas-accent)]">
              <FileText className="size-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <Typography variant="small" className="truncate text-[var(--saas-ink)]">
                {embeddedLog.fileName}
              </Typography>
              <Typography variant="muted" className="text-xs text-[var(--saas-muted)]">
                {embeddedLog.embeddings.length} indexed chunk
                {embeddedLog.embeddings.length === 1 ? "" : "s"}
              </Typography>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="shrink-0 border-[var(--saas-line)] text-[var(--saas-ink)]"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Upload new file
          </Button>
        </div>

        <ChatInterface
          documentEmbeddings={embeddedLog.embeddings}
          apiKey={apiKey}
        />
      </div>
    );
  }

  return (
    <LogUploader
      apiKey={apiKey}
      onEmbeddingsReady={({ embeddings, fileName }) => {
        setEmbeddedLog({ embeddings, fileName });
      }}
    />
  );
}
