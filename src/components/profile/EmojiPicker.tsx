"use client";

const EMOJIS = [
  "🙂", "😎", "🤓", "🧐", "🥸", "😏", "🤩", "😤",
  "🦊", "🐺", "🦁", "🐯", "🐻", "🐼", "🐨", "🦝",
  "🔥", "⚡", "🌊", "🌙", "🌟", "🎯", "🚀", "💎",
  "🎭", "🎨", "📚", "🧠", "💡", "🛡️", "⚔️", "🌿",
];

interface EmojiPickerProps {
  selected: string;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ selected, onSelect, onClose }: EmojiPickerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="w-80 rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-sm font-semibold text-zinc-900">아바타 선택</h3>
        <div className="grid grid-cols-8 gap-1">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => { onSelect(emoji); onClose(); }}
              className={`flex size-9 items-center justify-center rounded-lg text-xl transition-colors hover:bg-zinc-100 ${
                selected === emoji ? "bg-zinc-100 ring-2 ring-zinc-900" : ""
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
