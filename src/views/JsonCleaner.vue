<script setup lang="ts">
import { ref, computed } from "vue";
import { marked } from "marked";

const rawInput = ref("");
const errorMsg = ref("");
const copySuccess = ref(false);

const cleanedContent = computed(() => {
  errorMsg.value = "";
  if (!rawInput.value) return "";

  try {
    // 尝试策略1：直接 JSON.parse
    // 很多时候大模型返回的是 {"content": "..."} 或者直接就是 "..." 字符串
    // 如果用户粘贴的是整个 JSON 对象，我们尝试提取 content 字段
    let parsed: any;
    try {
      parsed = JSON.parse(rawInput.value);
    } catch (e) {
      // 如果不是合法的 JSON，可能是部分截断的字符串，或者用户只粘贴了值的一部分
      // 尝试策略2：简单的正则替换反转义
      let manual = rawInput.value
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\")
        .replace(/\\t/g, "\t");
      return manual;
    }

    if (typeof parsed === "string") {
      return parsed;
    } else if (typeof parsed === "object" && parsed !== null) {
      // 智能寻找可能是 Markdown 内容的字段
      if (parsed.content) return parsed.content;
      if (parsed.message && parsed.message.content)
        return parsed.message.content;
      if (parsed.answer) return parsed.answer;

      // 如果找不到，就漂亮地打印整个对象
      return JSON.stringify(parsed, null, 2);
    }

    return String(parsed);
  } catch (e: any) {
    errorMsg.value = "解析失败：" + e.message;
    return rawInput.value;
  }
});

const markdownPreview = computed(() => {
  if (!cleanedContent.value) return "";
  return marked(cleanedContent.value);
});

const copyToClipboard = async () => {
  if (!cleanedContent.value) return;
  try {
    await navigator.clipboard.writeText(cleanedContent.value);
    copySuccess.value = true;
    setTimeout(() => (copySuccess.value = false), 2000);
  } catch (e) {
    console.error("Copy failed", e);
  }
};
</script>

<template>
  <div class="cleaner-container">
    <div class="header-nav">
      <router-link to="/">&larr; Back to Home</router-link>
    </div>

    <div class="main-card">
      <header>
        <h1>Markdown Cleaner</h1>
        <p class="subtitle">JSON 转义字符一键清洗工具</p>
      </header>

      <div class="grid-layout">
        <!-- 输入区 -->
        <div class="column">
          <div class="col-header">
            <h3>原始字符串 (Raw JSON String)</h3>
            <button class="btn-clear" @click="rawInput = ''" v-if="rawInput">
              清空
            </button>
          </div>
          <textarea
            v-model="rawInput"
            placeholder='粘贴如: "Here is code:\\n```python..."'
            class="editor-area input-area"
          ></textarea>
        </div>

        <!-- 输出区 -->
        <div class="column">
          <div class="col-header">
            <h3>清洗结果 (Clean Markdown)</h3>
            <button
              class="btn-copy"
              @click="copyToClipboard"
              :class="{ success: copySuccess }"
            >
              {{ copySuccess ? "已复制" : "复制源码" }}
            </button>
          </div>

          <div v-if="errorMsg" class="error-banner">{{ errorMsg }}</div>

          <div class="output-tabs">
            <div
              class="tab-content preview-mode markdown-body"
              v-html="markdownPreview"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cleaner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-nav {
  width: 100%;
  text-align: left;
  margin-bottom: 20px;
}

.main-card {
  background: var(--card-bg);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  color: var(--text);
  overflow: hidden;
}

header {
  text-align: center;
  margin-bottom: 24px;
}
header h1 {
  color: #fff;
  margin: 0 0 8px 0;
  font-size: 24px;
}
.subtitle {
  color: var(--text-dim);
  font-size: 14px;
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  flex: 1;
  min-height: 0; /* 关键：让 flex 子项能够滚动 */
}

.column {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.col-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.col-header h3 {
  font-size: 14px;
  color: var(--text-dim);
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
}

.editor-area {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  color: #fff;
  font-family: "Menlo", "Monaco", monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: none;
}
.editor-area:focus {
  outline: none;
  border-color: var(--primary);
}

.preview-mode {
  flex: 1;
  background: #fff; /* 预览区用白底，方便看 Markdown 效果 */
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
  color: #1e293b;
  text-align: left;
}

.btn-copy,
.btn-clear {
  padding: 4px 12px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}
.btn-copy:hover {
  border-color: var(--primary);
  background: rgba(59, 130, 246, 0.2);
}
.success {
  background: var(--success) !important;
  color: white !important;
  border-color: var(--success) !important;
}

/* Markdown Styles Shim */
:deep(.markdown-body) {
  font-size: 14px;
  line-height: 1.6;
}
:deep(.markdown-body h1),
:deep(.markdown-body h2) {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.3em;
}
:deep(.markdown-body pre) {
  background: #f1f5f9;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}
:deep(.markdown-body code) {
  background: #f1f5f9;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 85%;
  font-family: monospace;
}
:deep(.markdown-body blockquote) {
  border-left: 4px solid #cbd5e1;
  color: #64748b;
  padding-left: 1em;
  margin: 0;
}
</style>
