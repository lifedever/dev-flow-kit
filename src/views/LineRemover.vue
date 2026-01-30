<script setup lang="ts">
import { ref, computed } from "vue";
import ToolPage from "../components/ToolPage.vue";

const rawInput = ref("");
const copySuccess = ref(false);

const cleanedContent = computed(() => {
  if (!rawInput.value) return "";

  const lines = rawInput.value.split(/\r?\n/);

  // 识别行号模式
  // 匹配类似 " 1 ", "1. ", "1: ", "1 | " 的模式
  return lines
    .map((line) => {
      // 1. 尝试匹配 "数字 + 空格/标点" 开头的行
      // ^\s* 开始
      // \d+ 数字
      // (?:[\s.|:]\s*) 后跟空格、点、冒号或竖线
      // 如果匹配成功，只替换掉开头的部分
      const regex = /^\s*\d+(?:[\s.|:]\s*)/;
      if (regex.test(line)) {
        return line.replace(regex, "");
      }

      // 如果没有匹配到明显的分隔符，但开头是数字且后面跟着内容
      // 比如 "1 server"
      const simpleRegex = /^\s*\d+\s+/;
      return line.replace(simpleRegex, "");
    })
    .join("\n");
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
