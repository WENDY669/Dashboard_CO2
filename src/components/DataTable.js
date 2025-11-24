import React, { useState, useMemo } from 'react';

const DataTable = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('year');
  const [sortDirection, setSortDirection] = useState('asc');

  // Calcular datos paginados y ordenados
  const { currentData, totalPages } = useMemo(() => {
    // Ordenar datos
    const sortedData = [...data].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Convertir a número si es posible
      if (!isNaN(aValue) && !isNaN(bValue)) {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    // Calcular paginación
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = sortedData.slice(startIndex, startIndex + itemsPerPage);

    return { currentData, totalPages };
  }, [data, currentPage, itemsPerPage, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Volver a primera página al ordenar
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Volver a primera página al cambiar items por página
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '⬆️' : '⬇️';
  };

  // Si no hay datos, mostrar mensaje
  if (data.length === 0) {
    return (
      <div className="table-card">
        <h2>📊 Tabla de Datos</h2>
        <div className="no-data">
          <p>No hay datos para mostrar con los filtros actuales</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-header">
        <h2>📊 Tabla de Datos</h2>
        <div className="table-controls">
          <label>
            Filas por página:
            <select 
              value={itemsPerPage} 
              onChange={handleItemsPerPageChange}
              className="page-select"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </label>
          <span className="data-count">
            Mostrando {currentData.length} de {data.length} registros
          </span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('entity')} className="sortable">
                Entidad {getSortIcon('entity')}
              </th>
              <th onClick={() => handleSort('year')} className="sortable">
                Año {getSortIcon('year')}
              </th>
              <th onClick={() => handleSort('annual_co2_emissions')} className="sortable">
                Emisiones (ton) {getSortIcon('annual_co2_emissions')}
              </th>
              <th onClick={() => handleSort('tipo_entidad')} className="sortable">
                Tipo {getSortIcon('tipo_entidad')}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, index) => (
              <tr key={index}>
                <td className="entity-cell">{item.entity}</td>
                <td className="year-cell">{item.year}</td>
                <td className="emissions-cell">
                  {Number(item.annual_co2_emissions).toLocaleString()}
                </td>
                <td className="type-cell">
                  <span className={`type-badge ${item.tipo_entidad?.toLowerCase()}`}>
                    {item.tipo_entidad}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className="pagination-btn"
          >
            ⏮️ Primera
          </button>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="pagination-btn"
          >
            ◀️ Anterior
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="pagination-btn"
          >
            Siguiente ▶️
          </button>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="pagination-btn"
          >
            Última ⏭️
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;