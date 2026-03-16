- 框架：Next.js
- 语言：TypeScript
- 路由：App Router
- 样式：Tailwind CSS
- 代码检查：ESLint
- 开发环境：Node.js 20.x
- 包管理器：npm
- 图标库：lucide-react
- 类名工具：clsx

# 一、项目初始化

- 创建项目：`npx create-next-app@latest huma`，create-next-app 是 Next.js 官方提供的项目脚手架
- 推荐选项：TypeScript、ESLint、Tailwind CSS、src 目录、App Router、Turbopack
- 启动项目：`npm run dev`
- 访问地址：`http://localhost:9530`

# 二、练习算法

算法维护一个**盒子**，盒子里最多容纳 **32 个字根**。每个字根有一个 `succCount` 属性，表示连续答对的次数，初始值为 `-1`，代表"尚未进入盒子"。

| 状态 | 含义 |
|------|------|
| `succCount = -1` | 尚未进入盒子 |
| `succCount = 0 ~ 7` | 在盒子中，正在练习 |
| `succCount = 8` | 已掌握，从盒子中永久移除 |

- 练习开始时，从所有字根中依次取出前 32 个放入盒子，其 `succCount` 置为 `0`。
- 正确：该字根 `succCount + 1`。
- 错误：该字根 `succCount` 重置为 `0`。
- 当某字根 `succCount` 达到 **8**，视为完全掌握，将其从盒子中移除，同时从尚未进入盒子的字根中按序取出一个补位。
- 当所有字根的 `succCount` 均达到 8，本轮练习结束。

> 选题权重：
>
> 每次出题时，从盒子中按**加权随机**的方式抽取字根，权重由两部分叠加而成：
>
> 1. 熟练度权重（低熟练度优先）
>
> $$w_{\text{mastery}} = (8 - \text{succCount})^2$$
>
> `succCount` 越小，权重越大，平方关系使差距更加显著。
>
> 2. 黏性权重（近期出现优先）
>
> 维护最近 **8 次**出题的历史记录。对于历史中的每次出现，按其距当前的远近赋予分值：位置越靠近当前得分越高。
>
> $$w_{\text{sticky}} = \sum_{p \in \text{history}} (p + 1), \quad p \text{ 为该字根在历史中的位置索引（从0计）}$$
>
> 最终权重为：
>
> $$w = w_{\text{mastery}} + 3 \times w_{\text{sticky}}$$
>
> 3. 不连续出同一字根
>
> 每次抽题时，排除上一题出现的字根。当盒子仅剩一个字根时例外，避免死锁。
>
> 4. 引入新字根的顺序
>
> 每次向盒子补充尚未引入的字根时（初次填充或盒子扩大），不按索引顺序，而是：
> - 优先选择 `succCount` 较大的字根（已有一定基础）；
> - `succCount` 相同的字根之间随机选取（Fisher-Yates 打乱同分组）。
>
> 目前所有未引入字根的初始 `succCount` 均为 `-1`，因此实际效果为**随机引入**，避免每次都从第一个字根开始。

## 动态盒子大小

盒子的初始大小为 **8**，最小为 **8**，最大为 **32**，会根据当前整体熟练度自动调整。

### 调整时机

每次答题后（无论对错），系统重新计算盒子大小，并立即重建活跃字根集合。

### 盒子大小的计算

统计所有**已引入但未掌握**字根的平均 `succCount`，线性映射到盒子大小：

$$\text{boxSize} = \text{round}\!\left(8 + \frac{\overline{\text{succCount}}}{7} \times (32 - 8)\right)$$

| 平均 succCount | 盒子大小（近似值） |
|---------------|-----------------|
| 0 | 8 |
| 3.5 | 20 |
| 7 | 32 |

### 活跃字根的选取

在所有已引入未掌握的字根中，按 `succCount` 升序排列，取前 `boxSize` 个作为当前活跃字根：

- **盒子缩小**：`succCount` 较高的字根（相对熟练）被暂时移出，系统集中练习最薄弱的字根；
- **盒子扩大**：从搁置区中取 `succCount` 较高的字根重新加入，优先引入已有一定基础的字根，而不是全新的字根；
- 若已引入字根数量不足，则按原始顺序补充尚未引入的字根（`succCount` 初始化为 0）。

# 三、持久化练习进度

每当有字根首次达到 `succCount = 8`（即完全掌握）时，系统自动将当前所有字根的进度持久化到本地文件。

## 存储格式

进度保存在 `data/progress.json`，格式为每个字根的索引与 `succCount` 的数组：

```json
[
  { "index": 0, "succCount": 8 },
  { "index": 1, "succCount": 3 },
  { "index": 2, "succCount": -1 }
]
```

- `succCount = -1`：尚未引入
- `succCount = 0 ~ 7`：练习中
- `succCount = 8`：已掌握

## 读写方式

通过 Next.js API 路由 `app/api/progress/route.ts` 进行文件读写：

- `GET /api/progress`：读取 `data/progress.json`，文件不存在时返回空数组
- `POST /api/progress`：将最新进度写入 `data/progress.json`

## 恢复流程

练习页面挂载时，自动请求 `GET /api/progress`。若存档非空，则从中还原 `counts` 数组，重建 `PracticeState`（包括动态盒子大小计算），并从上次中断处继续练习。