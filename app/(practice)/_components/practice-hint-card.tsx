import type { PracticeItem } from "@/data/practice-items";

type PracticeHintCardProps = {
  item: PracticeItem;
  visible: boolean;
};

export function PracticeHintCard({ item, visible }: PracticeHintCardProps) {
  return (
    <div
      className={`absolute right-6 bottom-6 w-[320px] rounded-2xl border border-[#e6ebf4] bg-white/95 p-5 text-left shadow-[0_18px_40px_rgba(124,140,171,0.18)] backdrop-blur transition-all duration-200 ${
        visible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <div className="mb-2 text-sm font-semibold tracking-[0.08em] text-[#8b9bb4]">提示</div>
      <div className="mb-4 flex items-center gap-3 text-[#5f7394]">
        <span className="radical-font text-[28px] leading-none">{item.radical}</span>
        <span className="text-lg font-semibold">{item.code}</span>
      </div>

      <dl className="space-y-3 text-sm leading-6 text-[#6f82a0]">
        <div>
          <dt className="font-semibold text-[#8b9bb4]">编码</dt>
          <dd>{item.code}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#8b9bb4]">拼音</dt>
          <dd>{item.pinyin || "-"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#8b9bb4]">例字</dt>
          <dd>{item.example || "-"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#8b9bb4]">描述</dt>
          <dd>{item.description || "-"}</dd>
        </div>
      </dl>
    </div>
  );
}
