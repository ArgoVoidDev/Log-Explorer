"use client";

import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";

import { cn } from "@core/lib/utils";
import { Button, Typography } from "@core/ui";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".txt", ".log"] as const;

function getFileExtension(name: string): string {
  const lastDot = name.lastIndexOf(".");
  return lastDot >= 0 ? name.slice(lastDot).toLowerCase() : "";
}

function isAcceptedExtension(ext: string): ext is (typeof ACCEPTED_EXTENSIONS)[number] {
  return (ACCEPTED_EXTENSIONS as readonly string[]).includes(ext);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file: File): string | null {
  const ext = getFileExtension(file.name);
  if (!isAcceptedExtension(ext)) {
    return "Only .txt and .log files are supported.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File must be 5 MB or smaller.";
  }
  return null;
}

function getPreviewLines(content: string, count = 3): string[] {
  return content.split(/\r?\n/).slice(0, count);
}

export function LogUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [content, setContent] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setFileName(null);
      setFileSize(null);
      setContent(null);
      return;
    }

    setError(null);
    setIsReading(true);
    setFileName(file.name);
    setFileSize(file.size);
    setContent(null);

    const reader = new FileReader();
    reader.onload = () => {
      setContent(typeof reader.result === "string" ? reader.result : "");
      setIsReading(false);
    };
    reader.onerror = () => {
      setError("Could not read the file. Please try again.");
      setFileName(null);
      setFileSize(null);
      setContent(null);
      setIsReading(false);
    };
    reader.readAsText(file);
  }, []);

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) processFile(file);
    event.target.value = "";
  }

  function handleBrowseClick() {
    inputRef.current?.click();
  }

  function handleDropzoneKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleBrowseClick();
    }
  }

  function handleClear() {
    setFileName(null);
    setFileSize(null);
    setContent(null);
    setError(null);
    setIsDragOver(false);
    setIsReading(false);
  }

  const previewLines = content ? getPreviewLines(content) : [];
  const isSuccess = content !== null && !isReading && !error;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header className="space-y-2">
        <Typography
          variant="h2"
          className="border-0 pb-0 font-[family-name:var(--font-saas-display)] text-[var(--saas-ink)]"
        >
          Upload server logs
        </Typography>
        <Typography variant="muted" className="text-[var(--saas-muted)]">
          Drag and drop a log file or browse your device. Files stay in your
          browser — nothing is uploaded to a server.
        </Typography>
      </header>

      <div
        role="button"
        tabIndex={0}
        aria-label="Upload log file"
        aria-busy={isReading}
        onClick={handleBrowseClick}
        onKeyDown={handleDropzoneKeyDown}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--saas-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--saas-bg)]",
          isDragOver
            ? "scale-[1.01] border-[var(--saas-accent)] bg-[var(--saas-accent)]/10 shadow-[0_0_0_4px_oklch(0.55_0.08_220/0.12)]"
            : "border-[var(--saas-line)] bg-[var(--saas-panel)] hover:border-[var(--saas-accent)]/60 hover:bg-[var(--saas-surface)]",
          isReading && "pointer-events-none opacity-80",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.log"
          className="sr-only"
          onChange={handleInputChange}
        />

        <div
          className={cn(
            "flex size-16 items-center justify-center rounded-full transition-colors duration-200",
            isDragOver
              ? "bg-[var(--saas-accent)]/20 text-[var(--saas-accent)]"
              : "bg-[var(--saas-surface)] text-[var(--saas-muted)] group-hover:bg-[var(--saas-accent)]/10 group-hover:text-[var(--saas-accent)]",
          )}
        >
          {isReading ? (
            <Loader2 className="size-7 animate-spin" aria-hidden />
          ) : isDragOver ? (
            <FileText className="size-7" aria-hidden />
          ) : (
            <Upload className="size-7" aria-hidden />
          )}
        </div>

        <div className="space-y-1">
          <Typography
            variant="large"
            className="text-[var(--saas-ink)]"
          >
            {isReading
              ? "Reading file…"
              : isDragOver
                ? "Drop your log file here"
                : "Drag & drop your log file here"}
          </Typography>
          <Typography variant="muted" className="text-[var(--saas-muted)]">
            or{" "}
            <span className="font-medium text-[var(--saas-accent)] underline-offset-2 group-hover:underline">
              browse files
            </span>
          </Typography>
        </div>

        <Typography
          variant="muted"
          className="text-xs text-[var(--saas-muted)]"
        >
          .txt or .log · up to 5 MB
        </Typography>
      </div>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>{error}</p>
        </div>
      ) : null}

      {isSuccess ? (
        <section className="space-y-4">
          <div className="flex items-start justify-between gap-4 border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="flex items-start gap-3 text-sm text-emerald-900">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
              <div className="space-y-1">
                <p className="font-medium">File loaded successfully</p>
                <p className="text-emerald-800/80">
                  {fileName}
                  {fileSize !== null ? ` · ${formatFileSize(fileSize)}` : null}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleClear}
              aria-label="Clear loaded file"
              className="shrink-0 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900"
            >
              <X className="size-4" aria-hidden />
            </Button>
          </div>

          <div className="border border-[var(--saas-line)] bg-[var(--saas-panel)]">
            <div className="border-b border-[var(--saas-line)] px-4 py-3">
              <Typography
                variant="small"
                className="font-medium text-[var(--saas-ink)]"
              >
                Preview — first 3 lines
              </Typography>
            </div>
            <pre className="overflow-x-auto px-4 py-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-[var(--saas-ink)]">
              {previewLines.length > 0
                ? previewLines.join("\n")
                : "(empty file)"}
            </pre>
          </div>
        </section>
      ) : null}
    </div>
  );
}
