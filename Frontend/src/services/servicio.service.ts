import axiosInstance from "./axiosInstance";

const API = "http://localhost:3001/api/servicios";
const token = localStorage.getItem("token");

export const crearServicio = async (
    Nombre_servicio: string,
    Descripcion: string,
    Precio: number 
) => {

    const response = await axiosInstance.post(API, {
        Nombre_servicio,
        Descripcion,
        Precio
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

export const actualizarServicio = async (
    id: number,
    Nombre_servicio: string,
    Descripcion: string,
    Precio: number 
) => {

    const response = await axiosInstance.put(`${API}/${id}`, {
    Nombre_servicio,
    Descripcion,
    Precio 
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response;
};

export const buscarServicios = async (
    search: string,
    page: number,
    perPage: number
) => {

    const response = await axiosInstance.get(`${API}/buscar`, {
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
