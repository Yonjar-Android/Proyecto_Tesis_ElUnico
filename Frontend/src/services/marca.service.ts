import axios from "axios";

const API = "http://localhost:3000/api/marcas";
const token = localStorage.getItem("token");

export const obtenerMarcas = async () => {

    const response = await axios.get(API);

    return response.data;
};

export const crearMarca = async (Nombre_marca: string) => {
    const response = await axios.post(API, {
        Nombre_marca
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

export const actualizarMarca = async (id: number, Nombre_marca: string) => {
    const response = await axios.put(`${API}/${id}`, {
        Nombre_marca
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

export const buscarMarcas = async (
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