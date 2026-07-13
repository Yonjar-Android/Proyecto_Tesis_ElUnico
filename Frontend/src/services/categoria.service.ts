import axios from "axios";

const API = "http://localhost:3000/api/categorias";

export const obtenerCategorias = async () => {

    const response = await axios.get(API);

    return response.data;
};