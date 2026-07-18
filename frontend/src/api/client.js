import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import router from '../router'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

api.interceptors.request.use((config) => {
  const { token } = useAuthStore()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Токен живёт 7 дней (модуль 6) и может протухнуть прямо во время работы.
// Без этого перехватчика пользователь остался бы на экране с ошибкой «Unauthorized»
// и без возможности войти заново — кнопка «Выйти» ведь тоже пропадает вместе с профилем.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { logout } = useAuthStore()
      logout()
      if (router.currentRoute.value.path !== '/login') router.push('/login')
    }
    return Promise.reject(error)
  },
)

export default api
