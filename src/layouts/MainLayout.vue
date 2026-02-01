<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-white">
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold text-grey-9">
          Baroque
        </q-toolbar-title>

        <q-tabs
          v-model="currentTab"
          shrink
          class="q-mr-md text-grey-8"
          active-color="primary"
          indicator-color="primary"
        >
          <q-route-tab name="leaderboard" to="/leaderboard" label="Leaderboard" />
          <q-route-tab
            v-if="userStore.isLoggedIn"
            name="stats"
            to="/stats"
            label="My Stats"
          />
        </q-tabs>

        <q-space />

        <template v-if="userStore.isLoggedIn">
          <q-chip color="primary" text-color="white" square>
            {{ userStore.name }}
          </q-chip>
          <q-btn flat label="Logout" color="grey-7" @click="handleLogout" />
        </template>
        <template v-else>
          <q-btn flat label="Register" color="primary" to="/register" />
        </template>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from 'stores/user';

const router = useRouter();
const userStore = useUserStore();
const currentTab = ref('leaderboard');

function handleLogout() {
  userStore.logout();
  router.push('/leaderboard');
}
</script>
