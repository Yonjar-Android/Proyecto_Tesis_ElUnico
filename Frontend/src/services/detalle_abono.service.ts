import axios from "axios";

const API = "http://localhost:3000/api/detalle_abono";

export const crearDetalleAbono = async (
    Id_cliente:number,
    Monto:number,
    Notas: string
) => {
    const response = await axios.post(API, {
        Id_cliente,
        Monto,
        Notas
        })

    return response.data;
}

export const actualizarDetalleAbonos = async (
    id: number, Monto:number, Notas: string
) => {
    const response = await axios.put(`${API}/${id}`, {
       Monto, Notas
    });

    return response;
}

export const buscarDetalleAbonos = async(
    search:string,
    page: number,
    perPage: number
) => {
    const response = await axios.get(`${API}/buscar`,{
        params: {
            search,
            page,
            perPage
        }
    });

    return response.data;
}