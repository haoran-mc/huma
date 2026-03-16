export const BOX_SIZE = 32;
export const MASTERY_COUNT = 8;

const HISTORY_SIZE = 8;
const STICKY_FACTOR = 3;

export type PracticeState = {
  /** 每个字根的连续答对次数：-1 = 尚未进入盒子，0–7 = 在盒子中，≥ MASTERY_COUNT = 已掌握 */
  counts: number[];
  /** 最近出题的字根索引列表，最旧的在前，最多保留 HISTORY_SIZE 条 */
  recentHistory: number[];
};

function getBox(counts: number[]): number[] {
  const box: number[] = [];
  for (let i = 0; i < counts.length; i++) {
    if (counts[i] >= 0 && counts[i] < MASTERY_COUNT) box.push(i);
  }
  return box;
}

/** 将尚未进入盒子（count === -1）的字根依次放入，直到盒子容量达到 BOX_SIZE。 */
function fillBox(counts: number[]): number[] {
  const next = [...counts];
  let slots = BOX_SIZE - getBox(counts).length;
  for (let i = 0; i < next.length && slots > 0; i++) {
    if (next[i] === -1) {
      next[i] = 0;
      slots--;
    }
  }
  return next;
}

function itemWeight(itemIndex: number, count: number, history: number[]): number {
  // 连续答对次数越低，权重越高；采用平方关系使各档位差距更加显著
  const countWeight = (MASTERY_COUNT - count) ** 2;

  // 黏性加分：历史中每次出现得 (位置索引 + 1) 分，越靠近当前得分越高
  let recencyScore = 0;
  for (let p = 0; p < history.length; p++) {
    if (history[p] === itemIndex) recencyScore += p + 1;
  }
  return countWeight + STICKY_FACTOR * recencyScore;
}

export function createInitialState(total: number): PracticeState {
  const counts = Array<number>(total).fill(-1);
  return { counts: fillBox(counts), recentHistory: [] };
}

/**
 * 从盒子中加权随机抽取下一个字根。
 * 排除上一题出现的字根（盒子中仅剩一个时例外，避免死锁）。
 * 盒子为空时返回 -1，表示本轮练习结束。
 */
export function pickNext(state: PracticeState): number {
  const box = getBox(state.counts);
  if (box.length === 0) return -1;

  const lastShown = state.recentHistory.at(-1) ?? -1;
  const candidates = box.length > 1 ? box.filter((i) => i !== lastShown) : box;

  const weights = candidates.map((i) => itemWeight(i, state.counts[i], state.recentHistory));
  const total = weights.reduce((s, w) => s + w, 0);

  let r = Math.random() * total;
  for (let k = 0; k < candidates.length; k++) {
    r -= weights[k];
    if (r <= 0) return candidates[k];
  }
  return candidates[candidates.length - 1];
}

function pushHistory(history: number[], itemIndex: number): number[] {
  const next = [...history, itemIndex];
  if (next.length > HISTORY_SIZE) next.shift();
  return next;
}

export function onCorrect(state: PracticeState, itemIndex: number): PracticeState {
  const counts = [...state.counts];
  counts[itemIndex] += 1;
  const finalCounts = counts[itemIndex] >= MASTERY_COUNT ? fillBox(counts) : counts;
  return { counts: finalCounts, recentHistory: pushHistory(state.recentHistory, itemIndex) };
}

export function onWrong(state: PracticeState, itemIndex: number): PracticeState {
  const counts = [...state.counts];
  counts[itemIndex] = 0;
  return { counts, recentHistory: pushHistory(state.recentHistory, itemIndex) };
}

export function isSessionComplete(state: PracticeState): boolean {
  return state.counts.every((c) => c >= MASTERY_COUNT);
}
