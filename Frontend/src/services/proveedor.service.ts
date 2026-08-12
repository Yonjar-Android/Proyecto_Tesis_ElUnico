import axios from "axios";

const API = "http://localhost:3000/api/proveedores";
const token = localStorage.getItem("token");

export const crearProveedor = async (
    Nombre_Empresa: string,
    Nombre_Contacto: string,
    Telefono: string,
    Direccion: string
) => {

    const response = await axios.post(API, {
        Nombre_Empresa,
        Nombre_Contacto,
        Telefono,
        Direccion
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

export const actualizarProveedor = async (
    id: number,
    Nombre_Empresa: string,
    Nombre_Contacto: string,
    Telefono: string,
    Direccion: string
) => {

    const response = await axios.put(`${API}/${id}`, {
        Nombre_Empresa,
        Nombre_Contacto,
        Telefono,
        Direccion
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response;
};

export const buscarProveedores = async (
    search: string,
    page: number,
    perPage: number
) => {

    const response = await axios.get(`${API}/buscar`, {
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
};