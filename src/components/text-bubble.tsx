import { formatAudioTimestamp } from "../utils/AudioUtils";

interface TextBubbleProps {
  text: string;
  time: number;
}

export function TextBubble({ text, time }: TextBubbleProps) {
  return (
    <div className="flex gap-3 mt-5">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          {formatAudioTimestamp(time)}
        </span>
        <div className="rounded-lg px-3 py-2 max-w-sm bg-muted">
          <p className="text-sm">{text}</p>
        </div>
      </div>
    </div>
  );
}
