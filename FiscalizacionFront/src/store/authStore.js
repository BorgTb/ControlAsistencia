import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    // State
    const token = ref(null)
    const user = ref(null)
    const isLoading = ref(false)

    // Getters
    const isAuthenticated = computed(() => !!token.value)
    const getToken = computed(() => token.value)
    const getUser = computed(() => user.value)

    // Actions
    function setToken(newToken) {
        token.value = newToken
    }

    function setUser(userData) {
        user.value = userData
    }

    function setLoading(loading) {
        isLoading.value = loading
    }

    function logout() {
        token.value = null
        user.value = null
    }

    function clearAuth() {
        logout()
    }

    return {
        // State
        token,
        user,
        isLoading,
        // Getters
        isAuthenticated,
        getToken,
        getUser,
        // Actions
        setToken,
        setUser,
        setLoading,
        logout,
        clearAuth
    }
}, {
    persist: {
        key: 'auth-storage',
        storage: localStorage,
        paths: ['token', 'user']
    }
})