<template>
  <q-card class="leaderboard-card">
    <q-card-section>
      <div class="text-h6 text-grey-9 q-mb-md">
        Full Rankings
      </div>

      <q-table
        :rows="entries"
        :columns="columns"
        row-key="api_key_id"
        flat
        :pagination="{ rowsPerPage: 20 }"
        :rows-per-page-options="[10, 20, 50]"
      >
        <template #body-cell-rank="props">
          <q-td :props="props">
            <div
              class="rank-badge"
              :class="getRankClass(props.row.rank)"
            >
              {{ props.row.rank }}
            </div>
          </q-td>
        </template>

        <template #body-cell-display_name="props">
          <q-td :props="props" :class="{ 'self-highlight': props.row.is_self }">
            {{ props.row.display_name }}
            <q-badge v-if="props.row.is_self" color="primary" class="q-ml-sm">
              You
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-value="props">
          <q-td :props="props" class="text-weight-bold text-primary">
            {{ formatValue(props.row.value) }}
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface LeaderboardEntry {
  rank: number;
  display_name: string;
  api_key_id: string;
  value: number;
  is_self: boolean;
}

const props = defineProps<{
  entries: LeaderboardEntry[];
  category: string;
}>();

const columns = computed(() => [
  {
    name: 'rank',
    label: 'Rank',
    field: 'rank',
    align: 'left' as const,
    sortable: true,
    style: 'width: 60px',
  },
  {
    name: 'display_name',
    label: 'Developer',
    field: 'display_name',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'value',
    label: getValueLabel(),
    field: 'value',
    align: 'right' as const,
    sortable: true,
    style: 'width: 120px',
  },
]);

function getValueLabel(): string {
  switch (props.category) {
    case 'power_user':
      return 'Total Tokens';
    case 'cache_champion':
      return 'Cache Rate';
    case 'wordsmith':
      return 'Output Tokens';
    case 'tool_master':
      return 'Web Searches';
    default:
      return 'Value';
  }
}

function getRankClass(rank: number): string {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return 'bronze';
  return 'default';
}

function formatValue(value: number): string {
  if (props.category === 'cache_champion') {
    return `${value.toFixed(1)}%`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}
</script>
