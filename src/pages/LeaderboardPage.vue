<template>
  <q-page padding>
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12">
        <div class="row items-center justify-between">
          <div class="text-h4 text-grey-9">
            Leaderboard
          </div>

          <div class="row q-gutter-sm items-center">
            <q-btn-toggle
              v-model="period"
              toggle-color="primary"
              color="grey-4"
              text-color="grey-8"
              :options="periodOptions"
              unelevated
              @update:model-value="fetchLeaderboard"
            />

            <q-select
              v-model="selectedModel"
              :options="modelOptions"
              label="Model"
              outlined
              dense
              emit-value
              map-options
              style="min-width: 200px"
              @update:model-value="fetchLeaderboard"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="initialLoading" class="row justify-center q-my-xl">
      <q-spinner-dots color="primary" size="50px" />
    </div>

    <template v-else-if="leaderboard">
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-6 col-lg-3">
          <category-card
            title="Power User"
            :entries="leaderboard?.categories?.power_user || []"
          />
        </div>

        <div class="col-12 col-md-6 col-lg-3">
          <category-card
            title="Cache Champion"
            :entries="leaderboard?.categories?.cache_champion || []"
            suffix="%"
          />
        </div>

        <div class="col-12 col-md-6 col-lg-3">
          <category-card
            title="Wordsmith"
            :entries="leaderboard?.categories?.wordsmith || []"
          />
        </div>

        <div class="col-12 col-md-6 col-lg-3">
          <category-card
            title="Tool Master"
            :entries="leaderboard?.categories?.tool_master || []"
          />
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-tabs
            v-model="selectedCategory"
            class="text-grey-8"
            active-color="primary"
            indicator-color="primary"
            align="center"
          >
            <q-tab name="power_user" label="Power User" />
            <q-tab name="cache_champion" label="Cache Champion" />
            <q-tab name="wordsmith" label="Wordsmith" />
            <q-tab name="tool_master" label="Tool Master" />
          </q-tabs>

          <leaderboard-table
            :entries="leaderboard?.categories?.[selectedCategory] || []"
            :category="selectedCategory"
          />
        </div>
      </div>

      <div v-if="leaderboard?.updated_at" class="text-grey-6 text-caption q-mt-md text-right">
        Last updated: {{ formatDate(leaderboard.updated_at) }}
      </div>
    </template>

    <div v-else class="text-center text-grey-6 q-my-xl">
      <div>No leaderboard data available yet</div>
      <q-btn
        v-if="!userStore.isLoggedIn"
        color="primary"
        label="Register to get started"
        to="/register"
        class="q-mt-md"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useUserStore } from 'stores/user';
import CategoryCard from 'components/CategoryCard.vue';
import LeaderboardTable from 'components/LeaderboardTable.vue';

interface LeaderboardEntry {
  rank: number;
  display_name: string;
  api_key_id: string;
  value: number;
  is_self: boolean;
}

interface LeaderboardData {
  period: string;
  categories: Record<string, LeaderboardEntry[]>;
  updated_at: string;
}

const $q = useQuasar();
const userStore = useUserStore();

const period = ref('week');
const selectedCategory = ref('power_user');
const selectedModel = ref<string | null>(null);
const initialLoading = ref(true);
const leaderboard = ref<LeaderboardData | null>(null);
const availableModels = ref<string[]>([
  'claude-opus-4-20250514',
  'claude-sonnet-4-20250514',
  'claude-3-5-haiku-20241022',
]);

const periodOptions = [
  { label: 'Today', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
];

const modelOptions = computed(() => {
  const options = [{ label: 'All Models', value: null }];
  availableModels.value.forEach((model) => {
    // Create friendly label from model name
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

async function fetchLeaderboard() {
  try {
    const params: Record<string, string | null> = { period: period.value };
    if (userStore.apiKeyId) {
      params.api_key_id = userStore.apiKeyId;
    }
    if (selectedModel.value) {
      params.model = selectedModel.value;
    }

    const response = await api.get('/api/leaderboard', { params });
    leaderboard.value = response.data;
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load leaderboard',
      position: 'top',
    });
  } finally {
    initialLoading.value = false;
  }
}

function formatDate(dateString: string): string {
  // Ensure UTC interpretation if no timezone specified
  const date = dateString.endsWith('Z') || dateString.includes('+')
    ? new Date(dateString)
    : new Date(dateString + 'Z');
  return date.toLocaleString();
}

watch(() => userStore.apiKeyId, (newId, oldId) => {
  if (newId !== oldId) {
    fetchLeaderboard();
  }
});

onMounted(() => {
  fetchModels();
  fetchLeaderboard();
});
</script>
