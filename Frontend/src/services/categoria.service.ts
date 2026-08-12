import axiosInstance from "./axiosInstance";

const API = "http://localhost:3001/api/categorias";

export const obtenerCategorias = async () => {

    const response = await axiosInstance.get(API);

    return response.data;
};

export const crearCategoria = async (Nombre_categoria:string) => {

    const response = await axiosInstance.post(API, {
        Nombre_categoria
    })
    
    return response.data;
}

export const actualizarCategoria = async (id:number, Nombre_categoria:string) => {
    const response = await axiosInstance.put(`${API}/${id}`,{
        Nombre_categoria
    });
    return response;
}

export const buscarCategorias = async(
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