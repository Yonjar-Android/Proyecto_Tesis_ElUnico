import axiosInstance from "./axiosInstance";

const API = "http://localhost:3001/api/marcas";

export const obtenerMarcas = async () => {

    const response = await axiosInstance.get(API);

    return response.data;
};

export const crearMarca = async (Nombre_marca: string) => {
    const response = await axiosInstance.post(API, {
        Nombre_marca
    });

    return response.data;
};

export const actualizarMarca = async (id: number, Nombre_marca: string) => {
    const response = await axiosInstance.put(`${API}/${id}`, {
        Nombre_marca
    });

    return response.data;
};

export const buscarMarcas = async (
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