import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/leaderboard',
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('pages/RegisterPage.vue'),
      },
      {
        path: 'leaderboard',
        name: 'leaderboard',
        component: () => import('pages/LeaderboardPage.vue'),
      },
      {
        path: 'stats',
        name: 'stats',
        component: () => import('pages/StatsPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
