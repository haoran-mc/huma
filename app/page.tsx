"use client";

import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [letters, setLetters] = useState(["", ""]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();

        setLetters((currentLetters) => {
          const nextLetters = [...currentLetters];

          if (nextLetters[1]) {
            nextLetters[1] = "";
          } else {
            nextLetters[0] = "";
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
  }, []);

  const activeIndex = useMemo(() => letters.findIndex((letter) => !letter), [letters]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-6 py-16">
      <section className="flex w-full max-w-md flex-col items-center justify-center text-center">
        <div className="mb-3 text-[64px] leading-none font-medium tracking-[0.08em] text-[#64789c]">
          音
        </div>

        <div className="mb-6 text-[28px] leading-none font-medium text-[#6d84aa]">
          xy
        </div>

        <div className="mb-5 flex items-center gap-4">
          <input
            aria-label="第一个编码输入框"
            className={`h-12 w-12 rounded-xl border bg-white text-center text-lg text-[#4a5d7a] shadow-[0_6px_18px_rgba(137,151,177,0.12)] outline-none transition ${
              activeIndex === 0
                ? "border-[#9cb5e9] ring-2 ring-[#c9d8f8]"
                : "border-[#e7ebf3]"
            }`}
            maxLength={1}
            readOnly
            tabIndex={-1}
            value={letters[0]}
          />
          <input
            aria-label="第二个编码输入框"
            className={`h-12 w-12 rounded-xl border bg-white text-center text-lg text-[#4a5d7a] shadow-[0_6px_18px_rgba(137,151,177,0.12)] outline-none transition ${
              activeIndex === 1 || activeIndex === -1
                ? "border-[#9cb5e9] ring-2 ring-[#c9d8f8]"
                : "border-[#e7ebf3]"
            }`}
            maxLength={1}
            readOnly
            tabIndex={-1}
            value={letters[1]}
          />
        </div>

        <p className="text-sm text-[#9ba8bd]">实左根不出来可以按空格</p>
      </section>
    </main>
  );
}
