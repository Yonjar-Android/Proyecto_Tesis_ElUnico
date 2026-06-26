import "./Marca.css";

const marcasData = [
  { id: 1, nombre: "Kenda" },
  { id: 2, nombre: "Akron" },
  { id: 3, nombre: "Yamaha" },
  { id: 4, nombre: "S&L" },
];

function Marca() {
  return (
    <div className="marca-container">
        <div className="marca-content">
      <div className="marca-top-part">
        <h1 className="marca-title">Marcas</h1>
        <button className="marca-add-btn">
          <span className="marca-add-icon">✦</span> Agregar marca
        </button>
      </div>

      <div className="marca-table-container">
        <div className="marca-search-wrapper">
          <span className="marca-search-icon">🔍</span>
          <input
            className="marca-search-input"
            type="text"
            placeholder="Buscar por id o nombre"
          />
        </div>

        <table className="marca-table">
          <thead>
            <tr>
              <th className="marca-th">NOMBRE DE MARCA</th>
              <th className="marca-th marca-th-actions">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {marcasData.map((marca) => (
              <tr key={marca.id} className="marca-tr">
                <td className="marca-td">{marca.nombre}</td>
                <td className="marca-td marca-td-actions">
                  <button className="marca-edit-btn">✏ Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>
                <div className="marca-footer">
                  <span className="marca-count">
                    Mostrando {marcasData.length} de {marcasData.length} marcas
                  </span>
                  <div className="marca-pagination">
                    <button className="marca-page-btn">«</button>
                    <button className="marca-page-btn">‹</button>
                    <button className="marca-page-btn marca-page-btn--active">1</button>
                    <button className="marca-page-btn">›</button>
                    <button className="marca-page-btn">»</button>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      </div>
    </div>
  );
}

export default Marca;