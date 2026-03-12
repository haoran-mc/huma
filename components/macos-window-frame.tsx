import { forwardRef, type CSSProperties, type PointerEventHandler, type ReactNode } from "react";

type MacOSWindowFrameProps = {
  title: string;
  isDragging?: boolean;
  onTitlePointerDown?: PointerEventHandler<HTMLDivElement>;
  style?: CSSProperties;
  children: ReactNode;
};

export const MacOSWindowFrame = forwardRef<HTMLDivElement, MacOSWindowFrameProps>(
  function MacOSWindowFrame({ title, isDragging = false, onTitlePointerDown, style, children }, ref) {
    return (
      <div
        ref={ref}
        className="absolute left-1/2 top-1/2 z-10 w-[min(960px,calc(100vw-40px))] overflow-hidden rounded-[14px] border border-white/50 bg-[rgba(246,248,252,0.72)] shadow-[0_30px_80px_rgba(7,10,20,0.4)] backdrop-blur-xl"
        style={style}
      >
        <div
          className={`flex h-10 items-center border-b border-[#d7dcea] bg-[linear-gradient(180deg,rgba(248,249,252,0.94)_0%,rgba(234,237,245,0.9)_100%)] px-4 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          onPointerDown={onTitlePointerDown}
        >
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]" />
          </div>

          <div className="flex-1 pr-16 text-center text-sm font-semibold text-[#5f6780]">{title}</div>
        </div>

        {children}
      </div>
    );
  }
);
