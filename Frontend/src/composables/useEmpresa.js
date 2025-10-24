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

    if( user.value.est){
      return []; // Retorna un array vacío si el usuario no es una empresa
    }


    try {
      const response = await EmpresaServices.obtenerReportesMarcaciones(user.value.rut);
      return response.data;
    } catch (error) {
      console.error("Error al obtener reportes de marcaciones:", error);
      throw error;
    }
  };

  const aprobarReporte = async (reporteId) => {
    try {
      const response = await EmpresaServices.aprobarReporte(reporteId);
      return response;
    } catch (error) {
      console.error("Error al aprobar reporte:", error);
      throw error;
    }
  };

  const rechazarReporte = async (reporteId) => {
    try {
      const response = await EmpresaServices.rechazarReporte(reporteId);
      return response;
    } catch (error) {
      console.error("Error al rechazar reporte:", error);
      throw error;
    }
  };

  const modificarMarcacion = async (marcacionId, datosMarcacion) => {
    try {
      console.log('datos marcacion', datosMarcacion)
      const response = await EmpresaServices.modificarMarcacion(marcacionId, datosMarcacion);
      return response;
    } catch (error) {
      console.error("Error al modificar marcación:", error);
      throw error;
    }
  };

  const agregarMarcacionManual = async (datosMarcacion) => {
    try {
      const response = await EmpresaServices.agregarMarcacionManual(datosMarcacion);
      return response;
    } catch (error) {
      console.error("Error al agregar marcación manual:", error);
      throw error;
    }
  };

  const eliminarTurno = async (turnoId) => {
    try {
      const response = await EmpresaServices.eliminarTurno(turnoId);
      return response;
    } catch (error) {
      console.error("Error al eliminar turno:", error);
      throw error;
    }
  };

  const obtenerHorasSemanales = async (usuarioEmpresaId) => {
    try {
      const response = await EmpresaServices.obtenerHorasSemanales(usuarioEmpresaId);
      return response.data;
    } catch (error) {
      console.error("Error al obtener horas semanales:", error);
      throw error;
    }
  };

  const eliminarTipoTurno = async (tipoTurnoId) => {
    try {
      const response = await EmpresaServices.deleteTipoTurno(tipoTurnoId);
      return response;
    } catch (error) {
      console.error("Error al eliminar tipo de turno:", error);
      throw error;
    }
  };

  const obtenerTiposTurnos = async () => {
    try {
      const response = await EmpresaServices.obtenerTiposTurnos();
      return response.data;
    } catch (error) {
      console.error("Error al obtener tipos de turnos:", error);
      throw error;
    }
  };

  const crearTipoTurno = async (tipoTurnoData) => {
    try {

      console.log('tipo turno data', tipoTurnoData)
      const response = await EmpresaServices.crearTipoTurno(tipoTurnoData);
      return response;
    } catch (error) {
      console.error("Error al crear tipo de turno:", error);
      throw error;
    }
  };

  const agregarAmonestacion = async (amonestacionData) => {
    try {
      console.log('📝 Agregando amonestación:', amonestacionData);
      const response = await EmpresaServices.registrarAmonestacion(amonestacionData);
      return response;
    } catch (error) {
      console.error("Error al agregar amonestación:", error);
      throw error;
    }
  };

  const obtenerAmonestaciones = async (trabajadorId = null) => {
    try {
      const response = await EmpresaServices.obtenerAmonestaciones(trabajadorId);
      return response.data;
    } catch (error) {
      console.error("Error al obtener amonestaciones:", error);
      throw error;
    }
  };

  const obtenerAmonestacionesPorEmpresa = async () => {
    try {
      const response = await EmpresaServices.obtenerAmonestacionesPorEmpresa(user.value.rut);
      return response.data;
    } catch (error) {
      console.error("Error al obtener amonestaciones de la empresa:", error);
      throw error;
    }
  };

  const actualizarAmonestacion = async (amonestacionId, datosActualizados) => {
    try {
      const response = await EmpresaServices.actualizarAmonestacion(amonestacionId, datosActualizados);
      return response;
    } catch (error) {
      console.error("Error al actualizar amonestación:", error);
      throw error;
    }
  };

  const eliminarAmonestacion = async (amonestacionId) => {
    try {
      const response = await EmpresaServices.eliminarAmonestacion(amonestacionId);
      return response;
    } catch (error) {
      console.error("Error al eliminar amonestación:", error);
      throw error;
    }
  };

  return {
    obtenerTrabajadores,
    obtenerTurnos,
    obtenerMarcaciones,
    obtenerMarcacionesPorEmpresa,
    obtenerReportesMarcaciones,
    aprobarReporte,
    rechazarReporte,
    modificarMarcacion,
    agregarMarcacionManual,
    eliminarTurno,
    obtenerHorasSemanales,
    obtenerTiposTurnos,
    crearTipoTurno,
    eliminarTipoTurno,
    agregarAmonestacion,
    obtenerAmonestaciones,
    obtenerAmonestacionesPorEmpresa,
    actualizarAmonestacion,
    eliminarAmonestacion
  };
}
