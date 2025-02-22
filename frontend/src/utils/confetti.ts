import confetti from "canvas-confetti";
import { useCallback, useEffect, useRef } from "react";

const randomInRange = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

export const useConfetti = (): { start: () => void } => {
  const start = useCallback(() => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
    };

    const shoot = (particleRatio: number, opts: confetti.Options) =>
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });

    shoot(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    shoot(0.2, {
      spread: 60,
    });
    shoot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    shoot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    shoot(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, []);

  return { start };
};

export const useStars = (): { start: () => void; stop: () => void } => {
  const timeoutRefs = useRef<number[]>([]);

  const start = useCallback(() => {
    const defaults = {
      spread: 360,
      ticks: 70,
      gravity: 0,
      decay: 0.94,
      startVelocity: 20,
      shapes: ["star"],
      colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 100,
        scalar: 1.2,
        shapes: ["star"],
      });

      confetti({
        ...defaults,
        particleCount: 25,
        scalar: 0.75,
        shapes: ["circle"],
      });
    };

    timeoutRefs.current = [
      setTimeout(shoot, 0),
      setTimeout(shoot, 100),
      setTimeout(shoot, 200),
    ];
  }, []);

  const stop = useCallback(
    () => timeoutRefs.current.forEach((x) => clearTimeout(x)),
    [],
  );

  useEffect(() => stop, [stop]);

  return { start, stop };
};

export const useFireworks = ({
  duration,
}: {
  duration: number;
}): { start: () => void; stop: () => void } => {
  const intervalRef = useRef<number | undefined>();

  const start = useCallback(() => {
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    intervalRef.current = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(intervalRef.current);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        }),
      );
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        }),
      );
    }, 250);
  }, [duration]);

  const stop = useCallback(() => clearInterval(intervalRef.current), []);

  useEffect(() => stop, [stop]);

  return { start, stop };
};
