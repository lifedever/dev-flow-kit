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
    let parsed: any;
    try {
      // 尝试处理带引号或者不带引号的模拟 JSON 字符串
      let toParse = rawInput.value.trim();
      if (
        !toParse.startsWith('"') &&
        !toParse.startsWith("{") &&
        !toParse.startsWith("[")
      ) {
        toParse = `"${toParse}"`;
      }
      parsed = JSON.parse(toParse);
    } catch {
      // 如果 JSON 解析完全失败，手动进行常见转义字符替换
      return rawInput.value
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, "\\")
        .replace(/\\t/g, "\t");
    }

    let result = "";
    if (typeof parsed === "string") {
      result = parsed;
    } else if (typeof parsed === "object" && parsed !== null) {
      if (parsed.content) result = parsed.content;
      else if (parsed.message?.content) result = parsed.message.content;
      else if (parsed.answer) result = parsed.answer;
      else result = JSON.stringify(parsed, null, 2);
    } else {
      result = String(parsed);
    }

    // 归一化换行符，处理可能混入的真 \r\n
    return result.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
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
    setTimeout(() => (copySuccess.value = false), 1500);
  } catch (e) {
    console.error("Copy failed", e);
  }
};
</script>

<template>
  <div class="page">
    <div class="topbar">
      <router-link to="/" class="back">← 返回</router-link>
      <h1>Markdown Cleaner</h1>
      <div></div>
    </div>

    <div class="panels">
      <div class="panel">
        <div class="panel-header">
          <span>原始内容</span>
          <button v-if="rawInput" @click="rawInput = ''">清空</button>
        </div>
        <textarea
          v-model="rawInput"
          placeholder='粘贴 JSON 字符串，如: "Hello\\nWorld"'
          class="editor"
        ></textarea>
      </div>

      <div class="panel">
        <div class="panel-header">
          <span>预览</span>
          <button @click="copyToClipboard" :class="{ success: copySuccess }">
            {{ copySuccess ? "已复制" : "复制" }}
          </button>
        </div>
        <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
        <div class="preview markdown-body" v-html="markdownPreview"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.back {
  font-size: 14px;
  color: var(--text-dim);
}

.topbar h1 {
  font-size: 18px;
  font-weight: 700;
}

.panels {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  min-height: 0;
}

.panel {
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-dim);
}

.panel-header button {
  padding: 4px 10px;
  font-size: 12px;
}

.panel-header button.success {
  background: var(--success);
  color: white;
  border-color: var(--success);
}

.editor {
  flex: 1;
  border: none;
  border-radius: 0;
  padding: 14px;
  font-family: "SF Mono", "Menlo", monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  background: #fafafa;
}

.editor:focus {
  box-shadow: none;
}

.preview {
  flex: 1;
  padding: 14px;
  overflow-y: auto;
  font-size: 15px;
  line-height: 1.6;
}

.error {
  background: #fef2f2;
  color: #dc2626;
  padding: 10px 14px;
  font-size: 13px;
}

:deep(.markdown-body h1),
:deep(.markdown-body h2),
:deep(.markdown-body h3) {
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

:deep(.markdown-body pre) {
  background: #f4f4f5;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 13px;
}

:deep(.markdown-body code) {
  background: #f4f4f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 90%;
}

:deep(.markdown-body pre code) {
  background: none;
  padding: 0;
}

:deep(.markdown-body blockquote) {
  border-left: 3px solid #e4e4e7;
  padding-left: 12px;
  color: var(--text-dim);
  margin: 1em 0;
}

:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  padding-left: 1.5em;
}
</style>
