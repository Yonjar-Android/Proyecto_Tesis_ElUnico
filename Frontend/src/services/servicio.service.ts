import axios from "axios";

const API = "http://localhost:3000/api/servicios";
const token = localStorage.getItem("token");

export const crearServicio = async (
    Nombre_servicio: string,
    Descripcion: string,
    Precio: number 
) => {

    const response = await axios.post(API, {
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

    const response = await axios.put(`${API}/${id}`, {
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
