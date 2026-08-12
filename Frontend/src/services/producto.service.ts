import axiosInstance from "./axiosInstance";

const API = "http://localhost:3001/api/productos";

export const crearProducto = async (
    Nombre: string,
    Id_marca: number,
    Id_categoria: number,
    Precio_venta: number,
    Stock: number,
    Stock_min: number,
    Fecha_vencimiento: Date | null
) => {

    const response = await axiosInstance.post(API, {
        Nombre,
        Id_marca,
        Id_categoria,
        Precio_venta,
        Stock,
        Stock_min,
        Fecha_vencimiento
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
    Fecha_vencimiento: Date | null
) => {

    const response = await axiosInstance.put(`${API}/${id}`, {
        Nombre,
        Id_marca,
        Id_categoria,
        Precio_venta,
        Stock,
        Stock_min,
        Fecha_vencimiento
    });

    return response;
};

export const buscarProductos = async (
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

export const buscarProductoPorId = async (id: number) => {
    const response = await axiosInstance.get(`${API}/${id}`);
    return response.data;
}

export const obtenerTotalProductosCategorias = async () => {
    const response = await axiosInstance.get(`${API}/obtener-estadisticas`);
    return response.data;
}