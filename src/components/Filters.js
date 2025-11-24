import React, { useState, useMemo } from 'react';

const Filters = ({ 
  data, 
  selectedCountries, 
  setSelectedCountries, 
  selectedYearRange, 
  setSelectedYearRange,
  entityType,
  setEntityType,
  onApplyFilters 
}) => {
  
  const [tempSelectedCountries, setTempSelectedCountries] = useState(selectedCountries);
  const [tempSelectedYearRange, setTempSelectedYearRange] = useState(selectedYearRange);
  const [tempEntityType, setTempEntityType] = useState(entityType);
  const [selectedLetter, setSelectedLetter] = useState('A');
  
  // Obtener todos los países únicos
  const allCountries = useMemo(() => {
    return [...new Set(data.map(item => item.entity))].filter(Boolean).sort();
  }, [data]);

  // Obtener letras iniciales únicas
  const initialLetters = useMemo(() => {
    const letters = allCountries.map(country => country.charAt(0).toUpperCase());
    return [...new Set(letters)].sort();
  }, [allCountries]);

  // Filtrar países por letra seleccionada
  const filteredCountries = useMemo(() => {
    return allCountries.filter(country => 
      country.charAt(0).toUpperCase() === selectedLetter
    );
  }, [allCountries, selectedLetter]);

  const uniqueEntityTypes = [...new Set(data.map(item => item.tipo_entidad))];

  const handleCountryChange = (country) => {
    if (tempSelectedCountries.includes(country)) {
      setTempSelectedCountries(tempSelectedCountries.filter(c => c !== country));
    } else {
      setTempSelectedCountries([...tempSelectedCountries, country]);
    }
  };

  const handleSelectAll = () => {
    if (tempSelectedCountries.length === filteredCountries.length) {
      // Deseleccionar todos los de esta letra
      const countriesToRemove = new Set(filteredCountries);
      setTempSelectedCountries(tempSelectedCountries.filter(country => !countriesToRemove.has(country)));
    } else {
      // Seleccionar todos los de esta letra
      const newSelection = [...new Set([...tempSelectedCountries, ...filteredCountries])];
      setTempSelectedCountries(newSelection);
    }
  };

  const handleApplyFilters = () => {
    setSelectedCountries(tempSelectedCountries);
    setSelectedYearRange(tempSelectedYearRange);
    setEntityType(tempEntityType);
    if (onApplyFilters) {
      onApplyFilters();
    }
  };

  const handleResetFilters = () => {
    const defaultCountries = ['Afghanistan', 'Albania', 'Algeria'];
    const defaultYearRange = [1940, 2024];
    const defaultEntityType = 'all';
    
    setTempSelectedCountries(defaultCountries);
    setTempSelectedYearRange(defaultYearRange);
    setTempEntityType(defaultEntityType);
    
    setSelectedCountries(defaultCountries);
    setSelectedYearRange(defaultYearRange);
    setEntityType(defaultEntityType);
  };

  const isAllSelected = filteredCountries.length > 0 && 
    filteredCountries.every(country => tempSelectedCountries.includes(country));

  return (
    <div className="filters-panel">
      <div className="filter-group">
        <h3>🌎 Seleccionar Países/Regiones</h3>
        
        {/* Selector de letra inicial */}
        <div className="letter-selector">
          <label>Filtrar por letra inicial:</label>
          <select 
            value={selectedLetter} 
            onChange={(e) => setSelectedLetter(e.target.value)}
            className="letter-select"
          >
            {initialLetters.map(letter => (
              <option key={letter} value={letter}>{letter}</option>
            ))}
          </select>
          <span className="countries-count">
            ({filteredCountries.length} países con {selectedLetter})
          </span>
        </div>

        {/* Botón seleccionar/deseleccionar todos */}
        <div className="select-all-container">
          <button 
            onClick={handleSelectAll}
            className="select-all-btn"
          >
            {isAllSelected ? '❌ Deseleccionar Todos' : '✅ Seleccionar Todos'}
          </button>
        </div>

        {/* Lista de países filtrados */}
        <div className="countries-list">
          {filteredCountries.map(country => (
            <label key={country} className="checkbox-label">
              <input
                type="checkbox"
                checked={tempSelectedCountries.includes(country)}
                onChange={() => handleCountryChange(country)}
              />
              <span className={tempSelectedCountries.includes(country) ? 'selected' : ''}>
                {country}
              </span>
            </label>
          ))}
        </div>

        {/* Contador de países seleccionados */}
        <div className="selection-info">
          <strong>Países seleccionados: {tempSelectedCountries.length}</strong>
          {tempSelectedCountries.length > 0 && (
            <button 
              onClick={() => setTempSelectedCountries([])}
              className="clear-selection"
            >
              Limpiar selección
            </button>
          )}
        </div>
      </div>

      <div className="filter-group">
        <h3>📅 Rango de Años</h3>
        <div className="year-range">
          <span className="year-label">{tempSelectedYearRange[0]}</span>
          <div className="sliders-container">
            <input
              type="range"
              min="1940"
              max="2024"
              value={tempSelectedYearRange[0]}
              onChange={(e) => setTempSelectedYearRange([parseInt(e.target.value), tempSelectedYearRange[1]])}
              className="year-slider"
            />
            <input
              type="range"
              min="1940"
              max="2024"
              value={tempSelectedYearRange[1]}
              onChange={(e) => setTempSelectedYearRange([tempSelectedYearRange[0], parseInt(e.target.value)])}
              className="year-slider"
            />
          </div>
          <span className="year-label">{tempSelectedYearRange[1]}</span>
        </div>
        <div className="year-display">
          Mostrando datos de {tempSelectedYearRange[0]} a {tempSelectedYearRange[1]}
        </div>
      </div>

      <div className="filter-group">
        <h3>🏛️ Tipo de Entidad</h3>
        <select 
          value={tempEntityType} 
          onChange={(e) => setTempEntityType(e.target.value)}
          className="entity-select"
        >
          <option value="all">Todos los tipos</option>
          {uniqueEntityTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Botones de acción */}
      <div className="filter-actions">
        <button 
          onClick={handleApplyFilters}
          className="apply-btn"
        >
          ✅ Aplicar Filtros
        </button>
        <button 
          onClick={handleResetFilters}
          className="reset-btn"
        >
          🔄 Restablecer
        </button>
      </div>
    </div>
  );
};

export default Filters;