import { useEffect, useState } from "react";
import { useTranscriber } from "./hooks/use-transcriber";
import { AudioManager } from "./components/audio-manager";
import { Transcript } from "./components/transcript";

function App() {
  const [activePage, setActivePage] = useState<number>(0);
  const [backToHome, setBackToHome] = useState<boolean>(false);
  const transcriber = useTranscriber();

  useEffect(() => {
    if (window.innerWidth < 1280) {
      if (!backToHome && transcriber.output?.chunks) {
        setActivePage(1);
      }
    }
  }, [transcriber, backToHome]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setActivePage(0);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="xl:container w-full h-dvh mx-auto flex overflow-hidden">
      <div className="w-[200vw] xl:w-full h-full">
        <div
          className="w-full h-full flex flex-row transition-transform duration-500"
          style={{ transform: `translateX(-${activePage * 50}%)` }}
        >
          <div className="w-[100vw] xl:w-1/3 h-full xl:h-auto pt-32 xl:pt-48 flex-shrink-0">
            <AudioManager
              transcriber={transcriber}
              setActivePage={setActivePage}
              setBackToHome={setBackToHome}
            />
          </div>
          <div className="w-[100vw] xl:w-2/3 h-full xl:h-auto xl:pt-40 flex-shrink-0">
            <Transcript
              output={transcriber.output}
              setActivePage={setActivePage}
              setBackToHome={setBackToHome}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
