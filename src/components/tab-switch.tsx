import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { formatAudioTimestamp } from "../utils/audio-utils";
import type { TrackData } from "../components/audio-manager";
import type { Transcriber } from "../hooks/use-transcriber";

interface TabSwitchProps {
  height?: number;
  trackData: TrackData | undefined;
  setTrackData: React.Dispatch<React.SetStateAction<TrackData | undefined>>;
  transcriber: Transcriber;
}

export function TabSwitch({
  height = 180,
  trackData,
  setTrackData,
  transcriber,
}: TabSwitchProps) {
  const [audioUrl, setAudioUrl] = useState<string>();

  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  const [progress, setProgress] = useState<number>();
  const [_fileName, setFileName] = useState<string>();
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const isLoading = typeof progress !== "undefined";

  const loadAudioFromUrl = async (requestAbortController: AbortController) => {
    if (!audioUrl) return;

    try {
      setTrackData(undefined);
      setProgress(0);

      const { data: audioData, headers } = (await axios.get(audioUrl, {
        signal: requestAbortController.signal,
        responseType: "arraybuffer",
        onDownloadProgress(progressEvent) {
          setProgress(progressEvent.progress || 0);
        },
      })) as {
        data: ArrayBuffer;
        headers: { "content-type"?: string };
      };

      let mimeType = headers["content-type"];
      if (!mimeType || mimeType === "audio/wave") {
        mimeType = "audio/wav";
      }

      const blobUrl = URL.createObjectURL(
        new Blob([audioData], { type: "audio/*" })
      );

      const audioCTX = new AudioContext({ sampleRate: 16_000 });
      const decoded = await audioCTX.decodeAudioData(audioData);

      setTrackData({
        buffer: decoded,
        url: blobUrl,
        source: "URL",
        mimeType: mimeType,
      });
    } catch (error) {
      console.log("Request failed or aborted", error);
    } finally {
      setAudioUrl(undefined);
      setProgress(undefined);
    }
  };

  useEffect(() => {
    if (!audioUrl) return;

    const requestAbortController = new AbortController();
    loadAudioFromUrl(requestAbortController);

    return () => {
      requestAbortController.abort();
    };
  }, [audioUrl]);

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (recording) {
      const timer = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1_000);

      return () => {
        clearInterval(timer);
      };
    }

    return () => {
      if (stream) {
        // @ts-ignore
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [recording]);

  const loadAudioFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrackData(undefined);
    setProgress(undefined);

    const file = e.target.files?.[0];
    if (!file) return;

    const audio = file.type.includes("audio");
    const video = file.type.includes("video");
    if (!audio && !video) return; // add feedback

    const blobUrl = URL.createObjectURL(file);
    const mimeType = file.type;

    setFileName(file.name);

    const reader = new FileReader();
    reader.addEventListener("load", async (e) => {
      const audioData = e.target?.result as ArrayBuffer;
      if (!audioData) return;

      const audioCTX = new AudioContext({ sampleRate: 16_000 });
      const decoded = await audioCTX.decodeAudioData(audioData);

      transcriber.onInputChange();
      setTrackData({
        buffer: decoded,
        url: blobUrl,
        source: "FILE",
        mimeType: mimeType,
      });
    });
    reader.readAsArrayBuffer(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const loadAudioFromBlob = async (data: Blob) => {
    setTrackData(undefined);
    setProgress(undefined);

    const blobUrl = URL.createObjectURL(data);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const audioData = reader.result as ArrayBuffer;

      const audioCTX = new AudioContext({ sampleRate: 16_000 });
      const decoded = await audioCTX.decodeAudioData(audioData);

      transcriber.onInputChange();
      setTrackData({
        buffer: decoded,
        url: blobUrl,
        source: "RECORDING",
        mimeType: data.type,
      });
    };
    reader.readAsArrayBuffer(data);
  };

  const getMimeType = () => {
    const types = [
      // "audio/webm",
      "audio/mp4",
      "audio/ogg",
      "audio/wav",
      "audio/aac",
    ];
    for (let i = 0; i < types.length; i++) {
      if (MediaRecorder.isTypeSupported(types[i])) {
        return types[i];
      }
    }

    return undefined;
  };

  const startRecording = async () => {
    try {
      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: getMimeType(),
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.addEventListener("dataavailable", async (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
        if (mediaRecorder.state === "inactive") {
          let blob = new Blob(chunksRef.current, { type: getMimeType() });
          loadAudioFromBlob(blob);

          chunksRef.current = [];
        }
      });
      mediaRecorder.start();

      setRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();

      setDuration(0);
      setRecording(false);
    }
  };

  const handleToggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  let timeoutButton: ReturnType<typeof setTimeout>;

  const tabs = [
    {
      buttonIcon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 16 16"
        >
          <path
            fill="#fff"
            fillRule="evenodd"
            d="M3.47 6.53a.75.75 0 0 1 1.06 1.061l-.727.727a2.743 2.743 0 0 0 3.879 3.879l.727-.727a.75.75 0 0 1 1.06 1.06l-.726.727a4.243 4.243 0 0 1-6-6zm8 1.879a.75.75 0 0 0 1.06 1.06l.727-.726a4.243 4.243 0 0 0-6-6l-.727.727a.75.75 0 0 0 1.061 1.06l.727-.727a2.743 2.743 0 0 1 3.879 3.879zm-.94-1.879a.75.75 0 1 0-1.06-1.06l-4 4a.75.75 0 1 0 1.06 1.06z"
            clipRule="evenodd"
          />
        </svg>
      ),
      buttonStyle: {
        base: "link-button",
        active: "active-link-button",
      },
      tabElement: (
        <div className="w-full h-full p-5 flex flex-col justify-between space-y-3">
          <textarea
            ref={textAreaRef}
            placeholder="Enter the URL of the audio file you want to load."
            className="flex-1 xl:text-xl resize-none outline-none overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          ></textarea>
          <button
            className="duo-button select-button h-10 xl:h-12 z-1"
            onClick={() => {
              const el = textAreaRef.current;
              if (!el) return;

              if (!el.value) {
                el.classList.add("text-[#fc4848]");

                clearTimeout(timeoutButton);
                timeoutButton = setTimeout(() => {
                  el.classList.remove("text-[#fc4848]");
                }, 200);

                return;
              }

              transcriber.onInputChange();
              setAudioUrl(el.value);
            }}
          >
            <span className="text-[#4b4b4b]">Load audio</span>
          </button>
        </div>
      ),
    },
    {
      buttonIcon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 16 16"
        >
          <path
            fill="#fff"
            fillRule="evenodd"
            d="M11 13.5H5A1.5 1.5 0 0 1 3.5 12V4A1.5 1.5 0 0 1 5 2.5h2V5a3 3 0 0 0 3 3h2.5v4a1.5 1.5 0 0 1-1.5 1.5m1.303-7a1.5 1.5 0 0 0-.242-.318L8.818 2.939a1.5 1.5 0 0 0-.318-.242V5A1.5 1.5 0 0 0 10 6.5zm.818-1.379A3 3 0 0 1 14 7.243V12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3h2.757a3 3 0 0 1 2.122.879z"
            clipRule="evenodd"
          />
        </svg>
      ),
      buttonStyle: {
        base: "file-button",
        active: "active-file-button",
      },
      tabElement: (
        <div className="w-full h-full p-5 flex flex-col justify-between">
          <span className="opacity-50 xl:text-xl mb-5 cursor-default select-none">
            Upload an audio or video file from your device.
          </span>
          <button
            className="duo-button select-button h-10 xl:h-12 z-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="text-[#4b4b4b]">Upload file</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,video/x-matroska,audio/*"
            className="hidden"
            onChange={loadAudioFromFile}
          />
        </div>
      ),
    },
    {
      buttonIcon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 16 16"
        >
          <path
            fill="#fff"
            fillRule="evenodd"
            d="M9.5 7V3.5a1.5 1.5 0 1 0-3 0V7a1.5 1.5 0 1 0 3 0M8 .5a3 3 0 0 0-3 3V7a3 3 0 0 0 6 0V3.5a3 3 0 0 0-3-3m.75 12.454A6 6 0 0 0 14 7v-.25a.75.75 0 0 0-1.5 0V7a4.5 4.5 0 1 1-9 0v-.25a.75.75 0 0 0-1.5 0V7c0 3.06 2.29 5.585 5.25 5.954v1.796a.75.75 0 0 0 1.5 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
      buttonStyle: {
        base: "record-button",
        active: "active-record-button",
      },
      tabElement: (
        <div
          className={`w-full h-full p-5 flex flex-col justify-between ${
            !navigator.mediaDevices ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <span className="opacity-50 mb-5 xl:text-xl cursor-default select-none">
            {navigator.mediaDevices
              ? "Record audio using your microphone."
              : "Browser doesn't support mic recording."}
          </span>
          <button
            className={`duo-button h-10 xl:h-12 z-1 ${
              recording ? "record-button" : "select-button"
            }`}
            onClick={handleToggleRecording}
          >
            <span className={!recording ? "text-[#4b4b4b]" : ""}>
              {recording ? `Stop (${formatAudioTimestamp(duration)})` : "Start"}
            </span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-row" style={{ height: `${height}px` }}>
      <div
        className={`flex-1 h-full overflow-hidden ${
          height === 180 ? "mr-2" : "mr-4"
        }`}
      >
        <div
          className="w-full h-auto flex flex-col transition-transform duration-500"
          style={{ transform: `translateY(-${activeIndex * height}px)` }}
        >
          {tabs.map((tab, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0"
              style={{ height: `${height}px` }}
            >
              <div
                className={`w-full h-full flex justify-center items-center border-2 border-b-4 border-[#37464F] bg-[#131f24] transition-all duration-200 overflow-hidden rounded-lg ${
                  index === activeIndex ? "" : "opacity-50 scale-95"
                }`}
              >
                {tab.tabElement}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`h-full flex flex-col ${
          height === 180 ? "w-16 space-y-2" : "w-24 space-y-4"
        }`}
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`
                flex
                duo-button
                ${tab.buttonStyle.base}
                ${index === activeIndex ? tab.buttonStyle.active : ""}
              `}
            style={{ height: `${100 / tabs.length}%` }}
            onClick={() => {
              setActiveIndex(index);

              if (navigator.vibrate && index !== activeIndex) {
                navigator.vibrate(50);
              }
            }}
          >
            <span className={index === activeIndex ? "brightness-[0.9]" : ""}>
              {tab.buttonIcon}
            </span>
          </button>
        ))}
      </div>

      <div className="absolute top-0 left-0 right-0 w-[100vw] xl:w-full flex flex-col pt-8 xl:pt-10">
        <h1 className="text-center text-2xl xl:text-4xl xl:mb-2 font-bold uppercase">
          Transcriber
        </h1>
        <span className="text-center text-sm xl:text-lg opacity-50 font-bold mb-2 xl:mb-6 uppercase">
          Get text from audio & video, for free
        </span>
        <div className="w-full flex flex-col">
          {isLoading || trackData ? (
            <div className="w-full h-[6px] overflow-hidden">
              <div
                className="h-full bg-[#fee333] border-b-2 border-[#ffc100] transition-all duration-300"
                style={{
                  width: `${isLoading ? progress * 100 : +!!trackData * 100}%`,
                }}
              />
            </div>
          ) : null}
          {transcriber.progressItems.length > 0
            ? transcriber.progressItems
                .filter((progressItem) => !progressItem.file.includes(".json"))
                .map((progressItem, index) => (
                  <div key={index} className="w-full h-[6px] overflow-hidden">
                    <div
                      className="h-full bg-[#fee333] border-b-2 border-[#ffc100] transition-all duration-300"
                      style={{
                        width: `${progressItem.progress}%`,
                      }}
                    />
                  </div>
                ))
            : null}
        </div>
      </div>
    </div>
  );
}
