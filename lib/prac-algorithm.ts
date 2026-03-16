export const MIN_BOX_SIZE = 8;
export const MAX_BOX_SIZE = 32;
export const MASTERY_COUNT = 8;

const HISTORY_SIZE = 8;
const STICKY_FACTOR = 3;

export type PracticeState = {
  /** 每个字根的连续答对次数：-1 = 尚未进入盒子，0–7 = 已引入（活跃或暂时搁置），≥ MASTERY_COUNT = 已掌握 */
  counts: number[];
  /** 当前活跃盒子中的字根索引集合 */
  activeIndices: number[];
  /** 最近出题的字根索引列表，最旧的在前，最多保留 HISTORY_SIZE 条 */
  recentHistory: number[];
};

/**
 * 根据所有已引入但未掌握字根的平均 succCount，动态计算盒子目标大小。
 * 平均熟练度越低 → 盒子越小（收窄焦点）；越高 → 盒子越大（扩充挑战）。
 * 结果线性映射到 [MIN_BOX_SIZE, MAX_BOX_SIZE]。
 */
export function computeBoxSize(counts: number[]): number {
  const introduced = counts.filter((c) => c >= 0 && c < MASTERY_COUNT);
  if (introduced.length === 0) return MIN_BOX_SIZE;
  const avg = introduced.reduce((s, c) => s + c, 0) / introduced.length;
  const ratio = avg / (MASTERY_COUNT - 1);
  return Math.min(
    MAX_BOX_SIZE,
    Math.max(MIN_BOX_SIZE, Math.round(MIN_BOX_SIZE + ratio * (MAX_BOX_SIZE - MIN_BOX_SIZE)))
  );
}

/**
 * 重建活跃盒子：
 * 1. 将所有已引入未掌握字根按 succCount 升序排列（熟练度低的优先留在盒子里）；
 * 2. 取前 targetSize 个作为活跃字根；
 * 3. 若已引入数量不足，则从尚未引入的字根中按序补充（succCount 初始化为 0）。
 *
 * 结果：
 * - 盒子缩小时，succCount 较高的字根（相对熟练）被移出，集中练习薄弱项；
 * - 盒子扩大时，从搁置区中 succCount 较高的字根（已有一定基础）重新加入。
 */
function rebuildBox(
  counts: number[],
  targetSize: number
): { counts: number[]; activeIndices: number[] } {
  const next = [...counts];

  // 已引入未掌握，按 succCount 升序
  const pool = next
    .map((c, i) => ({ i, c }))
    .filter(({ c }) => c >= 0 && c < MASTERY_COUNT)
    .sort((a, b) => a.c - b.c);

  // 不足时从未引入字根中补充：按 succCount 降序，同分组内随机打乱后依次取用
  const slots = targetSize - pool.length;
  if (slots > 0) {
    const locked = next
      .map((c, i) => ({ i, c }))
      .filter(({ c }) => c === -1)
      .sort((a, b) => b.c - a.c);

    // 同分组内 Fisher-Yates 随机打乱
    let groupStart = 0;
    while (groupStart < locked.length) {
      let groupEnd = groupStart + 1;
      while (groupEnd < locked.length && locked[groupEnd].c === locked[groupStart].c) groupEnd++;
      for (let k = groupEnd - 1; k > groupStart; k--) {
        const j = groupStart + Math.floor(Math.random() * (k - groupStart + 1));
        [locked[k], locked[j]] = [locked[j], locked[k]];
      }
      groupStart = groupEnd;
    }

    for (const { i } of locked.slice(0, slots)) {
      next[i] = 0;
      pool.push({ i, c: 0 });
    }
  }

  const activeIndices = pool.slice(0, targetSize).map(({ i }) => i);
  return { counts: next, activeIndices };
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
  const { counts: filledCounts, activeIndices } = rebuildBox(counts, MIN_BOX_SIZE);
  return { counts: filledCounts, activeIndices, recentHistory: [] };
}

/**
 * 从活跃盒子中加权随机抽取下一个字根。
 * 排除上一题出现的字根（盒子中仅剩一个时例外，避免死锁）。
 * 盒子为空时返回 -1，表示本轮练习结束。
 */
export function pickNext(state: PracticeState): number {
  const box = state.activeIndices;
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
  const targetSize = computeBoxSize(counts);
  const { counts: newCounts, activeIndices } = rebuildBox(counts, targetSize);
  return { counts: newCounts, activeIndices, recentHistory: pushHistory(state.recentHistory, itemIndex) };
}

export function onWrong(state: PracticeState, itemIndex: number): PracticeState {
  const counts = [...state.counts];
  counts[itemIndex] = 0;
  const targetSize = computeBoxSize(counts);
  const { counts: newCounts, activeIndices } = rebuildBox(counts, targetSize);
  return { counts: newCounts, activeIndices, recentHistory: pushHistory(state.recentHistory, itemIndex) };
}

export function isSessionComplete(state: PracticeState): boolean {
  return state.counts.every((c) => c >= MASTERY_COUNT);
}

export type ProgressEntry = { index: number; succCount: number };

/** 将 counts 数组序列化为可持久化的格式。 */
export function serializeProgress(counts: number[]): ProgressEntry[] {
  return counts.map((succCount, index) => ({ index, succCount }));
}

/** 从持久化数据还原 counts 数组，超出范围的条目自动忽略。 */
export function deserializeProgress(entries: ProgressEntry[], total: number): number[] {
  const counts = Array<number>(total).fill(-1);
  for (const { index, succCount } of entries) {
    if (index >= 0 && index < total) counts[index] = succCount;
  }
  return counts;
}

/** 从已有 counts 数组重建完整的 PracticeState（用于从持久化数据恢复）。 */
export function createStateFromCounts(counts: number[]): PracticeState {
  const targetSize = computeBoxSize(counts);
  const { counts: newCounts, activeIndices } = rebuildBox(counts, targetSize);
  return { counts: newCounts, activeIndices, recentHistory: [] };
}
