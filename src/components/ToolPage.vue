<script setup lang="ts">
defineProps<{
  title: string;
  backTo?: string;
  maxWidth?: string;
}>();
</script>

<template>
  <div class="tool-page" :style="{ maxWidth: maxWidth || '1200px' }">
    <div class="topbar">
      <router-link :to="backTo || '/'" class="back-link">← 返回</router-link>
      <h1 class="title">{{ title }}</h1>
      <div class="header-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    <main class="content">
      <slot></slot>
    </main>
  </div>
</template>

<style scoped>
.tool-page {
  margin: 0 auto;
  padding: 16px;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  height: 32px;
}

.back-link {
  font-size: 14px;
  color: var(--text-dim);
  width: 80px; /* 保持平衡 */
}

.title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  text-align: center;
  flex: 1;
}

.header-actions {
  width: 80px; /* 保持平衡 */
  display: flex;
  justify-content: flex-end;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
