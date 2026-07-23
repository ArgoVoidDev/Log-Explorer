"use client";

import { useState, type FormEvent, type ReactElement, type ReactNode } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
} from "lucide-react";

import { cn } from "@core/lib/utils";
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
  Typography,
} from "@core/ui";

import { useApiKey } from "../hooks/use-api-key";

const GEMINI_KEY_URL = "https://aistudio.google.com/apikey";

export type ByokSettingsModalProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  showTrigger?: boolean;
};

export function ByokSettingsModal({
  open,
  onOpenChange,
  trigger,
  showTrigger = true,
}: ByokSettingsModalProps) {
  const { apiKey, isConfigured, isHydrated, setApiKey, clearApiKey } =
    useApiKey();
  const [draftKey, setDraftKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const isControlled = open !== undefined;

  const trimmedDraft = draftKey.trim();
  const isUnchanged = trimmedDraft === (apiKey ?? "");
  const canSave = trimmedDraft.length > 0 && !isUnchanged;

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange?.(nextOpen);

    if (nextOpen) {
      setDraftKey(apiKey ?? "");
      setValidationError(null);
      setSavedMessage(null);
      setShowKey(false);
      return;
    }

    setValidationError(null);
    setSavedMessage(null);
    setShowKey(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (trimmedDraft.length === 0) {
      setValidationError("Enter a valid Gemini API key.");
      return;
    }

    setApiKey(trimmedDraft);
    setValidationError(null);
    setSavedMessage("API key saved locally.");
    handleOpenChange(false);
  }

  function handleRemove() {
    clearApiKey();
    setDraftKey("");
    setValidationError(null);
    setSavedMessage(null);
    handleOpenChange(false);
  }

  return (
    <Modal
      {...(isControlled ? { open } : {})}
      onOpenChange={handleOpenChange}
    >
      {showTrigger ? (
        trigger ? (
          <ModalTrigger render={trigger as ReactElement} />
        ) : (
          <ModalTrigger render={<Button variant="outline" type="button" />}>
            Configure API key
          </ModalTrigger>
        )
      ) : null}
      <ModalContent className="gap-0 overflow-hidden border-[var(--saas-line)] p-0 sm:max-w-md">
        <ModalHeader className="gap-3 border-b border-[var(--saas-line)] bg-[var(--saas-panel)] px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--saas-line)] bg-[var(--saas-surface)] text-[var(--saas-accent)]">
              <KeyRound className="size-4" aria-hidden />
            </div>
            <div className="space-y-1.5">
              <ModalTitle className="text-[var(--saas-ink)]">
                Bring your own key
              </ModalTitle>
              <ModalDescription className="text-[var(--saas-muted)]">
                Your Gemini API key is stored only in this browser. It is never
                sent to our servers.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="space-y-4 px-5 py-4">
            <div className="flex items-center justify-between rounded-lg border border-[var(--saas-line)] bg-[var(--saas-surface)] px-3 py-2.5">
              <Typography variant="small" className="text-[var(--saas-muted)]">
                Status
              </Typography>
              {!isHydrated ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--saas-muted)]">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  Checking…
                </span>
              ) : isConfigured ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" aria-hidden />
                  Configured
                </span>
              ) : (
                <span className="text-xs text-[var(--saas-muted)]">
                  Not configured
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="gemini-api-key"
                className="text-sm font-medium text-[var(--saas-ink)]"
              >
                Gemini API key
              </label>
              <div className="relative">
                <Input
                  id="gemini-api-key"
                  name="gemini-api-key"
                  type={showKey ? "text" : "password"}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="AIza…"
                  value={draftKey}
                  onChange={(event) => {
                    setDraftKey(event.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  aria-invalid={validationError !== null}
                  className={cn(
                    "h-9 pr-10",
                    "border-[var(--saas-line)] bg-[var(--saas-panel)] text-[var(--saas-ink)]",
                    "placeholder:text-[var(--saas-muted)]",
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-1/2 right-1 -translate-y-1/2 text-[var(--saas-muted)]"
                  onClick={() => setShowKey((current) => !current)}
                  aria-label={showKey ? "Hide API key" : "Show API key"}
                >
                  {showKey ? (
                    <EyeOff className="size-4" aria-hidden />
                  ) : (
                    <Eye className="size-4" aria-hidden />
                  )}
                </Button>
              </div>
              {validationError ? (
                <Typography
                  variant="small"
                  className="text-destructive"
                  role="alert"
                >
                  {validationError}
                </Typography>
              ) : (
                <Typography variant="muted" className="text-[var(--saas-muted)]">
                  Get a key from{" "}
                  <a
                    href={GEMINI_KEY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--saas-accent)] underline-offset-2 hover:underline"
                  >
                    Google AI Studio
                  </a>
                  .
                </Typography>
              )}
            </div>

            {savedMessage ? (
              <Typography
                variant="small"
                className="text-emerald-700 dark:text-emerald-400"
                role="status"
              >
                {savedMessage}
              </Typography>
            ) : null}
          </div>

          <ModalFooter className="border-[var(--saas-line)] bg-[var(--saas-surface)]/60 px-5 py-4">
            {isConfigured ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemove}
              >
                Remove key
              </Button>
            ) : null}
            <Button type="submit" disabled={!canSave}>
              Save key
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

export function ByokSettingsPanel() {
  const { isConfigured, isHydrated } = useApiKey();

  return (
    <section className="space-y-4 border border-[var(--saas-line)] bg-[var(--saas-panel)] px-4 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Typography variant="small" className="text-[var(--saas-ink)]">
            Gemini API key
          </Typography>
          <Typography variant="muted" className="text-[var(--saas-muted)]">
            {!isHydrated
              ? "Checking local storage…"
              : isConfigured
                ? "A key is saved in this browser."
                : "No key configured yet."}
          </Typography>
        </div>
        <ByokSettingsModal />
      </div>
    </section>
  );
}
