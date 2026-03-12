import { useCallback, useEffect, useState } from "react";

import { PRACTICE_ITEMS } from "@/data/practice-items";
import { pracAlgorithm } from "@/lib/prac-algorithm";

const createEmptyLetters = (code: string) => Array.from({ length: code.length }, () => "");

export function usePracticeSession() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [letters, setLetters] = useState<string[]>(() => createEmptyLetters(PRACTICE_ITEMS[0].code));
  const [isWrong, setIsWrong] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const currentItem = PRACTICE_ITEMS[currentIndex];

  const toggleHintVisibility = useCallback(() => {
    setShowCode((current) => !current);
    setShowDescription((current) => !current);
  }, []);

  const handleBackspace = useCallback(() => {
    setLetters((currentLetters) => {
      const nextLetters = [...currentLetters];

      for (let index = nextLetters.length - 1; index >= 0; index -= 1) {
        if (nextLetters[index]) {
          nextLetters[index] = "";
          break;
        }
      }

      return nextLetters;
    });
  }, []);

  const handleLetterInput = useCallback((letter: string) => {
    setLetters((currentLetters) => {
      const nextLetters = [...currentLetters];
      const emptyIndex = nextLetters.findIndex((currentLetter) => !currentLetter);

      if (emptyIndex === -1) {
        return nextLetters;
      }

      nextLetters[emptyIndex] = letter.toLowerCase();
      return nextLetters;
    });
  }, []);

  useEffect(() => {
    if (letters.some((letter) => !letter)) {
      return;
    }

    const answer = letters.join("");

    if (answer === currentItem.code) {
      const nextQuestionTimer = window.setTimeout(() => {
        setCurrentIndex((current) => {
          const nextIndex = pracAlgorithm(current, PRACTICE_ITEMS.length);

          setLetters(createEmptyLetters(PRACTICE_ITEMS[nextIndex].code));
          setIsWrong(false);
          setShowCode(false);
          setShowDescription(false);

          return nextIndex;
        });
      }, 180);

      return () => {
        window.clearTimeout(nextQuestionTimer);
      };
    }

    const wrongStateTimer = window.setTimeout(() => {
      setIsWrong(true);
      setShowCode(true);
    }, 0);

    const resetTimer = window.setTimeout(() => {
      setLetters(createEmptyLetters(currentItem.code));
      setIsWrong(false);
    }, 520);

    return () => {
      window.clearTimeout(wrongStateTimer);
      window.clearTimeout(resetTimer);
    };
  }, [currentItem.code, letters]);

  return {
    currentItem,
    letters,
    isWrong,
    showCode,
    showDescription,
    toggleHintVisibility,
    handleBackspace,
    handleLetterInput,
  };
}
