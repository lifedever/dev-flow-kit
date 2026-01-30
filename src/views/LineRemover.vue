<script setup lang="ts">
import { ref, computed } from "vue";
import ToolPage from "../components/ToolPage.vue";

const rawInput = ref("");
const copySuccess = ref(false);

const cleanedContent = computed(() => {
  if (!rawInput.value) return "";

  const lines = rawInput.value.split(/\r?\n/);

  // 1. 尝试检测公共前缀（针对所有行都有行号的情况，行号可能在缩进之后）
  // 匹配模式：可选空格 + 数字 + (空格/点/冒号/竖线/结束)
  const lineNumRegex = /^(\s*)(\d+)([\s.|:]|$)(.*)/;

  // 先处理每一行，提取潜在的代码部分
  const processedLines = lines.map((line) => {
    const match = line.match(lineNumRegex);
    if (match && match[3] !== undefined && match[4] !== undefined) {
      // match[1] 是行号前的空格
      // match[2] 是行号
      // match[3] 是分隔符
      // match[4] 是后面的实际代码内容

      // 如果 match[4] 只有空白且 match[3] 不是明显的分隔符，说明这行可能原本就是个空行，只是带了行号
      if (!match[4].trim() && ![".", ":", "|"].includes(match[3].trim())) {
        return "";
      }
      return match[4];
    }
    return line;
  });

  return processedLines.join("\n");
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
  <ToolPage title="Line Number Remover" maxWidth="1200px">
    <div class="panels">
      <div class="panel">
        <div class="panel-header">
          <span>带行号的内容</span>
          <button v-if="rawInput" @click="rawInput = ''">清空</button>
        </div>
        <textarea
          v-model="rawInput"
          placeholder="在此粘贴带行号的代码..."
          class="editor"
        ></textarea>
      </div>

      <div class="panel">
        <div class="panel-header">
          <span>清洗后的内容</span>
          <button @click="copyToClipboard" :class="{ success: copySuccess }">
            {{ copySuccess ? "已复制" : "复制结果" }}
          </button>
        </div>
        <textarea
          :value="cleanedContent"
          readonly
          class="editor result"
          placeholder="清洗后的内容将显示在这里..."
        ></textarea>
      </div>
    </div>
  </ToolPage>
</template>

<style scoped>
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
  font-family: "SF Mono", "Menlo", "Fira Code", monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
  background: #fafafa;
  outline: none;
}

.result {
  background: #ffffff;
}

.editor:focus {
  box-shadow: none;
}
</style>
