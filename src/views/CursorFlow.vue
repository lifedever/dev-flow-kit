<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";

interface State {
  currentSpend: number;
  resetDay: number;
  totalQuota: number;
  excludeWeekends: boolean;
  lastCycleId: string;
}

const state = reactive<State>({
  currentSpend: 0,
  resetDay: 1,
  totalQuota: 400,
  excludeWeekends: true,
  lastCycleId: "",
});

const saveTipVisible = ref(false);

// 辅助函数
const getCycleId = (resetDay: number) => {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  if (now.getDate() < resetDay) {
    month--;
    if (month < 0) {
      month = 11;
      year--;
    }
  }
  return `${year}-${month + 1}`;
};

const isWorkingDay = (date: Date) => {
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

const countDays = (start: Date, end: Date, excludeWeekends: boolean) => {
  let count = 0;
  let cur = new Date(start);
  while (cur <= end) {
    if (!excludeWeekends || isWorkingDay(cur)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

// 计算属性
const computedData = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  let start = new Date(year, month, state.resetDay);
  if (now < start) start = new Date(year, month - 1, state.resetDay);
  let end = new Date(
    start.getFullYear(),
    start.getMonth() + 1,
    state.resetDay - 1,
  );

  const totalWorkDays = countDays(start, end, state.excludeWeekends);
  const daysPassed = countDays(start, now, state.excludeWeekends);
  const tomorrow = new Date(now.getTime() + 86400000);
  const remainingDays = countDays(
    tomorrow > end ? end : tomorrow,
    end,
    state.excludeWeekends,
  );

  const cycleProgress = totalWorkDays > 0 ? daysPassed / totalWorkDays : 0;
  const idealSpend = state.totalQuota * cycleProgress;

  const isOver = state.currentSpend > idealSpend;
  const diff = Math.abs(state.currentSpend - idealSpend);
  const dailySafe =
    remainingDays > 0
      ? (state.totalQuota - state.currentSpend) / remainingDays
      : 0;

  const ratio = idealSpend > 0 ? state.currentSpend / idealSpend : 0;
  let status: "fire" | "ice" | "normal" = "normal";
  if (ratio > 1.25) status = "fire";
  else if (ratio < 0.75) status = "ice";

  return {
    idealSpend,
    cycleProgress,
    remainingDays,
    dailySafe,
    diff,
    isOver,
    status,
  };
});

// Action
const adjustSpend = (amount: number) => {
  state.currentSpend = Math.max(
    0,
    Number((state.currentSpend + amount).toFixed(2)),
  );
};

// 持久化
const loadState = () => {
  const saved = localStorage.getItem("cursor_flow_v3");
  if (saved) {
    Object.assign(state, JSON.parse(saved));
  }
  // Check cycle
  const currentId = getCycleId(state.resetDay);
  if (state.lastCycleId && state.lastCycleId !== currentId) {
    state.currentSpend = 0;
    state.lastCycleId = currentId;
  }
};

const saveState = () => {
  state.lastCycleId = getCycleId(state.resetDay);
  localStorage.setItem("cursor_flow_v3", JSON.stringify(state));
  saveTipVisible.value = true;
  setTimeout(() => {
    saveTipVisible.value = false;
  }, 1500);
};

onMounted(() => {
  loadState();
});

watch(state, () => {
  saveState();
});
</script>

<template>
  <div class="flow-container">
    <div class="header-nav">
      <router-link to="/">&larr; Back</router-link>
    </div>

    <div class="card-container">
      <header>
        <h1>Cursor Flow</h1>
        <p class="subtitle">Ultra Plan 额度监控</p>
        <div class="velocity-badge">
          <span class="emoji">{{
            computedData.status === "fire"
              ? "🔥"
              : computedData.status === "ice"
                ? "❄️"
                : "⚡"
          }}</span>
          <span class="velocity-label">燃尽率</span>
        </div>
      </header>

      <div
        class="status-badge"
        :class="computedData.isOver ? 'status-over' : 'status-on-track'"
      >
        {{ computedData.isOver ? "消耗过快" : "额度充裕" }}
      </div>

      <div class="stats-grid">
        <div
          class="stat-card"
          :class="{ 'card-fire': computedData.status === 'fire' }"
        >
          <div class="stat-label">已使用</div>
          <div class="stat-value">${{ state.currentSpend.toFixed(2) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">理想支出</div>
          <div class="stat-value">
            ${{ computedData.idealSpend.toFixed(2) }}
          </div>
        </div>
      </div>

      <div class="progress-box">
        <div class="progress-labels">
          <span>{{
            state.excludeWeekends ? "消耗进度 (工作日)" : "消耗进度 (自然日)"
          }}</span>
          <span
            >{{
              ((state.currentSpend / state.totalQuota) * 100).toFixed(1)
            }}%</span
          >
        </div>
        <div class="progress-bar">
          <div
            class="ideal-marker"
            :style="{ left: `${computedData.cycleProgress * 100}%` }"
          ></div>
          <div
            class="progress-fill"
            :style="{
              width: `${Math.min((state.currentSpend / state.totalQuota) * 100, 100)}%`,
              backgroundColor:
                state.currentSpend > computedData.idealSpend
                  ? 'var(--danger)'
                  : 'var(--success)',
            }"
          ></div>
        </div>
      </div>

      <div class="input-group">
        <label>更新已用金额 ($)</label>
        <input type="number" v-model="state.currentSpend" step="0.01" />
        <div class="quick-actions">
          <button class="btn-quick" @click="adjustSpend(1)">+$1</button>
          <button class="btn-quick" @click="adjustSpend(5)">+$5</button>
          <button class="btn-quick" @click="adjustSpend(10)">+$10</button>
          <button class="btn-quick" @click="adjustSpend(-1)">-$1</button>
        </div>
        <div class="save-tip" :style="{ opacity: saveTipVisible ? 1 : 0 }">
          ✓ 已保存
        </div>
      </div>

      <div class="advice-box">
        <div class="advice-title">
          {{
            computedData.isOver
              ? `当前预计超支 $${computedData.diff.toFixed(2)}`
              : `剩余结余额度 $${computedData.diff.toFixed(2)}`
          }}
        </div>
        <div class="advice-text">
          剩余 {{ computedData.remainingDays }} 天，每日可用预算 ${{
            computedData.dailySafe.toFixed(2)
          }}。
        </div>
      </div>

      <div class="config-panel">
        <div class="config-row">
          <div style="flex: 1">
            <label>每月重置日</label>
            <input type="number" v-model="state.resetDay" min="1" max="31" />
          </div>
          <div style="flex: 1">
            <label>总额 ($)</label>
            <input type="number" v-model="state.totalQuota" />
          </div>
        </div>

        <div
          class="switch-row"
          @click="state.excludeWeekends = !state.excludeWeekends"
        >
          <div>
            <span class="switch-label">仅计算工作日</span>
            <span class="switch-sublabel">跳过周末，平摊更科学</span>
          </div>
          <div class="switch">
            <input type="checkbox" :checked="state.excludeWeekends" />
            <span class="slider"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flow-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
}

.header-nav {
  width: 100%;
  max-width: 500px;
  text-align: left;
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

.card-container {
  width: 100%;
  max-width: 500px;
  background: var(--card-bg);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.04),
    0 8px 10px -6px rgba(0, 0, 0, 0.02);
  border: 1px solid var(--border);
  position: relative;
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

h1 {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: var(--text);
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 0.95rem;
  color: var(--text-dim);
}

.velocity-badge {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: #f8fafc;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.emoji {
  font-size: 1.25rem;
}
.velocity-label {
  font-size: 0.65rem;
  color: var(--text-dim);
  margin-top: 0.25rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}
.status-on-track {
  background: #ecfdf5;
  color: #059669;
}
.status-over {
  background: #fef2f2;
  color: #dc2626;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 16px;
  text-align: center;
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.card-fire {
  background: #fff5f5;
  border-color: #feb2b2;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-dim);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
}
.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text);
}

.progress-box {
  margin-bottom: 2.5rem;
}
.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
  color: var(--text-dim);
  font-weight: 500;
}
.progress-bar {
  height: 10px;
  background: #f1f5f9;
  border-radius: 100px;
  overflow: hidden;
  position: relative;
}
.progress-fill {
  height: 100%;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 100px;
}
.ideal-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #1e293b;
  z-index: 10;
  border-radius: 2px;
}

.input-group {
  margin-bottom: 2rem;
}
label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: var(--text-dim);
  font-weight: 600;
}
input {
  width: 100%;
  padding: 0.75rem 1rem;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
.btn-quick {
  flex: 1;
  background: #ffffff;
  padding: 0.6rem;
  font-size: 0.85rem;
  border-radius: 8px;
}
.btn-quick:hover {
  background: #f1f5f9;
  border-color: var(--primary);
  color: var(--primary);
}

.save-tip {
  font-size: 0.75rem;
  color: var(--success);
  margin-top: 0.5rem;
  text-align: right;
  height: 1rem;
  font-weight: 600;
  transition: opacity 0.3s;
}

.advice-box {
  padding: 1.5rem;
  background: #eff6ff;
  border-radius: 16px;
  border-left: 4px solid var(--primary);
  text-align: left;
}
.advice-title {
  font-weight: 700;
  margin-bottom: 0.25rem;
  font-size: 1rem;
  color: #1e3a8a;
}
.advice-text {
  font-size: 0.9rem;
  color: #1e40af;
  line-height: 1.5;
}

.config-panel {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}
.config-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}
.switch-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
}
.switch-sublabel {
  font-size: 0.8rem;
  color: var(--text-dim);
}

.switch {
  position: relative;
  width: 44px;
  height: 24px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e2e8f0;
  transition: 0.3s;
  border-radius: 24px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
input:checked + .slider {
  background-color: var(--primary);
}
input:checked + .slider:before {
  transform: translateX(20px);
}
</style>
