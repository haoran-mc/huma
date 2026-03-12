"use client";

import Image from "next/image";
import { useMemo } from "react";

import { MacOSMenuBar } from "@/components/macos-menu-bar";
import { MacOSWindowFrame } from "@/components/macos-window-frame";

import { PracticePanel } from "./_components/practice-panel";
import { useDraggableWindow } from "./_hooks/use-draggable-window";
import { usePracticeInput } from "./_hooks/use-practice-input";
import { usePracticeSession } from "./_hooks/use-practice-session";

export default function PracticePage() {
  const { currentItem, letters, isWrong, showCode, showDescription, toggleHintVisibility, handleBackspace, handleLetterInput } =
    usePracticeSession();
  const { windowFrameRef, windowOffset, isDraggingWindow, handleTitlePointerDown } = useDraggableWindow();
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
  const { activeIndex } = usePracticeInput({
    letters,
    isWrong,
    onToggleHint: toggleHintVisibility,
    onBackspace: handleBackspace,
    onLetterInput: handleLetterInput,
  });

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
      <MacOSMenuBar timeLabel={menuBarTime} />

      <MacOSWindowFrame
        ref={windowFrameRef}
        title="Bear"
        isDragging={isDraggingWindow}
        onTitlePointerDown={handleTitlePointerDown}
        style={{
          transform: `translate(calc(-50% + ${windowOffset.x}px), calc(-50% + ${windowOffset.y}px))`,
        }}
      >
        <PracticePanel
          item={currentItem}
          letters={letters}
          activeIndex={activeIndex}
          isWrong={isWrong}
          showCode={showCode}
          showDescription={showDescription}
        />
      </MacOSWindowFrame>
    </main>
  );
}
