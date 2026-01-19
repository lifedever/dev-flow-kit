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
  height: 100vh;
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header-nav {
  margin-bottom: 1.5rem;
}

.header-nav a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-dim);
  text-decoration: none;
}

.main-card {
  background: var(--card-bg);
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  overflow: hidden;
}

header {
  text-align: center;
  margin-bottom: 2rem;
}
header h1 {
  color: var(--text);
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 800;
}
.subtitle {
  color: var(--text-dim);
  font-size: 0.9rem;
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  flex: 1;
  min-height: 0;
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
  margin-bottom: 1rem;
}
.col-header h3 {
  font-size: 0.75rem;
  color: var(--text-dim);
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.editor-area {
  flex: 1;
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
  color: #334155;
  font-family: "JetBrains Mono", "Fira Code", "Menlo", monospace;
  font-size: 0.85rem;
  line-height: 1.6;
  resize: none;
}

.preview-mode {
  flex: 1;
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  overflow-y: auto;
  color: #1e293b;
  text-align: left;
}

.btn-copy,
.btn-clear {
  padding: 0.4rem 0.8rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 8px;
}

.success {
  background: var(--success) !important;
  color: white !important;
  border-color: var(--success) !important;
}

.error-banner {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  margin-bottom: 1rem;
}

/* Markdown Styles Refined */
:deep(.markdown-body) {
  font-size: 0.9rem;
  line-height: 1.7;
}
:deep(.markdown-body h1),
:deep(.markdown-body h2) {
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.3em;
  margin-top: 1.5em;
  margin-bottom: 1rem;
}
:deep(.markdown-body pre) {
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
  overflow-x: auto;
  margin: 1rem 0;
}
:deep(.markdown-body code) {
  background: #f1f5f9;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 85%;
  color: #ef4444;
  font-family: inherit;
}
:deep(.markdown-body pre code) {
  background: none;
  color: inherit;
  padding: 0;
  font-size: 0.8rem;
}
:deep(.markdown-body blockquote) {
  border-left: 4px solid #e2e8f0;
  color: #64748b;
  padding-left: 1rem;
  margin: 1.5rem 0;
}
:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  padding-left: 1.5rem;
}
</style>
