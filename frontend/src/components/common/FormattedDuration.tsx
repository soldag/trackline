const pad = (value: number) => String(value).padStart(2, "0");

interface FormattedDurationProps {
  ms: number | null;
}

const FormattedDuration = ({ ms }: FormattedDurationProps) => {
  if (ms == null) {
    return "--:--";
  }

  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${pad(minutes)}:${pad(seconds)}`;
};

export default FormattedDuration;
