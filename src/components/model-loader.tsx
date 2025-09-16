import { Progress } from "@/components/ui/progress";
import type { ProgressItem } from "@/hooks/useTranscriber";

interface ModelLoaderProps {
  items: ProgressItem[];
  className?: string;
}

export function ModelLoader({ items, className }: ModelLoaderProps) {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <Progress key={index} value={item.progress} />
      ))}
    </div>
  );
}
