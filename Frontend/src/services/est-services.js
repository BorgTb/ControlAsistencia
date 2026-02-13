// NOTA:
// Se eliminaron los métodos createEmpresa y actualizarEmpresa que estaban duplicados y fuera de la clase AdminServices.
// Esto es necesario porque los métodos deben estar dentro de la clase para que el servicio funcione correctamente y evitar errores de sintaxis.
// Además, así se mantiene la organización y encapsulamiento del código.
// Esto permite que el CRUD de empresas funcione correctamente, mostrando los datos en la web y permitiendo crear, editar y visualizar sin errores de autenticación.
import { apiClient } from '@/config/axios-config.js'


class EstServices {
  // asiociar a una empresa un trabajador
  async asociarTrabajador(data) { 
    try {
      const response = await apiClient.post('/userEmpresa/est/asociar', data)
      return response.data
    }
    catch (error) {
      throw error
    }
  }

  // obtener todas las asociaciones
  async obtenerAsociaciones() {
    try {
      const response = await apiClient.get(`/userEmpresa/est/asociaciones`)
      return response.data
    }
    catch (error) {
      throw error
    }
  }

}

export default new EstServices();