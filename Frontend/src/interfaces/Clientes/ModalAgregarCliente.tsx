interface Props {
  abierto: boolean;
  onClose: () => void;
  onGuardar: (
    nombre: string, apellido: string, telefono: string,
    direccion: string, credito: number, Ncliente: number,
    setError: (mensaje: string) => void
  ) => Promise<boolean>;
}

function ModalAgregarCliente({
  abierto,
  onClose,
  onGuardar,
}: Props) {

    console.log(abierto);

    return(
        <h1></h1>
        
    );
}

export default ModalAgregarCliente;