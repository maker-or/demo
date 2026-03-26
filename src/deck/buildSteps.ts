import type { LinearStep, Slide } from "./types";

export function buildLinearSteps(slides: Slide[]): LinearStep[] {
  const out: LinearStep[] = [];
  for (let s = 0; s < slides.length; s++) {
    const parts = slides[s].parts;
    for (let p = 0; p < parts.length; p++) {
      const part = parts[p];
      if (part.kind === "prose" || part.kind === "frame") {
        out.push({ slideIndex: s, partIndex: p, mode: "prose" });
      } else {
        out.push({ slideIndex: s, partIndex: p, mode: "code" });
      }
    }
  }
  return out;
}

export function visiblePartsForStep(
  slides: Slide[],
  linearSteps: LinearStep[],
  stepIndex: number,
): { slideIndex: number; parts: Slide["parts"] } | null {
  if (stepIndex < 0 || stepIndex >= linearSteps.length) {
    return null;
  }
  const sIdx = linearSteps[stepIndex].slideIndex;
  const relevant = linearSteps
    .slice(0, stepIndex + 1)
    .filter((x) => x.slideIndex === sIdx);
  const slide = slides[sIdx];
  const partStates = new Map<number, Slide["parts"][number]>();

  for (const r of relevant) {
    const def = slide.parts[r.partIndex];
    if (r.mode === "prose") {
      partStates.set(r.partIndex, def);
    } else if (r.mode === "code") {
      const c = def as Extract<Slide["parts"][number], { kind: "code" }>;
      partStates.set(r.partIndex, { ...c, lines: c.lines });
    }
  }

  const keys = [...partStates.keys()].sort((a, b) => a - b);
  const parts: Slide["parts"] = [];
  for (const k of keys) {
    const p = partStates.get(k);
    if (p) parts.push(p);
  }
  return {
    slideIndex: sIdx,
    parts,
  };
}
