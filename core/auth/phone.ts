const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Convert Persian/Arabic digits to Western. */
export function toWesternDigits(value: string): string {
  return value
    .split("")
    .map((ch) => {
      const p = PERSIAN_DIGITS.indexOf(ch);
      if (p >= 0) return String(p);
      const a = ARABIC_DIGITS.indexOf(ch);
      if (a >= 0) return String(a);
      return ch;
    })
    .join("");
}

/**
 * Normalize Iranian mobile to canonical `09XXXXXXXXX` (11 digits).
 * Accepts 09…, 9…, +989…, 00989…
 */
export function normalizeIranMobile(input: string): string | null {
  const raw = toWesternDigits(input.trim());
  const digits = raw.replace(/\D/g, "");

  let national: string | null = null;

  if (digits.startsWith("98") && digits.length === 12) {
    national = digits.slice(2);
  } else if (digits.startsWith("0098") && digits.length === 14) {
    national = digits.slice(4);
  } else if (digits.startsWith("0") && digits.length === 11) {
    national = digits.slice(1);
  } else if (digits.length === 10 && digits.startsWith("9")) {
    national = digits;
  }

  if (!national || national.length !== 10 || !/^9\d{9}$/.test(national)) {
    return null;
  }

  return `0${national}`;
}

/** True if the identifier looks like a phone rather than an email. */
export function looksLikePhone(identifier: string): boolean {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) return false;
  const digits = toWesternDigits(trimmed).replace(/\D/g, "");
  return digits.length >= 10;
}
