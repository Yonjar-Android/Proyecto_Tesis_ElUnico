import axios from "axios";

const API = "http://localhost:3000/api/marcas";

export const obtenerMarcas = async () => {

    const response = await axios.get(API);

    return response.data;
};