import { useState } from "react";
import { AudioPlayer } from "../components/audio-player";
import { TabSwitch } from "./tab-switch";
import type { Transcriber } from "../hooks/use-transcriber";

interface AudioManagerProps {
  transcriber: Transcriber;
  setActivePage: React.Dispatch<React.SetStateAction<number>>;
  setBackToHome: React.Dispatch<React.SetStateAction<boolean>>;
}

type AudioSource = "URL" | "FILE" | "RECORDING";

export interface TrackData {
  buffer: AudioBuffer;
  url: string;
  source: AudioSource;
  mimeType: string;
}

const LANGUAGES = {
  en: "english",
  es: "spanish",
  fr: "french",
};

const MODELS = { tiny: "Xenova/whisper-tiny", base: "Xenova/whisper-base" };

export function AudioManager({
  transcriber,
  setActivePage,
  setBackToHome,
}: AudioManagerProps) {
  const [trackData, setTrackData] = useState<TrackData>();

  const [activeLang, setActiveLang] = useState<number>(0);
  const [activeModel, setActiveModel] = useState<number>(0);

  return (
    <div className="w-full flex flex-col px-2 md:px-32 xl:pr-8 xl:pl-0 pb-9 space-y-5 xl:space-y-8 xl:h-full">
      <div className="xl:hidden">
        <TabSwitch
          transcriber={transcriber}
          trackData={trackData}
          setTrackData={setTrackData}
        />
      </div>
      <div className="hidden xl:block">
        <TabSwitch
          height={220}
          transcriber={transcriber}
          trackData={trackData}
          setTrackData={setTrackData}
        />
      </div>

      <div className="w-full flex flex-row gap-x-2">
        <div className="xl:hidden">
          {!transcriber.output ? (
            <AudioPlayer url={trackData?.url} mimeType={trackData?.mimeType} />
          ) : null}
        </div>

        <div className="hidden xl:block">
          <AudioPlayer url={trackData?.url} mimeType={trackData?.mimeType} />
        </div>

        <button
          className="flex duo-button transcript-button flex-1! h-16 xl:h-20 text-lg! z-1"
          onClick={() => {
            if (navigator.vibrate) {
              navigator.vibrate(50);
            }

            if (!transcriber.isBusy && !transcriber.isModelLoading) {
              transcriber.start(trackData!.buffer);
              setBackToHome(false);
            }
          }}
          disabled={!trackData || transcriber.isBusy}
        >
          <span>
            {transcriber.isModelLoading
              ? "Loading model..."
              : transcriber.isBusy
              ? "Transcribing..."
              : "Transcribe Audio"}
          </span>
        </button>

        <div className="xl:hidden">
          {transcriber.output ? (
            <button
              className="duo-button go-to-transcript w-16! h-16 aspect-square z-1"
              onClick={() => {
                if (navigator.vibrate) {
                  navigator.vibrate(50);
                }

                setActivePage(1);
              }}
            >
              <span className="text-[#4b4b4b] text-xl">{">>>"}</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="w-full flex flex-col space-y-4 xl:space-y-8">
        <div className="w-full flex flex-col bg-[#131f24] p-5 pt-2 pb-4 xl:p-[22px] xl:pt-[22px] xl:pb-[22px] space-y-1 rounded-lg">
          <span className="opacity-50">Select the source language</span>
          <div className="w-full flex flex-row space-x-2">
            {Object.entries(LANGUAGES).map(([language, name], index) => (
              <button
                key={index}
                className={`
                flex
                duo-button
                select-button
                h-10!
                xl:h-12!
                z-1!
                ${index === activeLang ? "active-select-button" : ""}
              `}
                onClick={() => {
                  setActiveLang(index);
                  transcriber.setLanguage(language);

                  if (language !== "en") {
                    transcriber.setMultilingual(true);
                  } else {
                    transcriber.setMultilingual(false);
                  }

                  if (navigator.vibrate && index !== activeLang) {
                    navigator.vibrate(50);
                  }
                }}
                disabled={!trackData || transcriber.isBusy}
              >
                <span
                  className={`text-[#4b4b4b] ${
                    index === activeLang ? "brightness-[0.9]" : ""
                  }`}
                >
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full flex flex-col bg-[#131f24] p-5 pt-2 pb-4 xl:p-[22px] xl:pt-[22px] xl:pb-[22px] space-y-1 rounded-lg">
          <span className="opacity-50">Select the model to use</span>
          <div className="w-full flex flex-row space-x-2">
            {Object.entries(MODELS).map(([name, model], index) => (
              <button
                key={index}
                className={`
                flex
                duo-button
                select-button
                h-10!
                xl:h-12!
                z-1!
                ${index === activeModel ? "active-select-button" : ""}
              `}
                onClick={() => {
                  setActiveModel(index);
                  transcriber.setModel(model);

                  if (navigator.vibrate && index !== activeModel) {
                    navigator.vibrate(50);
                  }
                }}
                disabled={!trackData || transcriber.isBusy}
              >
                <span
                  className={`text-[#4b4b4b] ${
                    index === activeModel ? "brightness-[0.9]" : ""
                  }`}
                >
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
