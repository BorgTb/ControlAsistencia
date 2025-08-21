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

  return {
    obtenerTrabajadores,
  };
}
