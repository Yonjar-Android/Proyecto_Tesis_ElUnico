import axiosInstance from "./axiosInstance";
const API = "http://localhost:3001/api/clientes";

export const crearCliente = async (
    Nombre: string, Apellido: string, Telefono: string,
    Direccion: string, Saldo_Deuda: number, NCliente: number
) => {
    const response = await axiosInstance.post(API, {
        Nombre, Apellido, Telefono, Direccion, Saldo_Deuda, NCliente
    })

    return response.data;
}

export const actualizarCliente = async (
    id: number, Nombre:string, Apellido: string, 
    Telefono: string, Direccion: string, Saldo_Deuda: number,
    NCliente: number
) => {
    const response = await axiosInstance.put(`${API}/${id}`, {
        Nombre, Apellido, Telefono, Direccion, Saldo_Deuda, NCliente
    });

    return response;
}

export const buscarClientes = async(
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