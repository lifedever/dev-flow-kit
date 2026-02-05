<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import ToolPage from "../components/ToolPage.vue";

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
  totalQuota: 100,
  excludeWeekends: true,
  lastCycleId: "",
});

const saveTipVisible = ref(false);

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

  const endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;

  return {
    idealSpend,
    cycleProgress,
    remainingDays,
    dailySafe,
    diff,
    isOver,
    status,
    endDate,
  };
});

const adjustSpend = (amount: number) => {
  state.currentSpend = Math.max(
    0,
    Number((state.currentSpend + amount).toFixed(2)),
  );
};

const loadState = () => {
  const saved = localStorage.getItem("cursor_flow_v3");
  if (saved) Object.assign(state, JSON.parse(saved));
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
  }, 1200);
};

onMounted(() => loadState());
watch(state, () => saveState());
</script>

<template>
  <ToolPage title="Cursor Flow" maxWidth="560px">
    <template #actions>
      <div class="actions-group">
        <a
          href="https://cursor.com/cn/dashboard?tab=billing"
          target="_blank"
          class="billing-link"
          title="打开 Cursor 账单页"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
            ></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          Billing
        </a>
        <div class="velocity">
          <span>{{
            computedData.status === "fire"
              ? "🔥"
              : computedData.status === "ice"
                ? "❄️"
                : "⚡"
          }}</span>
        </div>
      </div>
    </template>

    <div class="panel">
      <div class="status-row">
        <span class="tag" :class="computedData.isOver ? 'danger' : 'success'">
          {{ computedData.isOver ? "当前超支" : "额度正常" }}
        </span>
        <span class="expire-tag"> {{ computedData.endDate }} 到期 </span>
      </div>

      <div class="stats">
        <div class="stat" :class="{ warning: computedData.status === 'fire' }">
          <span class="label">已用</span>
          <span class="value">{{ state.currentSpend.toFixed(1) }}%</span>
        </div>
        <div class="stat">
          <span class="label">理想</span>
          <span class="value">{{ computedData.idealSpend.toFixed(1) }}%</span>
        </div>
        <div class="stat">
          <span class="label">剩余天数</span>
          <span class="value">{{ computedData.remainingDays }}</span>
        </div>
      </div>

      <div class="progress-wrap">
        <div class="progress-bar">
          <div
            class="marker"
            :style="{ left: `${computedData.cycleProgress * 100}%` }"
          ></div>
          <div
            class="fill"
            :class="computedData.isOver ? 'danger' : 'success'"
            :style="{
              width: `${Math.min((state.currentSpend / state.totalQuota) * 100, 100)}%`,
            }"
          ></div>
        </div>
        <div class="progress-info">
          <span>{{ state.excludeWeekends ? "工作日" : "自然日" }}</span>
          <span
            >{{
              ((state.currentSpend / state.totalQuota) * 100).toFixed(1)
            }}%</span
          >
        </div>
      </div>

      <div class="input-section">
        <label>当前用量 (%)</label>
        <div class="input-row">
          <input type="number" v-model="state.currentSpend" step="0.1" />
          <div class="quick-btns">
            <button @click="adjustSpend(1)">+1</button>
            <button @click="adjustSpend(5)">+5</button>
            <button @click="adjustSpend(10)">+10</button>
            <button @click="adjustSpend(-1)">-1</button>
          </div>
        </div>
        <span class="tip" :class="{ show: saveTipVisible }">已保存</span>
      </div>

      <div class="advice" :class="computedData.isOver ? 'danger' : ''">
        <strong>{{
          computedData.isOver
            ? `超支 ${computedData.diff.toFixed(1)}%`
            : `结余 ${computedData.diff.toFixed(1)}%`
        }}</strong>
        <span>建议每日用量 {{ computedData.dailySafe.toFixed(2) }}%</span>
      </div>

      <div class="config">
        <div class="config-row">
          <div class="field">
            <label>重置日</label>
            <input type="number" v-model="state.resetDay" min="1" max="31" />
          </div>
          <div
            class="toggle-field"
            @click="state.excludeWeekends = !state.excludeWeekends"
          >
            <label>仅工作日</label>
            <div class="toggle" :class="{ on: state.excludeWeekends }">
              <div class="knob"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolPage>
</template>

<style scoped>
.status-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.expire-tag {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-dim);
  background: #f4f4f5;
  padding: 4px 10px;
  border-radius: 6px;
}

.actions-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.billing-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-dim);
  text-decoration: none;
  padding: 4px 8px;
  background: #f4f4f5;
  border-radius: 6px;
  transition: all 0.2s;
}

.billing-link:hover {
  background: #e4e4e7;
  color: var(--text);
}

.velocity {
  display: flex;
  align-items: center;
  font-size: 18px;
}

.panel {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 28px;
}

.tag {
  font-size: 13px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 6px;
}
.tag.success {
  background: #ecfdf5;
  color: #059669;
}
.tag.danger {
  background: #fef2f2;
  color: #dc2626;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat {
  background: #fafafa;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 12px;
  text-align: center;
}

.stat.warning {
  background: #fef2f2;
  border-color: #fecaca;
}

.stat .label {
  display: block;
  font-size: 12px;
  color: var(--text-dim);
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 6px;
}

.stat .value {
  font-size: 22px;
  font-weight: 800;
  color: var(--text);
}

.progress-wrap {
  margin-bottom: 24px;
}

.progress-bar {
  height: 6px;
  background: #f4f4f5;
  border-radius: 3px;
  position: relative;
  overflow: visible;
}

.fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s;
}
.fill.success {
  background: var(--success);
}
.fill.danger {
  background: var(--danger);
}

.marker {
  position: absolute;
  top: -2px;
  width: 2px;
  height: 10px;
  background: var(--text);
  border-radius: 1px;
  z-index: 1;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-dim);
  margin-top: 8px;
}

.input-section {
  margin-bottom: 24px;
}

.input-section label {
  display: block;
  font-size: 14px;
  color: var(--text-dim);
  font-weight: 500;
  margin-bottom: 8px;
}

.input-row {
  display: flex;
  gap: 8px;
}

.input-row input {
  flex: 1;
  min-width: 0;
}

.quick-btns {
  display: flex;
  gap: 4px;
}

.quick-btns button {
  padding: 6px 10px;
  font-size: 12px;
}

.tip {
  display: block;
  font-size: 11px;
  color: var(--success);
  margin-top: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}
.tip.show {
  opacity: 1;
}

.advice {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.advice.danger {
  background: #fef2f2;
  border-color: #fecaca;
}

.advice strong {
  display: block;
  font-size: 16px;
  margin-bottom: 4px;
}

.advice span {
  font-size: 14px;
  color: var(--text-dim);
}

.config {
  border-top: 1px solid var(--border);
  padding-top: 16px;
}

.config-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
}

.toggle-field {
  flex: 1;
  cursor: pointer;
}

.toggle-field label {
  display: block;
  font-size: 11px;
  color: var(--text-dim);
  margin-bottom: 8px;
}

.toggle {
  width: 36px;
  height: 20px;
  background: #e4e4e7;
  border-radius: 10px;
  position: relative;
  transition: background 0.2s;
}

.toggle.on {
  background: var(--primary);
}

.knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 8px;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle.on .knob {
  transform: translateX(16px);
}
</style>
