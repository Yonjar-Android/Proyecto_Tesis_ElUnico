import axios from "axios";

const API = "http://localhost:3000/api/clientes";
const token = localStorage.getItem("token");


export const crearCliente = async (
    Nombre: string, Apellido: string, Telefono: string,
    Direccion: string, Saldo_Deuda: number, NCliente: number
) => {
    const response = await axios.post(API, {
        Nombre, Apellido, Telefono, Direccion, Saldo_Deuda, NCliente
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return response.data;
}

export const actualizarCliente = async (
    id: number, Nombre:string, Apellido: string, 
    Telefono: string, Direccion: string, Saldo_Deuda: number,
    NCliente: number
) => {
    const response = await axios.put(`${API}/${id}`, {
        Nombre, Apellido, Telefono, Direccion, Saldo_Deuda, NCliente
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response;
}

export const buscarClientes = async(
    search:string,
    page: number,
    perPage: number
) => {
    const response = await axios.get(`${API}/buscar`,{
        params: {
            search,
            page,
            perPage
        },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
}