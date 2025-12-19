
// NOTA:
// Se eliminaron los métodos createEmpresa y actualizarEmpresa que estaban duplicados y fuera de la clase AdminServices.
// Esto es necesario porque los métodos deben estar dentro de la clase para que el servicio funcione correctamente y evitar errores de sintaxis.
// Además, así se mantiene la organización y encapsulamiento del código.
// Esto permite que el CRUD de empresas funcione correctamente, mostrando los datos en la web y permitiendo crear, editar y visualizar sin errores de autenticación.
import { apiClient } from '@/config/axios-config.js'






class AdminServices{
  // Eliminar empresa (CRUD empresa, NO empresa_lugar)
  // Este método elimina una empresa de la tabla empresa, no afecta empresa_lugar ni otros módulos
  static async eliminarEmpresa(empresaId) {
    try {
      const response = await apiClient.delete(`/empresas/${empresaId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }
  // Obtener todas las empresas (para el CRUD de empresas)
  // Se agrega para que el frontend use el apiClient y así el token JWT se envíe correctamente
  static async obtenerEmpresas() {
    try {
      const response = await apiClient.get('/empresas')
      return response.data
    } catch (error) {
      throw error
    }
  }
  // Métodos para empresas
  // Se agregan para que el frontend use el apiClient y así el token JWT se envíe correctamente, pues sin esto no guarda los datos del crud empresas.
  // Esto permite que el CRUD de empresas funcione correctamente, mostrando los datos en la web y permitiendo crear, editar y visualizar sin errores de autenticación.
  static async createEmpresa(empresaData) {
    try {
      const response = await apiClient.post('/empresas', empresaData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  static async actualizarEmpresa(empresaId, empresaData) {
    try {
      const response = await apiClient.put(`/empresas/${empresaId}`, empresaData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Obtiene todos los usuarios del sistema
   * Utilizado para listar usuarios en modales de asignación
   * @returns {Promise} Lista de usuarios
   */
  static async obtenerUsuarios() {
    try {
      const response = await apiClient.get('/user/usuarios')
      return response.data
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      throw error
    }
  }

  /**
   * Une un trabajador a una empresa
   * Crea una relación en la tabla usuarios_empresas
   * @param {Object} datosUnion - Datos de la unión {usuario_id, empresa_id, rol_en_empresa, fecha_inicio}
   * @returns {Promise} Respuesta del servidor
   */
  static async unirTrabajadorEmpresa(datosUnion) {
    try {
      const response = await apiClient.post('/user/usuarios-empresas', datosUnion)
      return response.data
    } catch (error) {
      console.error('Error al unir trabajador a empresa:', error)
      throw error
    }
  }
}

export default AdminServices;