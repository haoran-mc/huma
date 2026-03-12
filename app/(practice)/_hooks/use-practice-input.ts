import { useEffect, useMemo } from "react";

type UsePracticeInputOptions = {
  letters: string[];
  isWrong: boolean;
  onToggleHint: () => void;
  onBackspace: () => void;
  onLetterInput: (letter: string) => void;
};

export function usePracticeInput({
  letters,
  isWrong,
  onToggleHint,
  onBackspace,
  onLetterInput,
}: UsePracticeInputOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === " ") {
        event.preventDefault();
        onToggleHint();
        return;
      }

      if (isWrong || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        onBackspace();
        return;
      }

      if (!/^[a-zA-Z]$/.test(event.key)) {
        return;
      }

      event.preventDefault();
      onLetterInput(event.key);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isWrong, onBackspace, onLetterInput, onToggleHint]);

  const activeIndex = useMemo(() => letters.findIndex((letter) => !letter), [letters]);

  return {
    activeIndex,
  };
}
