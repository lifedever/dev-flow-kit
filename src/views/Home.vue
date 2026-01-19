<script setup lang="ts"></script>

<template>
  <div class="home-container">
    <header>
      <h1>Dev Flow Kit</h1>
      <p class="description">
        高效开发者的私人工具箱，旨在管理工作流与资源额度。
      </p>
    </header>

    <div class="tool-grid">
      <!-- Cursor Flow Tool -->
      <router-link to="/cursor-flow" class="tool-card">
        <div class="icon-box">⚡</div>
        <div class="tool-name">Cursor Flow</div>
        <div class="tool-desc">
          针对 Cursor Ultra
          套餐的精准额度管理工具。支持工作日平摊算法、燃尽率分析及智能预算建议。
        </div>
        <div class="badge">立即使用</div>
      </router-link>

      <!-- New: JSON Cleaner Tool -->
      <router-link to="/json-cleaner" class="tool-card">
        <div class="icon-box">🧼</div>
        <div class="tool-name">Markdown Cleaner</div>
        <div class="tool-desc">
          专治大模型接口返回的“灾难级”JSON
          转义字符串。一键反转义，还原清晰可读的 Markdown 源码。
        </div>
        <div class="badge">立即使用</div>
      </router-link>

      <!-- Placeholder -->
      <div class="placeholder-card">更多工具开发中...</div>
    </div>

    <footer>
      &copy; 2026 POWERED BY
      <a href="https://github.com/lifedever" target="_blank">lifedever</a>
    </footer>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

header {
  text-align: center;
  margin-bottom: 60px;
  max-width: 600px;
}

h1 {
  font-size: 42px;
  font-weight: 800;
  letter-spacing: -0.04em;
  margin-bottom: 16px;
  color: var(--text-main);
}

p.description {
  font-size: 18px;
  color: var(--text-dim);
  line-height: 1.6;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  width: 100%;
  max-width: 900px;
}

.tool-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 32px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  text-align: left;
}

.tool-card:hover {
  transform: translateY(-8px);
  border-color: var(--primary);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.icon-box {
  width: 48px;
  height: 48px;
  background: #eff6ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 20px;
  border: 1px solid #dbeafe;
}

.tool-name {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #0f172a;
}

.tool-desc {
  font-size: 14px;
  color: var(--text-dim);
  line-height: 1.5;
  flex-grow: 1;
}

.badge {
  margin-top: 16px;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--primary);
  display: flex;
  align-items: center;
}

.badge::after {
  content: "→";
  margin-left: 6px;
  transition: transform 0.2s;
}

.tool-card:hover .badge::after {
  transform: translateX(4px);
}

.placeholder-card {
  border: 2px dashed #e2e8f0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 14px;
  min-height: 200px;
  border-radius: 24px;
}

footer {
  margin-top: 60px;
  color: #94a3b8;
  font-size: 12px;
  letter-spacing: 0.05em;
}

footer a {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
