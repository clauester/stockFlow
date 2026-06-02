import Swal from 'sweetalert2'

export function alertaExito(mensaje: string) {
  Swal.fire({
    icon: 'success',
    title: mensaje,
    showConfirmButton: false,
    timer: 1800,
    toast: true,
    position: 'top-end',
  })
}

export function alertaError(mensaje: string) {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: mensaje,
    confirmButtonColor: '#10b981',
  })
}

export async function confirmarEliminacion(nombre: string): Promise<boolean> {
  const resultado = await Swal.fire({
    title: '¿Estás seguro?',
    text: `Se eliminará "${nombre}" del inventario.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  })
  return resultado.isConfirmed
}

export function alertaInfo(mensaje: string) {
  Swal.fire({
    icon: 'info',
    text: mensaje,
    confirmButtonColor: '#10b981',
  })
}
