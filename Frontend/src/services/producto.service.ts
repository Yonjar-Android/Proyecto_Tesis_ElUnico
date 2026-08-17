import axios from "axios";

const API = "http://localhost:3000/api/productos";
const token = localStorage.getItem("token");

export const crearProducto = async (
    Nombre: string,
    Id_marca: number,
    Id_categoria: number,
    Precio_venta: number,
    Stock: number,
    Stock_min: number,
    Fecha_vencimiento: String | null
) => {

    const response = await axios.post(API, {
        Nombre,
        Id_marca,
        Id_categoria,
        Precio_venta,
        Stock,
        Stock_min,
        Fecha_vencimiento
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

export const actualizarProducto = async (
    id: number,
    Nombre: string,
    Id_marca: number,
    Id_categoria: number,
    Precio_venta: number,
    Stock: number,
    Stock_min: number,
    Fecha_vencimiento: String | null
) => {

    const response = await axios.put(`${API}/${id}`, {
        Nombre,
        Id_marca,
        Id_categoria,
        Precio_venta,
        Stock,
        Stock_min,
        Fecha_vencimiento
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response;
};

export const buscarProductos = async (
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

export const buscarProductoPorId = async (id: number) => {
    const response = await axios.get(`${API}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}

export const obtenerTotalProductosCategorias = async () => {
    const response = await axios.get(`${API}/obtener-estadisticas`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}