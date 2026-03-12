import Image from "next/image";

const MENU_ITEMS = ["Finder", "文件", "编辑", "视图", "前往", "窗口", "帮助"];

type MacOSMenuBarProps = {
  timeLabel: string;
  batteryLevel?: string;
};

export function MacOSMenuBar({ timeLabel, batteryLevel = "80%" }: MacOSMenuBarProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex h-8 items-center justify-between bg-[rgba(105,114,161,0.34)] px-3 text-[11px] text-white/90 backdrop-blur-xl">
      <div className="flex items-center gap-4 font-medium">
        <Image src="/icons/app.svg" alt="Apple menu" width={14} height={14} className="opacity-95" />
        {MENU_ITEMS.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <div className="flex items-center gap-3 text-white/80">
        <span>{batteryLevel}</span>
        <Image src="/icons/wifi.svg" alt="Wi-Fi" width={15} height={15} className="opacity-90" />
        <Image src="/icons/search.svg" alt="Search" width={14} height={14} className="opacity-90" />
        <Image src="/icons/battery.svg" alt="Battery" width={17} height={17} className="opacity-90" />
        <span>{timeLabel}</span>
      </div>
    </header>
  );
}
