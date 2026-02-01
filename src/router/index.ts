import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';
import { useUserStore } from 'stores/user';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'register' });
  } else {
    next();
  }
});

export default router;
