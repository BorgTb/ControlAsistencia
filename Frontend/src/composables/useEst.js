import EstServices from "../services/EstServices.js";
import { useAuth } from "./useAuth.js";

export function useEst() {
  const { user } = useAuth();
    const asociarTrabajador = async (data) => {
      try {
        const response = await EstServices.asociarTrabajador(data);
        return response;
      } catch (error) {
        console.error("Error asociando trabajador:", error);
        throw error;
      }
    };

    const obtenerAsociaciones = async () => {
        try {
            const response = await EstServices.obtenerAsociaciones();
            return response;
        } catch (error) {
            console.error("Error al obtener asociaciones:", error);
            throw error;
        }
    };
    return {
        asociarTrabajador,
        obtenerAsociaciones
    };
}

