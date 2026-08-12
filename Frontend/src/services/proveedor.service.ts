import axiosInstance from "./axiosInstance";
const API = "http://localhost:3001/api/proveedores";

export const crearProveedor = async (
    Nombre_Empresa: string,
    Nombre_Contacto: string,
    Telefono: string,
    Direccion: string
) => {

    const response = await axiosInstance.post(API, {
        Nombre_Empresa,
        Nombre_Contacto,
        Telefono,
        Direccion
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

    const response = await axiosInstance.put(`${API}/${id}`, {
        Nombre_Empresa,
        Nombre_Contacto,
        Telefono,
        Direccion
    });

    return response;
};

export const buscarProveedores = async (
    search: string,
    page: number,
    perPage: number
) => {

    const response = await axiosInstance.get(`${API}/buscar`, {
        params: {
            search,
            page,
            perPage
        }
    });

    return response.data;
};