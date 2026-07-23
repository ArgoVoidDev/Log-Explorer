"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Bot, Loader2, Send, User } from "lucide-react";

import { cn } from "@core/lib/utils";
import { Button, Typography } from "@core/ui";

import { generateEmbeddings, type TextEmbedding } from "../lib/embeddings";
import {
  buildRagPrompt,
  LOG_ANALYST_SYSTEM_INSTRUCTION,
} from "../lib/rag-prompt";
import { searchRelatedChunks } from "../lib/vector-search";
import { ChatMessageContent } from "./chat-message-content";

const GENERATION_MODEL = "gemini-3.6-flash";
const GENERATE_CONTENT_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GENERATION_MODEL}:generateContent`;

type ChatMessage = {
  role: "user" | "ai";
  content: string;
};

export type ChatInterfaceProps = {
  documentEmbeddings: TextEmbedding[];
  apiKey: string;
};

type GeminiGenerateResponse = {
  error?: {
    message?: string;
  };
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

function extractGeneratedText(payload: GeminiGenerateResponse): string {
  const parts = payload.candidates?.[0]?.content?.parts;

  if (!parts || parts.length === 0) {
    throw new Error("Gemini did not return a text response.");
  }

  const text = parts
    .map((part) => part.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n")
    .trim();

  if (text.length === 0) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}

async function generateGeminiResponse(
  prompt: string,
  apiKey: string
): Promise<string> {
  let response: Response;

  try {
    response = await fetch(
      `${GENERATE_CONTENT_ENDPOINT}?key=${encodeURIComponent(apiKey.trim())}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: LOG_ANALYST_SYSTEM_INSTRUCTION }],
          },
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );
  } catch (error) {
    throw new Error("Network error while contacting the Gemini API.", {
      cause: error,
    });
  }

  let payload: GeminiGenerateResponse;

  try {
    payload = (await response.json()) as GeminiGenerateResponse;
  } catch (error) {
    throw new Error(
      `Failed to parse Gemini response (HTTP ${response.status}).`,
      { cause: error }
    );
  }

  if (!response.ok) {
    const message = payload.error?.message?.trim();
    throw new Error(
      message ?? `Gemini text generation failed (HTTP ${response.status}).`
    );
  }

  return extractGeneratedText(payload);
}

export function ChatInterface({
  documentEmbeddings,
  apiKey,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const submitQuestion = useCallback(
    async (question: string) => {
      const trimmed = question.trim();

      if (!trimmed || isLoading) {
        return;
      }

      setError(null);
      setInput("");
      setMessages((current) => [...current, { role: "user", content: trimmed }]);
      setIsLoading(true);

      try {
        const [queryEmbedding] = await generateEmbeddings(
          [trimmed],
          apiKey,
          "RETRIEVAL_QUERY"
        );
        const queryVector = queryEmbedding?.vector;

        if (!queryVector) {
          throw new Error("Could not embed your question.");
        }

        const relatedChunks = searchRelatedChunks(
          queryVector,
          documentEmbeddings,
          5,
          trimmed
        );
        const prompt = buildRagPrompt(relatedChunks, trimmed);
        const answer = await generateGeminiResponse(prompt, apiKey);

        setMessages((current) => [...current, { role: "ai", content: answer }]);
      } catch (submitError) {
        const message =
          submitError instanceof Error
            ? submitError.message
            : "Something went wrong while generating a response.";

        setError(message);
        setMessages((current) => [
          ...current,
          {
            role: "ai",
            content: `Sorry, I couldn't answer that. ${message}`,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, documentEmbeddings, isLoading]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitQuestion(input);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitQuestion(input);
    }
  }

  return (
    <div className="mx-auto flex h-[min(720px,calc(100svh-12rem))] w-full max-w-3xl flex-col gap-4">
      <header className="space-y-1">
        <Typography
          variant="h2"
          className="border-0 pb-0 font-[family-name:var(--font-saas-display)] text-[var(--saas-ink)]"
        >
          Ask your logs
        </Typography>
        <Typography variant="muted" className="text-[var(--saas-muted)]">
          Questions are answered using the most relevant log snippets — all
          processing stays in your browser.
        </Typography>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--saas-line)] bg-[var(--saas-panel)] shadow-sm">
        <div
          className="flex-1 space-y-4 overflow-y-auto px-4 py-5"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.length === 0 ? (
            <div className="flex h-full min-h-48 flex-col items-center justify-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-[var(--saas-surface)] text-[var(--saas-accent)]">
                <Bot className="size-6" aria-hidden />
              </div>
              <Typography variant="muted" className="max-w-sm text-[var(--saas-muted)]">
                Ask about errors, timelines, or patterns in your uploaded log
                file. For example: &ldquo;What caused the 500 errors?&rdquo;
              </Typography>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble key={`${message.role}-${index}`} message={message} />
            ))
          )}

          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-[var(--saas-muted)]">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              <span>Searching logs and generating answer…</span>
            </div>
          ) : null}

          <div ref={messagesEndRef} />
        </div>

        {error ? (
          <div
            role="alert"
            className="border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
          >
            {error}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 border-t border-[var(--saas-line)] bg-[var(--saas-surface)]/60 p-3"
        >
          <label htmlFor="log-chat-input" className="sr-only">
            Ask a question about your logs
          </label>
          <textarea
            id="log-chat-input"
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={isLoading}
            placeholder="Ask a question about your logs…"
            className={cn(
              "max-h-32 min-h-10 flex-1 resize-none rounded-lg border border-[var(--saas-line)] bg-[var(--saas-panel)] px-3 py-2.5 text-sm text-[var(--saas-ink)] outline-none",
              "placeholder:text-[var(--saas-muted)]",
              "focus-visible:border-[var(--saas-accent)] focus-visible:ring-2 focus-visible:ring-[var(--saas-accent)]/20",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || input.trim().length === 0}
            aria-label="Send message"
            className="shrink-0 bg-[var(--saas-accent)] text-white hover:bg-[var(--saas-accent)]/90"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-[var(--saas-accent)]/15 text-[var(--saas-accent)]"
            : "bg-[var(--saas-surface)] text-[var(--saas-muted)]"
        )}
        aria-hidden
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      <div
        className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "max-w-[85%] rounded-tr-md bg-[var(--saas-accent)] text-white"
            : "max-w-full min-w-0 flex-1 rounded-tl-md border border-[var(--saas-line)] bg-[var(--saas-surface)] text-[var(--saas-ink)]"
        )}
      >
        <ChatMessageContent content={message.content} role={message.role} />
      </div>
    </div>
  );
}
