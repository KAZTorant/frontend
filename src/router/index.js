import { createWebHistory, createRouter } from "vue-router";
import store from '../store';

const routes = [
  {
    path: "/",
    component: () => import('../components/LoginView.vue'),
  },
  {
    path: "/home/:id",
    component: () => import('../components/MainRestorantView/MainView.vue'),
    meta: { requiresAuth: true } // Add meta field to specify authentication requirement
  },
  {
    path: "/home/main-order-view/:id",
    component: () => import('../components/MainOrderView/MainOrderView.vue'),
    meta: { requiresAuth: true } // Add meta field to specify authentication requirement
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: routes,
  linkActiveClass: 'active'
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) { // Check if the route requires authentication
    // Check if user is authenticated using Vuex getter
    if (!store.getters['auth/IS_USER_AUTHENTICATED']) {
      // If user is not authenticated, redirect to login page
      next('/');
    } else {
      // If user is authenticated, proceed to the requested route
      next();
    }
  } else {
    // If the route doesn't require authentication, proceed as usual
    next();
  }
});

export default router;
