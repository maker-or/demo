"use client";

import type { ThemedToken } from "@shikijs/types";
import gsap from "gsap";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { BundledLanguage, Highlighter } from "shiki/bundle/web";
import { getSingletonHighlighter } from "shiki/bundle/web";
import { DeckFrameById } from "@/components/deck/DeckFrames";
import { buildLinearSteps, visiblePartsForStep } from "@/deck/buildSteps";
import { buildRevealGroups } from "@/deck/codeReveal";
import type {
  CodeRevealMode,
  DeckConfig,
  LinearStep,
  SlidePart,
} from "@/deck/types";

const DECK_THEME = "github-dark" as const;

const CODE_TEXT =
  "text-[clamp(1.05rem,2.2vw,1.4rem)] leading-[1.5] tracking-tight";

function codeLinesKeyPrefix(
  slideIndex: number,
  partIndex: number,
  lines: string[],
  endExclusive: number,
) {
  return `${slideIndex}-${partIndex}-${lines.slice(0, endExclusive).join("\n")}`;
}

function tokenToStyle(t: ThemedToken): React.CSSProperties {
  if (t.htmlStyle) {
    const h = { ...t.htmlStyle } as Record<string, string | undefined>;
    delete h.background;
    delete h.backgroundColor;
    return h as React.CSSProperties;
  }
  const s: React.CSSProperties = {};
  if (t.color) s.color = t.color;
  if (t.bgColor) s.backgroundColor = "transparent";
  if (t.fontStyle !== undefined && typeof t.fontStyle === "number") {
    const fs = t.fontStyle;
    if (fs & 1) s.fontStyle = "italic";
    if (fs & 2) s.fontWeight = 700;
    if (fs & 4) s.textDecoration = "underline";
  }
  return s;
}

function TokenLine({ tokens }: { tokens: ThemedToken[] }) {
  return (
    <div className="deck-code-line min-h-[1.35em] whitespace-pre">
      {tokens.map((t, i) => (
        <span key={`${t.offset}-${i}`} style={tokenToStyle(t)}>
          {t.content}
        </span>
      ))}
    </div>
  );
}

function LatestReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.fromTo(
      el,
      { opacity: 0, filter: "blur(14px)", y: 6 },
      {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 0.62,
        ease: "power3.out",
      },
    );
  }, []);
  return (
    <div ref={ref} className="will-change-[filter,opacity,transform]">
      {children}
    </div>
  );
}

function CodeStaggerReveal({
  tokenLines,
  mode,
  delimiter,
  animationKey,
}: {
  tokenLines: ThemedToken[][];
  mode: CodeRevealMode;
  delimiter: string | undefined;
  animationKey: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const groups = useMemo(
    () => buildRevealGroups(tokenLines, mode, delimiter),
    [tokenLines, mode, delimiter],
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = root.querySelectorAll(".deck-reveal-unit");
    gsap.killTweensOf(targets);
    gsap.fromTo(
      targets,
      { opacity: 0, filter: "blur(10px)", y: 2 },
      {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 0.26,
        stagger: 0.014,
        ease: "power2.out",
      },
    );
  }, []);

  return (
    <div ref={rootRef} className={`whitespace-pre ${CODE_TEXT}`}>
      {groups.map((group, i) => {
        const base = groups.slice(0, i).reduce((sum, g) => sum + g.length, 0);
        const unitKey = `${animationKey}-u-${base}`;
        return (
          <span key={unitKey} className="deck-reveal-unit inline">
            {group.map((seg, idx) => (
              <span
                key={`${animationKey}-c-${base + idx}-${seg.token.offset}`}
                style={tokenToStyle(seg.token)}
              >
                {seg.char}
              </span>
            ))}
          </span>
        );
      })}
    </div>
  );
}

function ProseBlock({ text }: { text: string }) {
  return (
    <p className="deck-prose mt-6 max-w-[52ch] text-left text-[clamp(1rem,2.5vw,1.25rem)] leading-relaxed tracking-tight text-zinc-300 first:mt-0">
      {text}
    </p>
  );
}

function CodePartView({
  part,
  partIndex,
  slideIndex,
  highlighter,
  stepIndex,
  linearStep,
  deckConfig,
}: {
  part: Extract<SlidePart, { kind: "code" }>;
  partIndex: number;
  slideIndex: number;
  highlighter: Highlighter | null;
  stepIndex: number;
  linearStep: LinearStep;
  deckConfig: DeckConfig;
}) {
  const { lines, language } = part;
  const code = lines.join("\n");
  const [tokenLines, setTokenLines] = useState<ThemedToken[][] | null>(null);

  const revealMode: CodeRevealMode =
    part.reveal ?? deckConfig.defaultCodeReveal ?? "character";
  const delimiter = part.delimiter ?? deckConfig.defaultCodeDelimiter ?? "\\s+";
  const fontFamily =
    part.fontFamily ??
    deckConfig.codeFontFamily ??
    "var(--font-geist-mono), ui-monospace, monospace";

  useEffect(() => {
    if (!highlighter) return;
    let cancelled = false;
    const run = async () => {
      const res = await highlighter.codeToTokens(code, {
        lang: language as BundledLanguage,
        theme: DECK_THEME,
      });
      if (!cancelled) setTokenLines(res.tokens);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [highlighter, code, language]);

  if (!highlighter) {
    return (
      <pre
        className={`deck-pre mt-6 overflow-x-auto border-0 bg-transparent p-0 text-left ${CODE_TEXT} first:mt-0`}
        style={{ fontFamily }}
      >
        <code>
          {lines.map((_, lineIdx) => (
            <div
              key={`sk-${codeLinesKeyPrefix(slideIndex, partIndex, lines, lineIdx + 1)}`}
              className="deck-code-line min-h-[1.35em] bg-transparent"
              aria-hidden
            />
          ))}
        </code>
      </pre>
    );
  }

  const isLatestPart =
    linearStep.mode === "code" && linearStep.partIndex === partIndex;

  const animKey = `${slideIndex}-${partIndex}-${stepIndex}`;

  return (
    <pre
      className={`deck-pre mt-6 overflow-x-auto border-0 bg-transparent p-0 text-left ${CODE_TEXT} first:mt-0`}
      style={{ fontFamily }}
    >
      <code>
        {tokenLines === null ? (
          lines.map((_, lineIdx) => (
            <div
              key={`sk-${codeLinesKeyPrefix(slideIndex, partIndex, lines, lineIdx + 1)}`}
              className="deck-code-line min-h-[1.35em] bg-transparent"
              aria-hidden
            />
          ))
        ) : isLatestPart ? (
          <CodeStaggerReveal
            tokenLines={tokenLines}
            mode={revealMode}
            delimiter={revealMode === "delimiter" ? delimiter : undefined}
            animationKey={animKey}
          />
        ) : (
          lines.map((_, lineIdx) => {
            const lineTok = tokenLines[lineIdx] ?? [];
            const lineKey = codeLinesKeyPrefix(
              slideIndex,
              partIndex,
              lines,
              lineIdx + 1,
            );
            return (
              <div key={`row-${lineKey}`}>
                <TokenLine tokens={lineTok} />
              </div>
            );
          })
        )}
      </code>
    </pre>
  );
}

function SlideBody({
  slideIndex,
  parts,
  highlighter,
  stepIndex,
  linearStep,
  deckConfig,
}: {
  slideIndex: number;
  parts: SlidePart[];
  highlighter: Highlighter | null;
  stepIndex: number;
  linearStep: LinearStep;
  deckConfig: DeckConfig;
}) {
  return (
    <div className="flex flex-col">
      {parts.map((part, partIndex) => {
        const partKey = `${slideIndex}-${part.kind}-${partIndex}-${
          part.kind === "prose"
            ? part.text
            : part.kind === "frame"
              ? part.id
              : part.lines.join("\n")
        }`;
        if (part.kind === "prose") {
          const isLatest =
            linearStep.mode === "prose" && linearStep.partIndex === partIndex;
          const block = <ProseBlock text={part.text} />;
          if (isLatest) {
            return (
              <LatestReveal key={`${partKey}-latest-${stepIndex}`}>
                {block}
              </LatestReveal>
            );
          }
          return <div key={partKey}>{block}</div>;
        }

        if (part.kind === "frame") {
          const isLatest =
            linearStep.mode === "prose" && linearStep.partIndex === partIndex;
          const fullBleed =
            part.id === "oauth-app-config" || part.id === "oauth-signin";
          const block = (
            <div
              className={`deck-frame mt-6 first:mt-0 ${fullBleed ? "deck-frame-fullbleed -mt-2" : ""}`}
            >
              <DeckFrameById id={part.id} />
            </div>
          );
          if (isLatest) {
            return (
              <LatestReveal key={`${partKey}-latest-${stepIndex}`}>
                {block}
              </LatestReveal>
            );
          }
          return <div key={partKey}>{block}</div>;
        }

        return (
          <CodePartView
            key={partKey}
            part={part}
            partIndex={partIndex}
            slideIndex={slideIndex}
            highlighter={highlighter}
            stepIndex={stepIndex}
            linearStep={linearStep}
            deckConfig={deckConfig}
          />
        );
      })}
    </div>
  );
}

function DeckFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="deck-root relative min-h-dvh w-full bg-[#000] text-zinc-100">
      <div
        className="pointer-events-none absolute inset-[clamp(1rem,4vw,2.5rem)] border-t border-b border-zinc-500/50"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-[clamp(1rem,4vw,2.5rem)] border-l-[3px] border-zinc-500/35"
        style={{ boxShadow: "3px 0 0 0 rgba(161,161,170,0.22)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-[clamp(1rem,4vw,2.5rem)] border-r-[3px] border-zinc-500/35"
        style={{ boxShadow: "-3px 0 0 0 rgba(161,161,170,0.22)" }}
        aria-hidden
      />

      <div className="relative z-[1] flex min-h-dvh w-full flex-col items-start justify-start px-[clamp(1rem,4vw,3rem)] pb-[clamp(1.25rem,4vw,2.5rem)] pt-[clamp(1.25rem,4vw,2.5rem)]">
        <div className="w-full max-w-[min(56rem,92vw)] text-left [&:has(.deck-frame-fullbleed)]:max-w-[min(96rem,98vw)]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function DeckPresentation({ config }: { config: DeckConfig }) {
  const { slides, startBlank = false } = config;
  const linearSteps = useMemo(() => buildLinearSteps(slides), [slides]);
  const maxIndex = linearSteps.length - 1;

  const [stepIndex, setStepIndex] = useState(() =>
    startBlank || linearSteps.length === 0 ? -1 : 0,
  );
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getSingletonHighlighter({
      themes: [DECK_THEME],
      langs: ["typescript", "tsx", "javascript", "json", "bash", "shell"],
    }).then((h) => {
      if (!cancelled) setHighlighter(h);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("deck-present");
    return () => {
      document.documentElement.classList.remove("deck-present");
    };
  }, []);

  useEffect(() => {
    if (linearSteps.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== " ") return;
      e.preventDefault();
      setStepIndex((prev) => {
        if (prev >= maxIndex) return prev;
        return prev + 1;
      });
    };
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [maxIndex, linearSteps.length]);

  const view =
    stepIndex >= 0 && stepIndex <= maxIndex
      ? visiblePartsForStep(slides, linearSteps, stepIndex)
      : null;

  const linearStep = stepIndex >= 0 ? linearSteps[stepIndex] : null;

  if (linearSteps.length === 0) {
    return (
      <DeckFrame>
        <div className="min-h-[40vh]" aria-hidden />
      </DeckFrame>
    );
  }

  const canShowSlide =
    view &&
    linearStep &&
    (highlighter !== null ||
      !view.parts.some((p) => p.kind === "code"));

  return (
    <DeckFrame>
      {!canShowSlide && <div className="min-h-[40vh]" aria-hidden />}
      {canShowSlide && view && linearStep && (
        <SlideBody
          slideIndex={view.slideIndex}
          parts={view.parts}
          highlighter={highlighter}
          stepIndex={stepIndex}
          linearStep={linearStep}
          deckConfig={config}
        />
      )}
      {highlighter && !view && startBlank && stepIndex < 0 && (
        <div className="min-h-[40vh]" aria-hidden />
      )}
    </DeckFrame>
  );
}
