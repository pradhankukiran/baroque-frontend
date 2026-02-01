<template>
  <q-page class="flex flex-center">
    <q-card class="leaderboard-card q-pa-lg" style="width: 400px; max-width: 90vw">
      <q-card-section class="text-center">
        <div class="text-h5 text-grey-9">Join the Leaderboard</div>
        <div class="text-body2 text-grey-6 q-mt-sm">
          Enter your Anthropic API key ID and display name
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="apiKeyId"
            outlined
            label="API Key ID"
            hint="e.g., apikey_01Rj..."
            :rules="[val => !!val || 'API Key ID is required']"
          />

          <q-input
            v-model="name"
            outlined
            label="Display Name"
            hint="How you want to appear on the leaderboard"
            :rules="[
              val => !!val || 'Name is required',
              val => val.length <= 100 || 'Name must be 100 characters or less'
            ]"
          />

          <q-btn
            type="submit"
            color="primary"
            class="full-width q-mt-md"
            label="Register"
            :loading="loading"
          />
        </q-form>
      </q-card-section>

      <q-card-section v-if="userStore.isLoggedIn" class="text-center">
        <q-separator class="q-my-md" />
        <div class="text-grey-6 text-body2">
          Already registered as <strong class="text-grey-9">{{ userStore.name }}</strong>
        </div>
        <q-btn
          flat
          color="primary"
          label="Go to Leaderboard"
          to="/leaderboard"
          class="q-mt-sm"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useUserStore } from 'stores/user';

const $q = useQuasar();
const router = useRouter();
const userStore = useUserStore();

const apiKeyId = ref(userStore.apiKeyId);
const name = ref(userStore.name);
const loading = ref(false);

async function handleSubmit() {
  loading.value = true;

  try {
    const response = await api.post('/api/register', {
      api_key_id: apiKeyId.value,
      name: name.value,
    });

    if (response.data.success) {
      userStore.login(apiKeyId.value, name.value);
      $q.notify({
        type: 'positive',
        message: 'Registration successful!',
        position: 'top',
      });
      router.push('/leaderboard');
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.error || 'Registration failed',
        position: 'top',
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to connect to server';
    $q.notify({
      type: 'negative',
      message,
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
}
</script>
