import type { ThemedToken } from "@shikijs/types";
import type { CodeRevealMode } from "./types";

const FALLBACK_TOKEN = {
  content: "",
  color: "#a1a1aa",
} as unknown as ThemedToken;

/**
 * Flattens Shiki token lines to UTF-16 chars (stable length vs `String.split` for delimiter grouping).
 */
export function flattenTokenLinesToChars(
  tokenLines: ThemedToken[][],
): { char: string; token: ThemedToken }[] {
  const out: { char: string; token: ThemedToken }[] = [];
  for (let li = 0; li < tokenLines.length; li++) {
    const line = tokenLines[li];
    for (const t of line) {
      for (let i = 0; i < t.content.length; i++) {
        out.push({ char: t.content[i], token: t });
      }
    }
    if (li < tokenLines.length - 1) {
      const lastTok = line[line.length - 1] ?? FALLBACK_TOKEN;
      out.push({ char: "\n", token: lastTok });
    }
  }
  return out;
}

function groupCharacter(
  chars: { char: string; token: ThemedToken }[],
): { char: string; token: ThemedToken }[][] {
  return chars.map((c) => [c]);
}

function groupWord(
  chars: { char: string; token: ThemedToken }[],
): { char: string; token: ThemedToken }[][] {
  const groups: { char: string; token: ThemedToken }[][] = [];
  let buf: { char: string; token: ThemedToken }[] = [];
  for (const c of chars) {
    if (c.char === "\n") {
      if (buf.length) groups.push(buf);
      buf = [];
      groups.push([c]);
      continue;
    }
    if (/\s/.test(c.char)) {
      if (buf.length) groups.push(buf);
      groups.push([c]);
      buf = [];
    } else {
      buf.push(c);
    }
  }
  if (buf.length) groups.push(buf);
  return groups;
}

function groupDelimiter(
  chars: { char: string; token: ThemedToken }[],
  delimiterSource: string,
): { char: string; token: ThemedToken }[][] {
  const text = chars.map((c) => c.char).join("");
  let re: RegExp;
  try {
    re = new RegExp(`(${delimiterSource})`, "g");
  } catch {
    re = /(\s+)/g;
  }
  const parts = text.split(re).filter((p) => p.length > 0);
  const groups: { char: string; token: ThemedToken }[][] = [];
  let offset = 0;
  for (const part of parts) {
    const n = part.length;
    groups.push(chars.slice(offset, offset + n));
    offset += n;
  }
  return groups;
}

export function buildRevealGroups(
  tokenLines: ThemedToken[][],
  mode: CodeRevealMode,
  delimiterSource: string | undefined,
): { char: string; token: ThemedToken }[][] {
  const chars = flattenTokenLinesToChars(tokenLines);
  if (chars.length === 0) return [];

  if (mode === "character") return groupCharacter(chars);
  if (mode === "word") return groupWord(chars);
  const src = delimiterSource?.trim() ? delimiterSource : "\\s+";
  return groupDelimiter(chars, src);
}
