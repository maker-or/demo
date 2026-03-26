import { DeckLoader } from "@/components/deck/DeckLoader";
import { deck } from "@/deck/slides";

export default function Home() {
  return <DeckLoader config={deck} />;
}
