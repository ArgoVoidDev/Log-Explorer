import {
  AlertCircle,
  Clock3,
  FileText,
  Unplug,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@core/lib/utils";

type SectionKey = "ROOT CAUSE" | "TIMELINE" | "IMPACT" | "EVIDENCE";

const SECTION_HEADERS: SectionKey[] = [
  "ROOT CAUSE",
  "TIMELINE",
  "IMPACT",
  "EVIDENCE",
];

const SECTION_META: Record<
  SectionKey,
  { label: string; icon: LucideIcon; accentClass: string }
> = {
  "ROOT CAUSE": {
    label: "Root cause",
    icon: AlertCircle,
    accentClass: "border-amber-400/70 bg-amber-50/80 text-amber-950",
  },
  TIMELINE: {
    label: "Timeline",
    icon: Clock3,
    accentClass: "border-[var(--saas-accent)]/40 bg-[var(--saas-panel)]",
  },
  IMPACT: {
    label: "Impact",
    icon: Unplug,
    accentClass: "border-red-300/70 bg-red-50/60 text-red-950",
  },
  EVIDENCE: {
    label: "Evidence",
    icon: FileText,
    accentClass: "border-[var(--saas-line)] bg-[var(--saas-surface)]",
  },
};

function parseStructuredAnswer(
  content: string
): Partial<Record<SectionKey, string>> | null {
  const matches = [
    ...content.matchAll(/^(ROOT CAUSE|TIMELINE|IMPACT|EVIDENCE):\s*$/gm),
  ];

  if (matches.length === 0) {
    return null;
  }

  const sections: Partial<Record<SectionKey, string>> = {};

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const key = match?.[1] as SectionKey | undefined;
    const start = match?.index;

    if (!key || start === undefined) {
      continue;
    }

    const bodyStart = start + match[0].length;
    const nextMatch = matches[index + 1];
    const bodyEnd =
      nextMatch?.index !== undefined ? nextMatch.index : content.length;

    sections[key] = content.slice(bodyStart, bodyEnd).trim();
  }

  return sections["ROOT CAUSE"] ? sections : null;
}

function parseBulletItems(text: string): string[] {
  const items: string[] = [];

  for (const line of text.split("\n")) {
    const trimmed = line.trim();

    if (trimmed.startsWith("- ")) {
      items.push(trimmed.slice(2).trim());
    }
  }

  return items;
}

function parseParagraph(text: string): string {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("- "))
    .join("\n")
    .trim();
}

function stripQuotes(text: string): string {
  return text.replace(/^["']|["']$/g, "").trim();
}

function extractLeadingTimestamp(text: string): {
  timestamp: string | null;
  body: string;
} {
  const match = text.match(/^\[([^\]]+)\]\s*(.*)$/s);

  if (!match) {
    return { timestamp: null, body: text };
  }

  return {
    timestamp: match[1] ?? null,
    body: match[2]?.trim() ?? text,
  };
}

function SectionHeader({
  sectionKey,
}: {
  sectionKey: SectionKey;
}) {
  const meta = SECTION_META[sectionKey];
  const Icon = meta.icon;

  return (
    <div className="mb-2 flex items-center gap-2">
      <span
        className={cn(
          "inline-flex size-6 items-center justify-center rounded-md",
          sectionKey === "ROOT CAUSE" && "bg-amber-100 text-amber-700",
          sectionKey === "TIMELINE" && "bg-[var(--saas-accent)]/10 text-[var(--saas-accent)]",
          sectionKey === "IMPACT" && "bg-red-100 text-red-700",
          sectionKey === "EVIDENCE" && "bg-[var(--saas-surface)] text-[var(--saas-muted)]"
        )}
      >
        <Icon className="size-3.5" aria-hidden />
      </span>
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--saas-muted)]">
        {meta.label}
      </h4>
    </div>
  );
}

function StructuredAnswer({ content }: { content: string }) {
  const sections = parseStructuredAnswer(content);

  if (!sections) {
    return (
      <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
    );
  }

  return (
    <div className="space-y-4">
      {SECTION_HEADERS.map((sectionKey) => {
        const body = sections[sectionKey];

        if (!body) {
          return null;
        }

        const meta = SECTION_META[sectionKey];
        const bullets = parseBulletItems(body);
        const paragraph = parseParagraph(body);

        return (
          <section
            key={sectionKey}
            className={cn(
              "rounded-xl border px-3.5 py-3",
              meta.accentClass
            )}
          >
            <SectionHeader sectionKey={sectionKey} />

            {sectionKey === "ROOT CAUSE" ? (
              <p className="text-[15px] font-medium leading-relaxed">
                {paragraph || body}
              </p>
            ) : null}

            {sectionKey === "TIMELINE" && bullets.length > 0 ? (
              <ol className="space-y-3">
                {bullets.map((item, index) => {
                  const { timestamp, body: itemBody } =
                    extractLeadingTimestamp(item);

                  return (
                    <li key={`${index}-${item}`} className="flex gap-3">
                      <div className="flex flex-col items-center pt-1.5">
                        <span className="size-2 shrink-0 rounded-full bg-[var(--saas-accent)]" />
                        {index < bullets.length - 1 ? (
                          <span className="mt-1 w-px flex-1 bg-[var(--saas-line)]" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1 pb-1 leading-relaxed">
                        {timestamp ? (
                          <time className="mb-1 block font-mono text-[11px] font-medium text-[var(--saas-accent)]">
                            {timestamp}
                          </time>
                        ) : null}
                        <span>{itemBody || item}</span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : null}

            {sectionKey === "IMPACT" && bullets.length > 0 ? (
              <ul className="space-y-1.5 leading-relaxed">
                {bullets.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-red-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {sectionKey === "EVIDENCE" && bullets.length > 0 ? (
              <ul className="space-y-2">
                {bullets.map((item) => (
                  <li key={item}>
                    <code className="block overflow-x-auto rounded-lg border border-[var(--saas-line)] bg-[var(--saas-panel)] px-3 py-2 font-mono text-[11px] leading-relaxed text-[var(--saas-ink)]">
                      {stripQuotes(item)}
                    </code>
                  </li>
                ))}
              </ul>
            ) : null}

            {sectionKey !== "ROOT CAUSE" &&
            bullets.length === 0 &&
            paragraph ? (
              <p className="leading-relaxed">{paragraph}</p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

export type ChatMessageContentProps = {
  content: string;
  role: "user" | "ai";
};

export function ChatMessageContent({
  content,
  role,
}: ChatMessageContentProps) {
  if (role === "user") {
    return <p className="leading-relaxed">{content}</p>;
  }

  return (
    <div dir="auto" className="text-sm">
      <StructuredAnswer content={content} />
    </div>
  );
}
