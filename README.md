# 🛠️ Dev Flow Kit

**Dev Flow Kit** 是一个小巧、现代、高度集成的开发者个人工具箱。它旨在通过一系列轻量化的工具，帮助高效开发者管理工作流中零散但高频的需求，如额度监控、文本清洗等。

### 🔗 在线访问

[**https://lifedever.github.io/dev-flow-kit/**](https://lifedever.github.io/dev-flow-kit/)

---

## 🧰 核心工具

### ⚡ Cursor Flow (额度管家)

专为 Cursor Ultra 套餐用户设计的额度监控工具。

- **智能平摊算法**：支持“仅计算工作日”模式，比单纯的自然日平均更符合真实开发节奏。
- **实时燃尽分析**：直观展示当前消耗进度与理想进度的对比。
- **智能预警**：根据消耗速度自动切换状态（🔥超支 / ❄️结余），并提供每日预算建议。
- **到期提醒**：自动计算并显示当前周期的重置日期。

### 🧹 Markdown Cleaner (内容清洗)

一键修复大语言模型（LLM）接口返回的转义难题。

- **深度反转义**：彻底清洗 `\n`, `\r\n`, `\"` 等转义字符。
- **JSON 智能容错**：支持直接粘贴整个 JSON 对象或被截断的字符串。
- **所见即所得**：内置 GitHub 风格的 Markdown 预览，支持代码高亮与表格。
- **一键复制**：清洗后的内容可秒速推送到剪贴板。

---

## ✨ 设计理念

- **简约而不简单**：遵循 macOS 审美，采用精致的浅色系 UI、适度的阴影与平衡的层次感。
- **极致紧凑**：拒绝冗余信息，工具页面布局高度对齐，操作路径极短。
- **数据本地化**：所有配置与数据均存储在浏览器 `localStorage` 中，绝不上传服务器，保护隐私。

---

## 🚀 技术栈

- **核心框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **脚本语言**：TypeScript
- **路由管理**：Vue Router 4
- **Markdown 解析**：Marked

---

## 💻 本地开发

```bash
# 克隆仓库
git clone https://github.com/lifedever/dev-flow-kit.git

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

---

## 🛡️ License

MIT Copyright (c) 2026 [lifedever](https://github.com/lifedever)
