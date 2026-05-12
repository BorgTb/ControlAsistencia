import { apiClient, setTokenExpiration } from '@/config/axios-config.js'
import { useAuthStore } from '@/stores/auth-store.js'

class AuthService {
  /**
   * Realiza el login del usuario
   * @param {Object} credentials - Credenciales del usuario
   * @param {string} credentials.email - Email del usuario
   * @param {string} credentials.password - Contraseña del usuario
   * @returns {Promise<Object>} Respuesta del servidor con el token y datos del usuario
   */
  async login(credentials) {
    const authStore = useAuthStore()

    try {
      authStore.setLoading(true)
      const response = await apiClient.post('/auth/login', credentials)

      // MULTI-EMPRESA: Verificar si requiere selección de empresa
      if (response.data.requiresCompanySelection) {
        console.log('👥 Usuario multi-empresa, no establecer usuario aún')
        return {
          success: true,
          data: response.data,
          message: response.data.message || 'Selecciona una empresa para continuar'
        }
      }

      // Usuario con empresa única - flujo normal
      const { user, expiresAt } = response.data // Ya NO recibimos token en la respuesta

      // Establecer tiempo de expiración del token para renovación proactiva
      if (expiresAt) {
        setTokenExpiration(expiresAt)
      }

      // Solo almacenar datos del usuario (el token está en cookie HTTP-only)
      authStore.setUser(user)

      // Cargar empresas disponibles para resolver la empresa activa de inmediato
      await authStore.loadUserCompanies()

      return {
        success: true,
        data: response.data,
        message: 'Login exitoso'
      }
    } catch (error) {
      console.error('Error en login:', error)

      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar sesión',
        status: error.response?.status
      }
    } finally {
      authStore.setLoading(false)
    }
  }

  /**
   * Realiza el logout del usuario
   * @returns {Promise<Object>} Respuesta del logout
   */
  /**
   * Cierra la sesión del usuario
   * @returns {Promise<Object>} Respuesta del logout
   */
  async logout() {
    const authStore = useAuthStore()

    try {
      authStore.setLoading(true)

      // Obtener datos del usuario antes de limpiar
      const userData = authStore.getUser
      console.log('🔍 Datos del usuario para logout:', userData)

      // Cerrar sesión en auditoría antes del logout
      if (userData && userData.id) {
        try {
          console.log('📤 Enviando petición de cierre de sesión para usuario ID:', userData.id)
          const response = await apiClient.post('/auditoria/logout', {
            usuario_id: userData.id
          })
          console.log('✅ Respuesta del cierre de sesión:', response.data)
        } catch (auditoriaError) {
          console.error('⚠️ Error al cerrar sesión en auditoría:', auditoriaError)
          // No fallar el logout por esto
        }
      }

      // Llamar al endpoint de logout para limpiar la cookie
      try {
        await apiClient.post('/auth/logout')
        console.log('✅ Cookie de autenticación limpiada')
      } catch (authError) {
        console.warn('⚠️ Error en logout del auth:', authError)
        // Continuar con el logout local
      }

      // Limpiar el store local
      authStore.clearAuth()

      return {
        success: true,
        message: 'Logout exitoso'
      }
    } catch (error) {
      console.error('Error en logout:', error)

      // Aún así, limpiar el store local
      authStore.clearAuth()

      return {
        success: true,
        message: 'Sesión cerrada localmente'
      }
    } finally {
      authStore.setLoading(false)
    }
  }

  /**
   * Verifica el token actual
   * @returns {Promise<Object>} Respuesta de verificación
   */
  async verifyToken() {
    const authStore = useAuthStore()

    try {
      const response = await apiClient.get('/auth/verify')

      // Actualizar datos del usuario si es necesario
      if (response.data.user) {
        authStore.setUser(response.data.user)
      }

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error verificando token:', error)

      // Si el token no es válido, limpiar la autenticación
      authStore.clearAuth()

      return {
        success: false,
        error: 'Token inválido'
      }
    }
  }

  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario a registrar
   * @returns {Promise<Object>} Respuesta del registro
   */
  async register(userData) {
    const authStore = useAuthStore()

    try {
      authStore.setLoading(true)

      const response = await apiClient.post('/auth/register', userData)

      const { token, user } = response.data

      // Si el backend retorna token inmediatamente después del registro
      if (token) {
        authStore.setToken(token)
        authStore.setUser(user)
      }

      return {
        success: true,
        data: response.data,
        message: 'Registro exitoso'
      }
    } catch (error) {
      console.error('Error en registro:', error)

      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar usuario',
        status: error.response?.status
      }
    } finally {
      authStore.setLoading(false)
    }
  }

  /**
   * Solicita recuperación de contraseña
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} Respuesta de la solicitud
   */
  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email })

      return {
        success: true,
        data: response.data,
        message: 'Se ha enviado un enlace de recuperación a tu email'
      }
    } catch (error) {
      console.error('Error en forgot password:', error)

      return {
        success: false,
        error: error.response?.data?.message || 'Error al solicitar recuperación de contraseña'
      }
    }
  }

  /**
   * Restablece la contraseña
   * @param {Object} resetData - Datos para restablecer contraseña
   * @param {string} resetData.token - Token de recuperación
   * @param {string} resetData.password - Nueva contraseña
   * @returns {Promise<Object>} Respuesta del restablecimiento
   */
  async resetPassword(resetData) {
    try {
      const response = await apiClient.post('/auth/reset-password', resetData)

      return {
        success: true,
        data: response.data,
        message: 'Contraseña restablecida exitosamente'
      }
    } catch (error) {
      console.error('Error en reset password:', error)

      return {
        success: false,
        error: error.response?.data?.message || 'Error al restablecer contraseña'
      }
    }
  }

  /**
   * Cambia el email del usuario
   * @param {Object} emailData - Datos para cambiar email
   * @param {string} emailData.newEmail - Nuevo email
   * @param {string} emailData.password - Contraseña actual para confirmar
   * @returns {Promise<Object>} Respuesta del cambio de email
   */
  async changeEmail(emailData) {
    const authStore = useAuthStore()

    try {
      const response = await apiClient.put('/user/email', emailData)

      // Actualizar el usuario en el store con el nuevo email
      if (response.data.user) {
        console.log('Usuario actualizado:', response.data.user)
        authStore.setUser(response.data.user)
      }
      return {
        success: true,
        data: response.data,
        message: 'Email actualizado correctamente'
      }
    } catch (error) {
      console.error('Error cambiando email:', error)

      let errorMessage = 'Error al actualizar el email'
      let errorField = null

      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Datos inválidos'
        errorField = 'password' // Assuming password is wrong in most 400 cases
      } else if (error.response?.status === 409) {
        errorMessage = 'Este email ya está en uso'
        errorField = 'newEmail'
      } else {
        errorMessage = error.response?.data?.message || errorMessage
      }

      return {
        success: false,
        error: errorMessage,
        errorField,
        status: error.response?.status
      }
    }
  }

  /**
   * Cambia la contraseña del usuario
   * @param {Object} passwordData - Datos para cambiar contraseña
   * @param {string} passwordData.currentPassword - Contraseña actual
   * @param {string} passwordData.newPassword - Nueva contraseña
   * @returns {Promise<Object>} Respuesta del cambio de contraseña
   */
  async changePassword(passwordData) {
    try {
      const response = await apiClient.put('/user/password', passwordData)

      return {
        success: true,
        data: response.data,
        message: 'Contraseña actualizada correctamente'
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error)

      let errorMessage = 'Error al actualizar la contraseña'
      let errorField = null

      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Contraseña actual incorrecta'
        errorField = 'currentPassword'
      } else {
        errorMessage = error.response?.data?.message || errorMessage
      }

      return {
        success: false,
        error: errorMessage,
        errorField,
        status: error.response?.status
      }
    }
  }

  /**
   * Selecciona una empresa para usuarios multi-empresa
   * @param {Object} selectionData - Datos de selección
   * @param {number} selectionData.userId - ID del usuario
   * @param {number} selectionData.empresaId - ID de la empresa seleccionada
   * @returns {Promise<Object>} Respuesta de la selección
   */
  async selectCompany(selectionData) {
    const authStore = useAuthStore()

    try {
      authStore.setLoading(true)

      const response = await apiClient.post('/auth/select-company', selectionData)

      const { user, expiresAt } = response.data

      // Establecer tiempo de expiración del token
      if (expiresAt) {
        setTokenExpiration(expiresAt)
      }

      // Almacenar datos del usuario
      authStore.setUser(user)

      // Refrescar empresas para que el store tenga la empresa activa y su relación
      await authStore.loadUserCompanies()

      // Limpiar datos de selección pendiente
      authStore.clearCompanySelection()

      return {
        success: true,
        data: response.data,
        message: 'Empresa seleccionada exitosamente'
      }
    } catch (error) {
      console.error('Error en selección de empresa:', error)

      return {
        success: false,
        error: error.response?.data?.message || 'Error al seleccionar empresa',
        status: error.response?.status
      }
    } finally {
      authStore.setLoading(false)
    }
  }

  /**
   * Obtener empresas del usuario autenticado
   * Para permitir cambio de empresa post-login
   * @returns {Promise<Object>} Respuesta con lista de empresas
   */
  async getUserCompanies() {
    try {
      const response = await apiClient.get('/user/companies')

      return {
        success: true,
        data: response.data,
        message: 'Empresas obtenidas exitosamente'
      }
    } catch (error) {
      console.error('Error al obtener empresas del usuario:', error)

      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener empresas',
        status: error.response?.status
      }
    }
  }

  /**
   * Cambiar de empresa (post-login)
   * Reutiliza la lógica de selectCompany pero para cambio post-login
   * @param {number} empresaId - ID de la empresa a cambiar
   * @returns {Promise<Object>} Respuesta del cambio
   */
  async switchCompany(empresaId) {
    const authStore = useAuthStore()
    const userId = authStore.user?.id

    if (!userId) {
      return {
        success: false,
        error: 'Usuario no autenticado'
      }
    }

    return this.selectCompany({
      userId,
      empresaId
    })
  }

  /**
   * Validaciones del lado cliente
   */

  /**
   * Valida formato de email
   * @param {string} email - Email a validar
   * @returns {boolean} True si es válido
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Valida fortaleza de contraseña
   * @param {string} password - Contraseña a validar
   * @returns {Object} Objeto con validación y detalles
   */
  validatePassword(password) {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)

    const isValid = minLength && hasUpperCase && hasLowerCase && hasNumbers

    return {
      isValid,
      details: {
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers
      },
      message: isValid
        ? 'Contraseña válida'
        : 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números'
    }
  }
}

// Exportar una instancia del servicio
export default new AuthService()