import { formatAudioTimestamp } from "../utils/audio-utils";

interface TextBubbleProps {
  text: string;
  time: number;
}

export function TextBubble({ text, time }: TextBubbleProps) {
  return (
    <div className="flex flex-col xl:items-end xl:gap-3 xl:flex-row gap-1">
      <span className="text-xs xl:text-sm">{formatAudioTimestamp(time)}</span>
      <div className="px-3 py-2 xl:px-6 xl:py-4 bg-[#d6e4ef] rounded-lg">
        <p className="text-sm xl:text-lg text-[#4b4b4b]">{text}</p>
      </div>
    </div>
  );
}
