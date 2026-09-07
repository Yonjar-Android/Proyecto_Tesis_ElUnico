import axiosInstance from "./axiosInstance";
const API = "http://localhost:3001/api/credito";
const token = localStorage.getItem("token");

export const buscarCreditosPendientes = async (
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