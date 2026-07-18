import { createRouter, createWebHistory } from 'vue-router';
import HabitListView from '../views/HabitListView.vue';
import HabitDetailView from '../views/HabitDetailView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import { useAuthStore } from '../stores/auth';

const routes = [
  { path: '/', component: HabitListView, meta: { requiresAuth: true } },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/habits/:id', component: HabitDetailView, props: true, meta: { requiresAuth: true } },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  // деструктуризация здесь безопасна: useAuthStore() вызывается заново при каждой навигации
  const { token } = useAuthStore();
  if (to.meta.requiresAuth && !token) {
    return '/login';
  }
});

export default router;
