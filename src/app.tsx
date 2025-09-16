import { AudioManager } from "./components/AudioManager";
import Transcript from "./components/Transcript";
import { useTranscriber } from "./hooks/useTranscriber";

function App() {
  const transcriber = useTranscriber();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="container flex flex-col justify-center items-center">
        <AudioManager transcriber={transcriber} />
        <Transcript transcribedData={transcriber.output} />
      </div>
    </div>
  );
}

export default App;
