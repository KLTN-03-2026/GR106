export interface CropCardItem {
  bg: string;
  hasToggle: boolean;
}

export const CROP_CARDS: CropCardItem[] = [
  { bg: "#810E0E", hasToggle: true },
  { bg: "#502D2D", hasToggle: false },
  { bg: "#FF1919", hasToggle: false },
];

interface CropCardProps {
  card: CropCardItem;
}

export function CropCard({ card }: CropCardProps) {
  return (
    <div
      className="flex-1 rounded-2xl h-[85px] relative overflow-hidden"
      style={{ background: card.bg }}
    >
      {card.hasToggle && (
        <div className="absolute top-2.5 left-4 bg-[#D9D9D9] rounded-full px-2 h-5 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#679357] inline-block" />
        </div>
      )}
    </div>
  );
}

export default function CropStatusCards() {
  return (
    <div className="flex gap-2.5 w-full">
      {CROP_CARDS.map((card, i) => (
        <CropCard key={i} card={card} />
      ))}
    </div>
  );
}
