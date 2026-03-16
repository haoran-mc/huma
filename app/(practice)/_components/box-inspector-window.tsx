import type { CSSProperties, PointerEventHandler } from "react";

import { PRACTICE_ITEMS } from "@/data/practice-items";
import { MASTERY_COUNT, type PracticeState } from "@/lib/prac-algorithm";
import { MacOSWindowFrame } from "@/components/macos-window-frame";

type BoxInspectorWindowProps = {
  state: PracticeState;
  isDragging: boolean;
  onTitlePointerDown: PointerEventHandler<HTMLDivElement>;
  style?: CSSProperties;
};

export function BoxInspectorWindow({ state, isDragging, onTitlePointerDown, style }: BoxInspectorWindowProps) {
  const rows = state.activeIndices
    .map((i) => ({ item: PRACTICE_ITEMS[i], succCount: state.counts[i], index: i }))
    .sort((a, b) => b.succCount - a.succCount);

  return (
    <MacOSWindowFrame
      title="Box Inspector"
      isDragging={isDragging}
      onTitlePointerDown={onTitlePointerDown}
      style={{ width: "fit-content", ...style }}
    >
      <div className="w-[min(480px,calc(100vw-40px))] overflow-y-auto" style={{ maxHeight: "calc(100vh - 160px)" }}>
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-[#aab2c4]">盒子为空</p>
        ) : rows.map(({ item, succCount, index }) => {
          const pct = succCount / (MASTERY_COUNT - 1);
          const barColor = pct >= 0.85 ? "#28c840" : pct >= 0.5 ? "#febc2e" : "#ff5f57";

          return (
            <div key={index} className="flex items-center gap-3 border-b border-[#edf0f7] px-4 py-2">
              <span className="w-6 shrink-0 text-xs text-[#aab2c4]">{index}</span>
              <span className="radical-font flex-1 text-base text-[#3c4960]">{item.radical}</span>
              <div className="flex w-16 shrink-0 flex-col gap-1">
                <span className="text-xs font-semibold text-[#3c4960]">{succCount}/{MASTERY_COUNT - 1}</span>
                <div className="h-1 w-full overflow-hidden rounded-full bg-[#e7ebf3]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.round(pct * 100)}%`, backgroundColor: barColor }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </MacOSWindowFrame>
  );
}
