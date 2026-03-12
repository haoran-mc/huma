"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { PRACTICE_ITEMS } from "@/data/practice-items";
import { pracAlgorithm } from "@/lib/prac-algorithm";

export default function Home() {
  const windowFrameRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  // 当前题目的索引。
  const [currentIndex, setCurrentIndex] = useState(0);

  // 输入框中的字母数组，长度与当前题目的编码长度保持一致。
  const [letters, setLetters] = useState<string[]>(() =>
    Array.from({ length: PRACTICE_ITEMS[0].code.length }, () => "")
  );

  // 控制错误反馈、编码显示和右下角提示弹窗显示。
  const [isWrong, setIsWrong] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [windowOffset, setWindowOffset] = useState({ x: 0, y: 0 });
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);

  // 根据当前索引取出正在练习的题目。
  const currentItem = PRACTICE_ITEMS[currentIndex];
  const menuBarTime = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date()),
    []
  );

  const clampWindowOffset = (nextX: number, nextY: number) => {
    const windowRect = windowFrameRef.current?.getBoundingClientRect();

    if (!windowRect) {
      return { x: nextX, y: nextY };
    }

    const maxX = Math.max((window.innerWidth - windowRect.width - 32) / 2, 0);
    const maxY = Math.max((window.innerHeight - windowRect.height - 72) / 2, 0);

    return {
      x: Math.min(maxX, Math.max(-maxX, nextX)),
      y: Math.min(maxY, Math.max(-maxY, nextY)),
    };
  };

  useEffect(() => {
    // 统一监听键盘输入：空格切换提示、退格删除、字母录入。
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
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragStateRef.current) {
        return;
      }

      const deltaX = event.clientX - dragStateRef.current.startX;
      const deltaY = event.clientY - dragStateRef.current.startY;
      const nextOffset = clampWindowOffset(
        dragStateRef.current.originX + deltaX,
        dragStateRef.current.originY + deltaY
      );

      setWindowOffset(nextOffset);
    };

    const handlePointerUp = () => {
      dragStateRef.current = null;
      setIsDraggingWindow(false);
    };

    const handleResize = () => {
      setWindowOffset((currentOffset) => clampWindowOffset(currentOffset.x, currentOffset.y));
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // 只在编码填满后进行判题。
    if (letters.some((letter) => !letter)) {
      return;
    }

    const answer = letters.join("");

    // 答对后按练习算法切换到下一题，并重置当前题目的显示状态。
    if (answer === currentItem.code) {
      const nextQuestionTimer = window.setTimeout(() => {
        setCurrentIndex((current) => {
          const nextIndex = pracAlgorithm(current, PRACTICE_ITEMS.length);

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

    // 答错后显示编码，并短暂保留红色错误反馈后清空输入。
    const wrongStateTimer = window.setTimeout(() => {
      setIsWrong(true);
      setShowCode(true);
    }, 0);

    const resetTimer = window.setTimeout(() => {
      setLetters(Array.from({ length: currentItem.code.length }, () => ""));
      setIsWrong(false);
    }, 520);

    return () => {
      window.clearTimeout(wrongStateTimer);
      window.clearTimeout(resetTimer);
    };
  }, [currentItem.code, letters]);

  // 找到当前应该高亮的输入框位置。
  const activeIndex = useMemo(() => letters.findIndex((letter) => !letter), [letters]);

  const handleTitlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: windowOffset.x,
      originY: windowOffset.y,
    };

    setIsDraggingWindow(true);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0d1326] text-[#1f2940] select-none">
      <Image
        src="/desktop/wallpaper-day.jpg"
        alt="macOS wallpaper"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.03)_26%,rgba(0,0,0,0.18)_100%)]" />

      <header className="absolute inset-x-0 top-0 z-20 flex h-8 items-center justify-between bg-[rgba(105,114,161,0.34)] px-3 text-[11px] text-white/90 backdrop-blur-xl">
        <div className="flex items-center gap-4 font-medium">
          <Image src="/icons/app.svg" alt="Apple menu" width={14} height={14} className="opacity-95" />
          <span>Finder</span>
          <span>文件</span>
          <span>编辑</span>
          <span>视图</span>
          <span>前往</span>
          <span>窗口</span>
          <span>帮助</span>
        </div>

        <div className="flex items-center gap-3 text-white/80">
          <span>80%</span>
          <Image src="/icons/wifi.svg" alt="Wi-Fi" width={15} height={15} className="opacity-90" />
          <Image src="/icons/search.svg" alt="Search" width={14} height={14} className="opacity-90" />
          <Image src="/icons/battery.svg" alt="Battery" width={17} height={17} className="opacity-90" />
          <span>{menuBarTime}</span>
        </div>
      </header>

      <div
        ref={windowFrameRef}
        className="absolute left-1/2 top-1/2 z-10 w-[min(960px,calc(100vw-40px))] overflow-hidden rounded-[14px] border border-white/50 bg-[rgba(246,248,252,0.72)] shadow-[0_30px_80px_rgba(7,10,20,0.4)] backdrop-blur-xl"
        style={{
          transform: `translate(calc(-50% + ${windowOffset.x}px), calc(-50% + ${windowOffset.y}px))`,
        }}
      >
        <div
          className={`flex h-10 items-center border-b border-[#d7dcea] bg-[linear-gradient(180deg,rgba(248,249,252,0.94)_0%,rgba(234,237,245,0.9)_100%)] px-4 ${
            isDraggingWindow ? "cursor-grabbing" : "cursor-grab"
          }`}
          onPointerDown={handleTitlePointerDown}
        >
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]" />
          </div>

          <div className="flex-1 pr-16 text-center text-sm font-semibold text-[#5f6780]">Bear</div>
        </div>

        <div className="relative flex min-h-[min(680px,calc(100vh-120px))] bg-[rgba(251,252,255,0.84)]">
          <aside className="hidden w-[240px] border-r border-[#d6ddeb] bg-[#3c4960]/97 text-white/95 md:flex md:flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs text-white/75">
              <span className="flex items-center gap-2">
                <Image src="/icons/search.svg" alt="Search" width={12} height={12} className="invert" />
                搜索
              </span>
              <span>⌥⌘F</span>
            </div>
            <div className="p-3 text-sm">
              <div className="mb-2 rounded-md bg-[#ff5f57] px-3 py-2 font-medium text-white shadow-[0_8px_20px_rgba(255,95,87,0.2)]">
                字根基础练习
              </div>
              <div className="rounded-md px-3 py-2 text-white/75">提示：空格切换小窗口</div>
            </div>
          </aside>

          <section className="relative flex flex-1 items-center justify-center px-6 py-10 md:px-12">
            <div className="flex w-full max-w-md flex-col items-center justify-center text-center">
              {/* 题目主体：字根 + 编码（默认隐藏，提示或答错时显示） */}
              <div className={isWrong ? "animate-practice-shake" : ""}>
                <div className="radical-font mb-3 text-[64px] leading-none font-medium tracking-[0.08em] text-[#64789c] md:text-[88px]">
                  {currentItem.radical}
                </div>

                <div
                  className={`mb-8 min-h-[28px] text-[28px] leading-none font-medium text-[#6d84aa] transition-opacity ${
                    showCode ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {currentItem.code}
                </div>
              </div>

              {/* 只读输入框：实际输入来自全局键盘事件。 */}
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
            </div>

            {/* 右下角提示弹窗：按空格后切换显示。 */}
            <div
              className={`absolute right-6 bottom-6 w-[320px] rounded-2xl border border-[#e6ebf4] bg-white/95 p-5 text-left shadow-[0_18px_40px_rgba(124,140,171,0.18)] backdrop-blur transition-all duration-200 ${
                showDescription
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-3 opacity-0"
              }`}
            >
              <div className="mb-2 text-sm font-semibold tracking-[0.08em] text-[#8b9bb4]">提示</div>
              <div className="mb-4 flex items-center gap-3 text-[#5f7394]">
                <span className="radical-font text-[28px] leading-none">{currentItem.radical}</span>
                <span className="text-lg font-semibold">{currentItem.code}</span>
              </div>

              <dl className="space-y-3 text-sm leading-6 text-[#6f82a0]">
                <div>
                  <dt className="font-semibold text-[#8b9bb4]">编码</dt>
                  <dd>{currentItem.code}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#8b9bb4]">拼音</dt>
                  <dd>{currentItem.pinyin || "-"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#8b9bb4]">例字</dt>
                  <dd>{currentItem.example || "-"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#8b9bb4]">描述</dt>
                  <dd>{currentItem.description || "-"}</dd>
                </div>
              </dl>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
