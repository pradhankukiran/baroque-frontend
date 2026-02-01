<template>
  <div style="height: 300px">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'vue-chartjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DailyStats {
  date: string;
  total_tokens: number;
  cache_rate: number;
  output_tokens: number;
  web_search_requests: number;
}

const props = defineProps<{
  data: DailyStats[];
  metric: 'total_tokens' | 'cache_rate' | 'output_tokens' | 'web_search_requests';
}>();

const metricConfig: Record<string, { label: string; color: string; suffix: string }> = {
  total_tokens: { label: 'Total Tokens', color: '#3EB4E4', suffix: '' },
  cache_rate: { label: 'Cache Rate', color: '#22C55E', suffix: '%' },
  output_tokens: { label: 'Output Tokens', color: '#0EA5E9', suffix: '' },
  web_search_requests: { label: 'Web Searches', color: '#8B5CF6', suffix: '' },
};

const chartData = computed(() => {
  const sorted = [...props.data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const config = metricConfig[props.metric];

  return {
    labels: sorted.map((d) =>
      new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: config.label,
        data: sorted.map((d) => d[props.metric as keyof DailyStats] as number),
        borderColor: config.color,
        backgroundColor: `${config.color}33`,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: { parsed: { y: number } }) => {
          const config = metricConfig[props.metric];
          let value = context.parsed.y;
          if (config.suffix === '%') {
            return `${config.label}: ${value.toFixed(1)}%`;
          }
          if (value >= 1000000) {
            return `${config.label}: ${(value / 1000000).toFixed(1)}M`;
          }
          if (value >= 1000) {
            return `${config.label}: ${(value / 1000).toFixed(1)}K`;
          }
          return `${config.label}: ${value}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: '#E5E7EB',
      },
      ticks: {
        color: '#6B7280',
      },
    },
    y: {
      grid: {
        color: '#E5E7EB',
      },
      ticks: {
        color: '#6B7280',
        callback: (value: number | string) => {
          const numValue = Number(value);
          if (metricConfig[props.metric].suffix === '%') {
            return `${numValue}%`;
          }
          if (numValue >= 1000000) {
            return `${(numValue / 1000000).toFixed(1)}M`;
          }
          if (numValue >= 1000) {
            return `${(numValue / 1000).toFixed(0)}K`;
          }
          return numValue;
        },
      },
    },
  },
}));
</script>
