import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface User {
  apiKeyId: string;
  name: string;
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);

  const isLoggedIn = computed(() => user.value !== null);
  const apiKeyId = computed(() => user.value?.apiKeyId || '');
  const name = computed(() => user.value?.name || '');

  function loadFromStorage() {
    const stored = localStorage.getItem('baroque_user');
    if (stored) {
      try {
        user.value = JSON.parse(stored);
      } catch {
        user.value = null;
      }
    }
  }

  function login(apiKeyId: string, name: string) {
    user.value = { apiKeyId, name };
    localStorage.setItem('baroque_user', JSON.stringify(user.value));
  }

  function logout() {
    user.value = null;
    localStorage.removeItem('baroque_user');
  }

  function updateName(newName: string) {
    if (user.value) {
      user.value.name = newName;
      localStorage.setItem('baroque_user', JSON.stringify(user.value));
    }
  }

  // Load from storage on initialization
  loadFromStorage();

  return {
    user,
    isLoggedIn,
    apiKeyId,
    name,
    login,
    logout,
    updateName,
    loadFromStorage,
  };
});
