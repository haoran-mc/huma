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
> 系数 `3` 用于平衡两种权重的量级，使黏性效果可感知但不会完全压过熟练度排序。
