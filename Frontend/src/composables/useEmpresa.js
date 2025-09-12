import EmpresaServices from "../services/EmpresaService.js";
import { useAuth } from "./useAuth.js";
export function useEmpresa() {
  const { user } = useAuth();

  const obtenerTrabajadores = async (enrolados = false) => {
    try {
        const response = await EmpresaServices.obtenerTrabajadores(user.value.rut,enrolados);
        return response.data;
    } catch (error) {
      console.error("Error al obtener trabajadores:", error);
      throw error;
    }
  };

  const obtenerTurnos = async () => {
    try {
      const response = await EmpresaServices.obtenerTurnos(user.value.rut);
      return response.data;
    } catch (error) {
      console.error("Error al obtener turnos:", error);
      throw error;
    }
  };

  const obtenerMarcaciones = async (fecha = null) => {
    try {
      if (fecha) {
        const response = await EmpresaServices.obtenerMarcacionesPorFecha(fecha);
        return response.data;
      } else {
        const response = await EmpresaServices.obtenerTodasLasMarcaciones();
        return response.data;
      }
    } catch (error) {
      console.error("Error al obtener marcaciones:", error);
      throw error;
    }
  };

  const obtenerMarcacionesPorEmpresa = async (fecha) => {
    try {
      const response = await EmpresaServices.obtenerMarcacionesPorEmpresa(user.value.rut, fecha);
      console.log('marcaciones', response.data)
      return response.data;
    } catch (error) {
      console.error("Error al obtener marcaciones por empresa:", error);
      throw error;
    }
  };

  const obtenerReportesMarcaciones = async () => {
    try {
      const response = await EmpresaServices.obtenerReportesMarcaciones(user.value.rut);
      return response.data;
    } catch (error) {
      console.error("Error al obtener reportes de marcaciones:", error);
      throw error;
    }
  };

  return {
    obtenerTrabajadores,
    obtenerTurnos,
    obtenerMarcaciones,
    obtenerMarcacionesPorEmpresa,
    obtenerReportesMarcaciones
  };
}
