/** How a code part is split for stagger animation (GSAP). */
export type CodeRevealMode = "character" | "word" | "delimiter";

/** One segment inside a slide: prose, custom frame, or code (each part = one Space press). */
export type SlidePart =
  | { kind: "prose"; text: string }
  | { kind: "frame"; id: string }
  | {
      kind: "code";
      language: string;
      lines: string[];
      /** Overrides deck default. `delimiter` is a RegExp *source* when mode is `delimiter`. */
      reveal?: CodeRevealMode;
      /** Used when `reveal` is `delimiter` (e.g. `,`, `\\s+`, `;`). */
      delimiter?: string;
      /** CSS `font-family` for this block only. */
      fontFamily?: string;
    };

export type Slide = {
  /** Optional label for your own reference (not shown in UI). */
  id?: string;
  parts: SlidePart[];
};

export type DeckConfig = {
  slides: Slide[];
  /** First Space reveals step 0. If false, step 0 is visible on load. */
  startBlank?: boolean;
  /** Default CSS font stack for code (overridable per code part). */
  codeFontFamily?: string;
  /** Default split mode for code parts. */
  defaultCodeReveal?: CodeRevealMode;
  /** Default RegExp source when mode is `delimiter`. */
  defaultCodeDelimiter?: string;
};

export type LinearStep = {
  slideIndex: number;
  partIndex: number;
  mode: "prose" | "code";
};
