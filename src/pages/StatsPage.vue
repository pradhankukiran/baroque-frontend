<template>
  <q-page padding>
    <div v-if="!userStore.isLoggedIn" class="text-center q-my-xl">
      <div class="text-h6 text-grey-5">Please register to view your stats</div>
      <q-btn color="primary" label="Register" to="/register" class="q-mt-md" />
    </div>

    <template v-else>
      <div class="row items-center justify-between q-mb-lg">
        <div class="text-h4 text-grey-9">
          {{ userStore.name }}'s Stats
        </div>

        <q-select
          v-model="selectedModel"
          :options="modelOptions"
          label="Model"
          outlined
          dense
          emit-value
          map-options
          style="min-width: 200px"
          @update:model-value="fetchStats"
        />
      </div>

      <div v-if="initialLoading" class="row justify-center q-my-xl">
        <q-spinner-dots color="primary" size="50px" />
      </div>

      <template v-else-if="stats">
        <!-- Rankings -->
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12">
            <q-card class="leaderboard-card">
              <q-card-section>
                <div class="text-h6 text-grey-9 q-mb-md">
                  Your Rankings (This Week)
                </div>
                <div class="row q-col-gutter-md">
                  <div
                    v-for="(rank, category) in stats.rankings"
                    :key="category"
                    class="col-6 col-md-3"
                  >
                    <div class="text-center">
                      <div
                        class="rank-badge q-mx-auto q-mb-sm"
                        :class="getRankClass(rank)"
                        style="font-size: 1.5rem; width: 48px; height: 48px"
                      >
                        {{ rank || '-' }}
                      </div>
                      <div class="text-grey-6">{{ getCategoryLabel(category) }}</div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Period Stats -->
        <div class="row q-col-gutter-md q-mb-lg">
          <div
            v-for="(periodStats, periodName) in stats.current_period"
            :key="periodName"
            class="col-12 col-md-4"
          >
            <q-card class="leaderboard-card">
              <q-card-section>
                <div class="text-subtitle1 text-grey-6 text-uppercase q-mb-md">
                  {{ getPeriodLabel(periodName) }}
                </div>
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <div class="stat-value">{{ formatNumber(periodStats.total_tokens) }}</div>
                    <div class="stat-label">Total Tokens</div>
                  </div>
                  <div class="col-6">
                    <div class="stat-value" style="color: #22C55E">{{ periodStats.cache_rate.toFixed(1) }}%</div>
                    <div class="stat-label">Cache Rate</div>
                  </div>
                  <div class="col-6 q-mt-sm">
                    <div class="stat-value" style="color: #0EA5E9">{{ formatNumber(periodStats.output_tokens) }}</div>
                    <div class="stat-label">Output Tokens</div>
                  </div>
                  <div class="col-6 q-mt-sm">
                    <div class="stat-value" style="color: #8B5CF6">{{ periodStats.web_search_requests }}</div>
                    <div class="stat-label">Web Searches</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Trend Chart -->
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-card class="leaderboard-card">
              <q-card-section>
                <div class="row items-center justify-between q-mb-md">
                  <div class="text-h6 text-grey-9">
                    30-Day Trend
                  </div>
                  <q-btn-toggle
                    v-model="selectedMetric"
                    toggle-color="primary"
                    color="grey-4"
                    text-color="grey-8"
                    :options="metricOptions"
                    unelevated
                    size="sm"
                  />
                </div>
                <trend-chart
                  v-if="stats.daily_history.length > 0"
                  :data="stats.daily_history"
                  :metric="selectedMetric"
                />
                <div v-else class="text-center text-grey-6 q-py-xl">
                  No historical data available yet
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </template>

      <div v-else class="text-center text-grey-6 q-my-xl">
        <div>No stats available yet</div>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useUserStore } from 'stores/user';
import TrendChart from 'components/TrendChart.vue';

interface PeriodStats {
  total_tokens: number;
  uncached_input_tokens: number;
  cache_read_input_tokens: number;
  output_tokens: number;
  cache_rate: number;
  web_search_requests: number;
}

interface DailyStats {
  date: string;
  total_tokens: number;
  cache_rate: number;
  output_tokens: number;
  web_search_requests: number;
}

interface DeveloperStats {
  api_key_id: string;
  name: string;
  current_period: Record<string, PeriodStats>;
  daily_history: DailyStats[];
  rankings: Record<string, number>;
}

const $q = useQuasar();
const userStore = useUserStore();

const initialLoading = ref(true);
const stats = ref<DeveloperStats | null>(null);
const selectedMetric = ref<'total_tokens' | 'cache_rate' | 'output_tokens' | 'web_search_requests'>('total_tokens');
const selectedModel = ref<string | null>(null);
const availableModels = ref<string[]>([
  'claude-opus-4-20250514',
  'claude-sonnet-4-20250514',
  'claude-3-5-haiku-20241022',
]);

const metricOptions = [
  { label: 'Tokens', value: 'total_tokens' },
  { label: 'Cache', value: 'cache_rate' },
  { label: 'Output', value: 'output_tokens' },
  { label: 'Search', value: 'web_search_requests' },
];

const modelOptions = computed(() => {
  const options = [{ label: 'All Models', value: null }];
  availableModels.value.forEach((model) => {
    let label = model;
    if (model.includes('opus')) label = 'Opus';
    else if (model.includes('sonnet')) label = 'Sonnet';
    else if (model.includes('haiku')) label = 'Haiku';
    options.push({ label: `${label} (${model})`, value: model });
  });
  return options;
});

async function fetchModels() {
  try {
    const response = await api.get('/api/models');
    if (response.data.models?.length) {
      availableModels.value = response.data.models;
    }
  } catch (error) {
    console.error('Failed to fetch models:', error);
  }
}

async function fetchStats() {
  if (!userStore.apiKeyId) return;

  try {
    const params: Record<string, string | null> = {};
    if (selectedModel.value) {
      params.model = selectedModel.value;
    }

    const response = await api.get(`/api/developer/${userStore.apiKeyId}/stats`, { params });
    stats.value = response.data;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load stats',
      position: 'top',
    });
  } finally {
    initialLoading.value = false;
  }
}

function getRankClass(rank: number): string {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return 'bronze';
  return 'default';
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    power_user: 'Power User',
    cache_champion: 'Cache Champion',
    wordsmith: 'Wordsmith',
    tool_master: 'Tool Master',
  };
  return labels[category] || category;
}

function getPeriodLabel(period: string): string {
  const labels: Record<string, string> = {
    day: 'Today',
    week: 'This Week',
    month: 'This Month',
  };
  return labels[period] || period;
}

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

watch(() => userStore.isLoggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    fetchStats();
  }
});

onMounted(() => {
  fetchModels();
  if (userStore.isLoggedIn) {
    fetchStats();
  } else {
    initialLoading.value = false;
  }
});
</script>
