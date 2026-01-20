import { useEffect, useState } from 'react';

const PROGRESS_MIN = 0;
const PROGRESS_START = 10;
const PROGRESS_MAX = 90;
const PROGRESS_STEP = 6;
const PROGRESS_INTERVAL_MS = 140;

export const useIndeterminateProgress = (active: boolean): number => {
  const [value, setValue] = useState(PROGRESS_MIN);

  useEffect(() => {
    if (!active) {
      setValue(PROGRESS_MIN);
      return;
    }

    setValue(PROGRESS_START);
    const intervalId = setInterval(() => {
      setValue((prev) => {
        const next = prev + PROGRESS_STEP;
        return next >= PROGRESS_MAX ? PROGRESS_START : next;
      });
    }, PROGRESS_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [active]);

  return value;
};
