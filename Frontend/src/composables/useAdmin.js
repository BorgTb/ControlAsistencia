import AdminServices from "../services/AdminServices.js";
import { useAuth } from "./useAuth.js";
export function useAdmin() {
  const { user } = useAuth();

  const obtenerTrabajadores = async (enrolados = false) => {
    try {
        const response = await AdminServices.obtenerTrabajadores(user.value.rut,enrolados);
        return response.data;
    } catch (error) {
      console.error("Error al obtener trabajadores:", error);
      throw error;
    }
  };

  const obtenerTurnos = async () => {
    try {
      const response = await AdminServices.obtenerTurnos(user.value.rut);
      return response.data;
    } catch (error) {
      console.error("Error al obtener turnos:", error);
      throw error;
    }
  };

  const obtenerMarcaciones = async (fecha = null) => {
    try {
      if (fecha) {
        const response = await AdminServices.obtenerMarcacionesPorFecha(fecha);
        return response.data;
      } else {
        const response = await AdminServices.obtenerTodasLasMarcaciones();
        return response.data;
      }
    } catch (error) {
      console.error("Error al obtener marcaciones:", error);
      throw error;
    }
  };

  const obtenerMarcacionesPorEmpresa = async (fecha) => {
    try {
      const response = await AdminServices.obtenerMarcacionesPorEmpresa(user.value.rut, fecha);
      return response.data;
    } catch (error) {
      console.error("Error al obtener marcaciones por empresa:", error);
      throw error;
    }
  };

  return {
    obtenerTrabajadores,
    obtenerTurnos,
    obtenerMarcaciones,
    obtenerMarcacionesPorEmpresa
  };
}
