export type PracticeItem = {
  radical: string;
  code: string;
  description: string;
};

export const PRACTICE_ITEMS: PracticeItem[] = [
  { radical: "疋⺪", code: "ts", description: "" },
  { radical: "疒", code: "ab", description: "疒字根，编码为 ab。" },
  { radical: "丁", code: "ad", description: "丁字根，编码为 ad。" },
  { radical: "鬼", code: "ag", description: "鬼字根，编码为 ag。" },
  { radical: "乙", code: "ai", description: "乙字根，编码为 ai。" },
  { radical: "音", code: "xy", description: "音字根，编码为 xy。" },
  { radical: "弓", code: "bg", description: "弓字根，编码为 bg。" },
  { radical: "未", code: "aw", description: "未字根，编码为 aw。" },
];
