import Image from "next/image";

export function PracticeSidebar() {
  return (
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
  );
}
