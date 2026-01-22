<script setup lang="ts"></script>

<template>
  <div class="home">
    <header>
      <h1>Dev Flow Kit</h1>
      <p>高效开发者的私人工具箱</p>
    </header>

    <div class="grid">
      <router-link to="/cursor-flow" class="card">
        <div class="card-icon">⚡</div>
        <div class="card-content">
          <h3>Cursor Flow</h3>
          <p>Cursor Ultra 额度管理，支持工作日算法与燃尽率分析</p>
        </div>
        <span class="arrow">→</span>
      </router-link>

      <router-link to="/json-cleaner" class="card">
        <div class="card-icon">🧹</div>
        <div class="card-content">
          <h3>Markdown Cleaner</h3>
          <p>JSON 转义字符一键清洗，还原可读 Markdown</p>
        </div>
        <span class="arrow">→</span>
      </router-link>

      <router-link to="/mirror" class="card">
        <div class="card-icon">🪞</div>
        <div class="card-content">
          <h3>Mirror</h3>
          <p>调用摄像头，整理仪容</p>
        </div>
        <span class="arrow">→</span>
      </router-link>

      <div class="card placeholder">
        <span>更多工具开发中...</span>
      </div>
    </div>

    <footer>
      <a href="https://github.com/lifedever" target="_blank">@lifedever</a>
    </footer>
  </div>
</template>

<style scoped>
.home {
  max-width: 640px;
  margin: 0 auto;
  padding: 48px 16px;
}

header {
  margin-bottom: 32px;
}

header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}

header p {
  color: var(--text-dim);
  font-size: 14px;
}

.grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.15s;
}

.card:hover {
  border-color: #d4d4d8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card:hover .arrow {
  transform: translateX(2px);
  color: var(--primary);
}

.card-icon {
  width: 36px;
  height: 36px;
  background: #f4f4f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-content h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 2px;
}

.card-content p {
  font-size: 12px;
  color: var(--text-dim);
  line-height: 1.4;
}

.arrow {
  color: #d4d4d8;
  font-size: 14px;
  transition: all 0.15s;
}

.placeholder {
  justify-content: center;
  color: var(--text-dim);
  font-size: 12px;
  border-style: dashed;
  padding: 24px;
}

footer {
  margin-top: 48px;
  text-align: center;
  font-size: 12px;
  color: var(--text-dim);
}

footer a {
  color: var(--text-dim);
}

footer a:hover {
  color: var(--primary);
}
</style>
