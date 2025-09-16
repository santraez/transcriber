import { useRef, useEffect } from "react";

import type { TranscriberData } from "../hooks/useTranscriber";
import { ScrollArea } from "./ui/scroll-area";
import { TextBubble } from "./text-bubble";
import { Button } from "./ui/button";

interface Props {
  transcribedData: TranscriberData | undefined;
}

export default function Transcript({ transcribedData }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);

  const saveBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportTXT = () => {
    let chunks = transcribedData?.chunks ?? [];
    let text = chunks
      .map((chunk) => chunk.text)
      .join("")
      .trim();

    const blob = new Blob([text], { type: "text/plain" });
    saveBlob(blob, "transcript.txt");
  };

  const exportJSON = () => {
    let jsonData = JSON.stringify(transcribedData?.chunks ?? [], null, 2);

    // post-process the JSON to make it more readable
    const regex = /(    "timestamp": )\[\s+(\S+)\s+(\S+)\s+\]/gm;
    jsonData = jsonData.replace(regex, "$1[$2 $3]");

    const blob = new Blob([jsonData], { type: "application/json" });
    saveBlob(blob, "transcript.json");
  };

  // Scroll to the bottom when the component updates
  useEffect(() => {
    if (viewportRef.current) {
      // const diff = Math.abs(
      //   viewportRef.current.offsetHeight +
      //     viewportRef.current.scrollTop -
      //     viewportRef.current.scrollHeight
      // );

      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;

      // if (diff <= 64) {
      //   viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
      // }
    }
  });

  return (
    <div className="w-full">
      <ScrollArea
        viewportRef={viewportRef}
        className="w-full h-72 rounded-md border p-4"
      >
        {transcribedData?.chunks &&
          transcribedData.chunks.map((chunk, i) => (
            <TextBubble
              key={`${i}-${chunk.text}`}
              text={chunk.text}
              time={chunk.timestamp[0]}
            />
          ))}
      </ScrollArea>
      {transcribedData && !transcribedData.isBusy && (
        <div>
          <Button onClick={exportTXT} className="px-4 py-2">
            Export TXT
          </Button>
          <Button onClick={exportJSON} className="px-4 py-2">
            Export JSON
          </Button>
        </div>
      )}
    </div>
  );
}
