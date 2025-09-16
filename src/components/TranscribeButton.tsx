import { Button } from "./ui/button";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isModelLoading: boolean;
  isTranscribing: boolean;
}

export function TranscribeButton(props: Props): React.JSX.Element {
  const { isModelLoading, isTranscribing, onClick, ...buttonProps } = props;
  return (
    <Button
      {...buttonProps}
      onClick={(event) => {
        if (onClick && !isTranscribing && !isModelLoading) {
          onClick(event);
        }
      }}
      disabled={isTranscribing}
    >
      {isModelLoading
        ? "Loading model..."
        : isTranscribing
        ? "Transcribing..."
        : "Transcribe Audio"}
    </Button>
  );
}
