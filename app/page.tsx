"use client";

import { useEffect, useMemo, useState } from "react";
import { PRACTICE_ITEMS } from "@/data/practice-items";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [letters, setLetters] = useState<string[]>(() =>
    Array.from({ length: PRACTICE_ITEMS[0].code.length }, () => "")
  );
  const [isWrong, setIsWrong] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const currentItem = PRACTICE_ITEMS[currentIndex];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === " ") {
        event.preventDefault();
        setShowCode((current) => !current);
        setShowDescription((current) => !current);
        return;
      }

      if (isWrong) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();

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

        return;
      }

      if (!/^[a-zA-Z]$/.test(event.key)) {
        return;
      }

      event.preventDefault();

      setLetters((currentLetters) => {
        const nextLetters = [...currentLetters];
        const emptyIndex = nextLetters.findIndex((letter) => !letter);

        if (emptyIndex === -1) {
          return nextLetters;
        }

        nextLetters[emptyIndex] = event.key.toLowerCase();
        return nextLetters;
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isWrong]);

  useEffect(() => {
    if (letters.some((letter) => !letter)) {
      return;
    }

    const answer = letters.join("");

    if (answer === currentItem.code) {
      const nextQuestionTimer = window.setTimeout(() => {
        setCurrentIndex((current) => {
          const nextIndex = (current + 1) % PRACTICE_ITEMS.length;

          setLetters(Array.from({ length: PRACTICE_ITEMS[nextIndex].code.length }, () => ""));
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

    setIsWrong(true);
    setShowCode(true);

    const resetTimer = window.setTimeout(() => {
      setLetters(Array.from({ length: currentItem.code.length }, () => ""));
      setIsWrong(false);
    }, 520);

    return () => {
      window.clearTimeout(resetTimer);
    };
  }, [currentItem.code, letters]);

  const activeIndex = useMemo(() => letters.findIndex((letter) => !letter), [letters]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-6 py-16">
      <section className="flex w-full max-w-md flex-col items-center justify-center text-center">
        <div className={isWrong ? "animate-practice-shake" : ""}>
          <div className="mb-3 text-[64px] leading-none font-medium tracking-[0.08em] text-[#64789c]">
            {currentItem.radical}
          </div>

          <div
            className={`mb-6 min-h-[28px] text-[28px] leading-none font-medium text-[#6d84aa] transition-opacity ${
              showCode ? "opacity-100" : "opacity-0"
            }`}
          >
            {currentItem.code}
          </div>
        </div>

        <div className="mb-5 flex items-center gap-4">
          {letters.map((letter, index) => {
            const isActive = activeIndex === index || (activeIndex === -1 && index === letters.length - 1);

            return (
              <input
                key={`${currentItem.radical}-${index}`}
                aria-label={`第${index + 1}个编码输入框`}
                className={`h-12 w-12 rounded-xl border bg-white text-center text-lg shadow-[0_6px_18px_rgba(137,151,177,0.12)] outline-none transition ${
                  isWrong
                    ? "border-[#ffb8b8] text-[#ff4d4f] ring-2 ring-[#ffd9d9]"
                    : isActive
                      ? "border-[#9cb5e9] text-[#4a5d7a] ring-2 ring-[#c9d8f8]"
                      : "border-[#e7ebf3] text-[#4a5d7a]"
                }`}
                maxLength={1}
                readOnly
                tabIndex={-1}
                value={letter}
              />
            );
          })}
        </div>

        <div
          className={`fixed right-6 bottom-6 w-[320px] rounded-2xl border border-[#e6ebf4] bg-white/95 p-5 text-left shadow-[0_18px_40px_rgba(124,140,171,0.18)] backdrop-blur transition-all duration-200 ${
            showDescription
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-3 opacity-0"
          }`}
        >
          <div className="mb-2 text-sm font-semibold tracking-[0.08em] text-[#8b9bb4]">提示</div>
          <div className="mb-3 text-lg font-semibold text-[#5f7394]">
            {currentItem.radical} · {currentItem.code}
          </div>
          <p className="text-sm leading-6 text-[#6f82a0]">{currentItem.description}</p>
        </div>
      </section>
    </main>
  );
}
