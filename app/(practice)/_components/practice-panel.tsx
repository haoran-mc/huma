import type { PracticeItem } from "@/data/practice-items";

import { PracticeHintCard } from "./practice-hint-card";
import { PracticeSidebar } from "./practice-sidebar";

type PracticePanelProps = {
  item: PracticeItem;
  letters: string[];
  activeIndex: number;
  isWrong: boolean;
  showCode: boolean;
  showDescription: boolean;
};

export function PracticePanel({
  item,
  letters,
  activeIndex,
  isWrong,
  showCode,
  showDescription,
}: PracticePanelProps) {
  return (
    <div className="relative flex min-h-[min(580px,calc(100vh-120px))] bg-[rgba(251,252,255,0.84)]">
      <PracticeSidebar />

      <section className="relative flex flex-1 items-center justify-center px-6 py-10 md:px-12">
        <div className="flex w-full max-w-md flex-col items-center justify-center text-center">
          <div className={isWrong ? "animate-practice-shake" : ""}>
            <div className="radical-font mb-3 text-[42px] leading-none font-medium tracking-[0.08em] text-[#64789c]">
              {item.radical}
            </div>

            <div
              className={`mb-8 min-h-[28px] text-[28px] leading-none font-medium text-[#6d84aa] transition-opacity ${
                showCode ? "opacity-100" : "opacity-0"
              }`}
            >
              {item.code}
            </div>
          </div>

          <div className="mb-5 flex items-center gap-4">
            {letters.map((letter, index) => {
              const isActive = activeIndex === index || (activeIndex === -1 && index === letters.length - 1);

              return (
                <input
                  key={`${item.radical}-${index}`}
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
        </div>

        <PracticeHintCard item={item} visible={showDescription} />
      </section>
    </div>
  );
}
