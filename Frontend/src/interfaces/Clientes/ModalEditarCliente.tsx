import { useEffect, useState } from "react";
import type Cliente from "./Cliente";

interface Props {
    abierto: boolean;
    cliente: Cliente | null;
    onClose: () => void;
    onEditar: (id: number, nombre: string, apellido: string, telefono: string,
    direccion: string, credito: number, Ncliente: number,
      setError: (mensaje: string) => void
    ) => Promise<boolean>;
}

function ModalEditarCliente({

}: Props){
    return(
        <h1>Papaleta</h1>
    );
}

export default ModalEditarCliente;