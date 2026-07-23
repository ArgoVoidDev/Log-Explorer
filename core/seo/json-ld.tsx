import type { JsonLdData } from "./schema";

type JsonLdProps = {
  data: JsonLdData | JsonLdData[];
  /** Optional id for the script element (debugging / multiple blocks). */
  id?: string;
};

/**
 * Server Component — injects `<script type="application/ld+json">`.
 * Never mark `"use client"`; keeps structured data out of the JS bundle.
 */
export function JsonLd({ data, id }: JsonLdProps) {
  const payload: JsonLdData = Array.isArray(data)
    ? data.length === 1
      ? (data[0] as JsonLdData)
      : {
          "@context": "https://schema.org",
          "@graph": data.map(({ "@context": _c, ...rest }) => rest),
        }
    : data;

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload).replace(/</g, "\\u003c"),
      }}
    />
  );
}
