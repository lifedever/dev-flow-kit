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
  padding: 80px 20px;
}

header {
  text-align: center;
  margin-bottom: 70px;
  max-width: 600px;
}

h1 {
  font-size: 3.5rem;
  font-weight: 900;
  letter-spacing: -0.05em;
  margin-bottom: 1rem;
  color: var(--text);
  line-height: 1;
}

p.description {
  font-size: 1.25rem;
  color: var(--text-dim);
  line-height: 1.6;
  font-weight: 500;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1000px;
}

.tool-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 2.5rem;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.02),
    0 2px 4px -1px rgba(0, 0, 0, 0.01);
  text-align: left;
}

.tool-card:hover {
  transform: translateY(-6px);
  border-color: var(--primary);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.05),
    0 10px 10px -5px rgba(0, 0, 0, 0.02);
}

.icon-box {
  width: 56px;
  height: 56px;
  background: #f8fafc;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}

.tool-card:hover .icon-box {
  background: #eff6ff;
  border-color: var(--primary);
  transform: scale(1.05);
}

.tool-name {
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  color: var(--text);
  letter-spacing: -0.02em;
}

.tool-desc {
  font-size: 0.95rem;
  color: var(--text-dim);
  line-height: 1.6;
  flex-grow: 1;
}

.badge {
  margin-top: 2rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge::after {
  content: "→";
  transition: transform 0.3s ease;
}

.tool-card:hover .badge::after {
  transform: translateX(6px);
}

.placeholder-card {
  border: 2px dashed var(--border);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-dim);
  font-size: 0.9rem;
  font-weight: 600;
  min-height: 250px;
  border-radius: 24px;
}

footer {
  margin-top: 100px;
  color: var(--text-dim);
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.05em;
}

footer a {
  color: var(--text);
  text-decoration: none;
  border-bottom: 1px solid var(--border);
  padding-bottom: 2px;
  transition: all 0.2s;
}

footer a:hover {
  border-color: var(--primary);
  color: var(--primary);
}
</style>
