import axiosInstance from "./axiosInstance";

const API = "http://localhost:3001/api/detalle_abono";

export const crearDetalleAbono = async (
    Id_cliente:number,
    Monto:number,
    Notas: string
) => {
    const response = await axiosInstance.post(API, {
        Id_cliente,
        Monto,
        Notas
        })

    return response.data;
}

export const actualizarDetalleAbonos = async (
    id: number, Monto:number, Notas: string
) => {
    const response = await axiosInstance.put(`${API}/${id}`, {
       Monto, Notas
    });

    return response;
}

export const buscarDetalleAbonos = async(
    search:string,
    page: number,
    perPage: number
) => {
    const response = await axiosInstance.get(`${API}/buscar`,{
        params: {
            search,
            page,
            perPage
        }
    });

    return response.data;
}