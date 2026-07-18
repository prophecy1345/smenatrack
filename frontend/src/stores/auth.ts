import { defineStore } from 'pinia'
import { ref } from 'vue'

// профиль, который отдаёт GET /auth/me (модуль 6)
interface AuthUser {
  id: string
  email: string
  shiftPattern: string
  shiftStartDate: string
  timeZone: string
  role: string
}

const storedUser = localStorage.getItem('user')

export const useAuthStore = defineStore('auth', () => {
  // и токен, и профиль восстанавливаются из localStorage: иначе после F5
  // пользователь остаётся авторизованным, но шапка не знает, кто он
  const user = ref<AuthUser | null>(storedUser ? JSON.parse(storedUser) : null)
  const token = ref(localStorage.getItem('token'))

  function setAuth(newUser: AuthUser, newToken: string) {
    user.value = newUser
    token.value = newToken
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }
  // профиль меняется без перелогина (правка графика), токен при этом тот же
  function setUser(newUser: AuthUser) {
    user.value = newUser
    localStorage.setItem('user', JSON.stringify(newUser))
  }
  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
  return { user, token, setAuth, setUser, logout }
})
