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
}

.header-nav {
  width: 100%;
  max-width: 560px;
  text-align: left;
  margin-bottom: 20px;
}

.card-container {
  width: 100%;
  max-width: 560px;
  background: var(--card-bg);
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text);
  position: relative;
}

header {
  text-align: center;
  margin-bottom: 24px;
  position: relative;
}

h1 {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #fff;
}

.subtitle {
  font-size: 14px;
  color: var(--text-dim);
}

.velocity-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.emoji {
  font-size: 18px;
}
.velocity-label {
  font-size: 9px;
  color: var(--text-dim);
  margin-top: 2px;
  text-transform: uppercase;
}

.status-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 20px;
}
.status-on-track {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success);
}
.status-over {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: 0.3s;
}

.card-fire {
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.3);
}

.stat-label {
  font-size: 11px;
  color: var(--text-dim);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
}

.progress-box {
  margin-bottom: 32px;
}
.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 10px;
  color: var(--text-dim);
}
.progress-bar {
  height: 14px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 7px;
  overflow: hidden;
  position: relative;
}
.progress-fill {
  height: 100%;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ideal-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #fff;
  z-index: 10;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.input-group {
  margin-bottom: 24px;
}
label {
  display: block;
  font-size: 13px;
  margin-bottom: 10px;
  color: var(--text-dim);
  text-align: left;
}
input {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
}

.quick-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.btn-quick {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px;
  border-radius: 10px;
  font-size: 12px;
  color: var(--text);
}
.btn-quick:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--primary);
}

.save-tip {
  font-size: 11px;
  color: var(--success);
  margin-top: 6px;
  transition: 0.3s;
  text-align: right;
  height: 16px;
}

.advice-box {
  padding: 20px;
  background: rgba(59, 130, 246, 0.15);
  border-radius: 20px;
  border-left: 4px solid var(--primary);
  text-align: left;
}
.advice-title {
  font-weight: 700;
  margin-bottom: 4px;
  font-size: 15px;
  color: #fff;
}
.advice-text {
  font-size: 14px;
  color: #cbd5e1;
  line-height: 1.6;
}

.config-panel {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.config-row {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
}
.switch-label {
  font-size: 14px;
  color: var(--text);
}
.switch-sublabel {
  font-size: 12px;
  color: var(--text-dim);
  display: block;
}

.switch {
  position: relative;
  display: inline-block;
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
  pointer-events: none;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.1);
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
}
input:checked + .slider {
  background-color: var(--primary);
}
input:checked + .slider:before {
  transform: translateX(20px);
}
</style>
