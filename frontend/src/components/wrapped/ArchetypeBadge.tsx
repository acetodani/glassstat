interface Props {
  name: string;
  emoji: string;
  description: string;
  confidence: number;
  variant?: "primary" | "secondary";
}

export default function ArchetypeBadge({ name, emoji, description, confidence, variant = "primary" }: Props) {
  return (
    <div
      className={`rounded-xl p-5 border ${
        variant === "primary"
          ? "bg-glass-600/10 border-glass-500/30"
          : "bg-gray-900 border-gray-800"
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{emoji}</span>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-gray-500">{confidence}% match</p>
        </div>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
      <div className="mt-3 bg-gray-800 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${variant === "primary" ? "bg-glass-400" : "bg-gray-600"}`}
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  );
}
