import { useCallback, useEffect, useRef, useState } from "react";

import { PRACTICE_ITEMS } from "@/data/practice-items";
import {
  MASTERY_COUNT,
  ProgressEntry,
  PracticeState,
  createInitialState,
  createStateFromCounts,
  deserializeProgress,
  isSessionComplete,
  onCorrect,
  onWrong,
  pickNext,
  serializeProgress,
} from "@/lib/prac-algorithm";

const createEmptyLetters = (code: string) => Array.from({ length: code.length }, () => "");

type Session = {
  state: PracticeState;
  currentIndex: number;
};

function makeInitialSession(): Session {
  const state = createInitialState(PRACTICE_ITEMS.length);
  return { state, currentIndex: Math.max(0, pickNext(state)) };
}

export function usePracticeSession() {
  // Initialize session and letters together to guarantee they are consistent.
  const [{ initSession, initLetters }] = useState(() => {
    const session = makeInitialSession();
    return {
      initSession: session,
      initLetters: createEmptyLetters(PRACTICE_ITEMS[session.currentIndex].code),
    };
  });
  const [session, setSession] = useState<Session>(() => initSession);
  const [letters, setLetters] = useState<string[]>(() => initLetters);
  const [isWrong, setIsWrong] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  // 记录上一次的 counts，用于检测是否有新字根达到 MASTERY_COUNT
  const prevCountsRef = useRef<number[]>(session.state.counts);

  // 从持久化文件中恢复进度
  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((entries: ProgressEntry[]) => {
        if (!entries.length) return;
        const counts = deserializeProgress(entries, PRACTICE_ITEMS.length);
        const restoredState = createStateFromCounts(counts);
        const nextIndex = pickNext(restoredState);
        const safeIndex = nextIndex >= 0 ? nextIndex : 0;
        prevCountsRef.current = restoredState.counts;
        setSession({ state: restoredState, currentIndex: safeIndex });
        setLetters(createEmptyLetters(PRACTICE_ITEMS[safeIndex].code));
      })
      .catch(() => {/* 无存档时使用默认初始状态 */});
  }, []);

  // 每当有新字根达到 MASTERY_COUNT，自动持久化
  useEffect(() => {
    const prev = prevCountsRef.current;
    const curr = session.state.counts;
    const hasNewMastery = curr.some((c, i) => c >= MASTERY_COUNT && prev[i] < MASTERY_COUNT);
    if (hasNewMastery) {
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serializeProgress(curr)),
      });
    }
    prevCountsRef.current = curr;
  }, [session.state.counts]);

  const { currentIndex, state } = session;
  const currentItem = PRACTICE_ITEMS[currentIndex];
  const isComplete = isSessionComplete(state);

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
    if (isComplete) return;
    if (letters.some((letter) => !letter)) return;

    const answer = letters.join("");

    if (answer === currentItem.code) {
      const nextQuestionTimer = window.setTimeout(() => {
        setSession((current) => {
          const nextState = onCorrect(current.state, current.currentIndex);
          const nextIndex = pickNext(nextState);
          const safeIndex = nextIndex >= 0 ? nextIndex : current.currentIndex;

          setLetters(createEmptyLetters(PRACTICE_ITEMS[safeIndex].code));
          setIsWrong(false);
          setShowCode(false);
          setShowDescription(false);

          return { state: nextState, currentIndex: safeIndex };
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
      setSession((current) => ({
        ...current,
        state: onWrong(current.state, current.currentIndex),
      }));
      setLetters(createEmptyLetters(currentItem.code));
      setIsWrong(false);
    }, 520);

    return () => {
      window.clearTimeout(wrongStateTimer);
      window.clearTimeout(resetTimer);
    };
  }, [currentItem.code, isComplete, letters]);

  return {
    currentItem,
    state,
    letters,
    isWrong,
    isComplete,
    showCode,
    showDescription,
    toggleHintVisibility,
    handleBackspace,
    handleLetterInput,
  };
}

