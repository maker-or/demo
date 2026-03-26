import type { DeckConfig } from "./types";

/**
 * Each slide is an ordered list of parts. One Space = one part (prose block or full code block).
 * Code parts: optional `reveal: "character" | "word" | "delimiter"` and `delimiter` (RegExp source).
 */
export const deck: DeckConfig = {
  startBlank: false,
  defaultCodeReveal: "character",
  codeFontFamily: "var(--font-geist-mono), ui-monospace, monospace",
  slides: [
    {
      id: "oauth-app",
      parts: [{ kind: "frame", id: "oauth-app-config" }],
    },
    {
      id: "oauth-credentials-slide",
      parts: [{ kind: "frame", id: "oauth-credentials" }],
    },
    {
      id: "oauth-signin-slide",
      parts: [{ kind: "frame", id: "oauth-signin" }],
    },
    {
      id: "intro",
      parts: [
        {
          kind: "code",
          language: "typescript",
          lines: ['import { create } from "polaris/ai"'],
        },
        {
          kind: "code",
          language: "typescript",
          lines: [
            "const polaris = create({",
            "  accessToken: process.env.POLARIS_ACCESS_TOKEN,",
            "  refreshToken: process.env.POLARIS_REFRESH_TOKEN,",
            "})",
          ],
        },
        {
          kind: "code",
          language: "typescript",
          lines: [
            "const res = polaris.generate({",
            "  model: 'gpt-5.4',",
            "  provider: 'openai',",
            "  class: 'frontier',",
            '  system: " You are a helpful AI assistant.",',
            '  message: "Wht is vibecon",',
            "  stream: true,",
            "})",
          ],
        },
      ],
    },
    {
      id: "usage",
      parts: [
        {
          kind: "prose",
          text: "Progressive reveals: Space advances one prose block or one full code part.",
        },
        {
          kind: "code",
          language: "typescript",
          lines: [
            "const client = create({",
            "  apiKey: process.env.KEY!,",
            "})",
            "",
            "await client.run()",
          ],
        },
      ],
    },
  ],
};
