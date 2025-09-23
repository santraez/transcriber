import { useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  url?: string;
  mimeType?: string;
}

export function AudioPlayer({ url, mimeType }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;

    setIsPlaying(false);
  }, [url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
    };
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  });

  return (
    <div className="w-16 xl:w-20">
      <button
        className="flex duo-button player-button h-16 xl:h-20 aspect-square z-1"
        onClick={togglePlayPause}
        disabled={!url}
      >
        <span className="text-[#4b4b4b]">
          {isPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 16 16"
            >
              <path
                fill="currentColor"
                d="M5 1.5A1.5 1.5 0 0 1 6.5 3v10A1.5 1.5 0 0 1 5 14.5H3A1.5 1.5 0 0 1 1.5 13V3A1.5 1.5 0 0 1 3 1.5zm8 0A1.5 1.5 0 0 1 14.5 3v10a1.5 1.5 0 0 1-1.5 1.5h-2A1.5 1.5 0 0 1 9.5 13V3A1.5 1.5 0 0 1 11 1.5z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 16 16"
            >
              <path
                fill="currentColor"
                d="M14.642 6.285c1.294.777 1.294 2.653 0 3.43l-9.113 5.468c-1.333.8-3.028-.16-3.029-1.715V2.532C2.5.978 4.196.018 5.53.818z"
              />
            </svg>
          )}
        </span>
      </button>
      {url ? (
        <audio ref={audioRef} className="hidden" controls={false}>
          <source src={url} type={mimeType} />
        </audio>
      ) : null}
    </div>
  );
}
