<template>
  <q-card class="leaderboard-card">
    <q-card-section>
      <div class="text-h6 text-grey-9 q-mb-md text-center">{{ title }}</div>

      <q-list separator>
        <q-item
          v-for="entry in entries.slice(0, 5)"
          :key="entry.api_key_id"
          :class="{ 'self-highlight': entry.is_self }"
        >
          <q-item-section avatar>
            <div
              class="rank-badge"
              :class="getRankClass(entry.rank)"
            >
              {{ entry.rank }}
            </div>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-grey-9">
              {{ entry.display_name }}
              <q-badge v-if="entry.is_self" color="primary" class="q-ml-sm">
                You
              </q-badge>
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-item-label class="text-weight-bold text-primary">
              {{ formatValue(entry.value) }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="entries.length === 0">
          <q-item-section class="text-grey-6 text-center">
            No data yet
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
interface LeaderboardEntry {
  rank: number;
  display_name: string;
  api_key_id: string;
  value: number;
  is_self: boolean;
}

const props = defineProps<{
  title: string;
  entries: LeaderboardEntry[];
  suffix?: string;
}>();

function getRankClass(rank: number): string {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return 'bronze';
  return 'default';
}

function formatValue(value: number): string {
  if (props.suffix === '%') {
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
