import { useRef, useEffect } from "react";

import type { TranscriberData } from "../hooks/use-transcriber";
import { TextBubble } from "./text-bubble";
import { getTimestamp } from "../utils/get-timestamp";

interface TranscriptProps {
  output: TranscriberData | undefined;
  setActivePage: React.Dispatch<React.SetStateAction<number>>;
  setBackToHome: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Transcript({
  output,
  setActivePage,
  setBackToHome,
}: TranscriptProps) {
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
    let chunks = output?.chunks ?? [];
    let text = chunks
      .map((chunk) => chunk.text)
      .join("")
      .trim();

    const blob = new Blob([text], { type: "text/plain" });
    saveBlob(blob, `transcript_${getTimestamp()}.txt`);
  };

  const exportJSON = () => {
    let jsonData = JSON.stringify(output?.chunks ?? [], null, 2);

    const regex = /(    "timestamp": )\[\s+(\S+)\s+(\S+)\s+\]/gm;
    jsonData = jsonData.replace(regex, "$1[$2 $3]");

    const blob = new Blob([jsonData], { type: "application/json" });
    saveBlob(blob, `transcript_${getTimestamp()}.json`);
  };

  useEffect(() => {
    if (viewportRef.current) {
      const diff = Math.abs(
        viewportRef.current.offsetHeight +
          viewportRef.current.scrollTop -
          viewportRef.current.scrollHeight
      );

      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;

      if (diff <= 64) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
      }
    }
  });

  return (
    <div className="w-full h-full flex flex-col px-2 md:px-32 xl:pl-8 xl:pr-0 pt-8 pb-9 space-y-5">
      <button
        className="duo-button go-to-home xl:hidden h-12 z-1"
        onClick={() => {
          setBackToHome(true);
          setActivePage(0);
        }}
      >
        <span className="text-[#4b4b4b]">{"<<<"} Back to Home</span>
      </button>

      <div className="w-full flex xl:hidden flex-row space-x-2">
        <button
          className="duo-button select-button h-10 z-1"
          onClick={exportTXT}
          disabled={!output || output.isBusy}
        >
          <span className="text-[#4b4b4b]">Export TXT</span>
        </button>
        <button
          className="duo-button select-button h-10 z-1"
          onClick={exportJSON}
          disabled={!output || output.isBusy}
        >
          <span className="text-[#4b4b4b]">Export JSON</span>
        </button>
      </div>

      <div
        ref={viewportRef}
        className="w-full h-full border-2 border-b-4 p-5 xl:p-10 border-[#37464F] bg-[#131f24] space-y-6 xl:space-y-8 overflow-y-scroll rounded-lg"
      >
        {output?.chunks &&
          output.chunks.map((chunk, index) => (
            <TextBubble
              key={`${index}-${chunk.text}`}
              text={chunk.text}
              time={chunk.timestamp[0]}
            />
          ))}
      </div>

      <div className="w-full hidden xl:flex flex-row space-x-2">
        <button
          className="duo-button select-button h-12 z-1"
          onClick={exportTXT}
          disabled={!output || output.isBusy}
        >
          <span className="text-[#4b4b4b]">Export TXT</span>
        </button>
        <button
          className="duo-button select-button h-12 z-1"
          onClick={exportJSON}
          disabled={!output || output.isBusy}
        >
          <span className="text-[#4b4b4b]">Export JSON</span>
        </button>
      </div>
    </div>
  );
}
