"use client";

import dynamic from "next/dynamic";
import type { DeckConfig } from "@/deck/types";

const DeckPresentation = dynamic(
  () => import("@/components/deck/DeckPresentation"),
  { ssr: false },
);

export function DeckLoader({ config }: { config: DeckConfig }) {
  return <DeckPresentation config={config} />;
}
