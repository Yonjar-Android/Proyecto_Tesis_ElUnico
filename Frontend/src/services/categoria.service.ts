import axios from "axios";

const API = "http://localhost:3000/api/categorias";

export const obtenerCategorias = async () => {

    const response = await axios.get(API);

    return response.data;
};

export const crearCategoria = async (Nombre_categoria:string) => {

    const response = await axios.post(API, {
        Nombre_categoria
    })
    
    return response.data;
}

export const actualizarCategoria = async (id:number, Nombre_categoria:string) => {
    const response = await axios.put(`${API}/${id}`,{
        Nombre_categoria
    });
    return response;
}

export const buscarCategorias = async(
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