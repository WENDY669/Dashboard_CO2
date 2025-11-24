import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Header from './components/Header';
import Filters from './components/Filters';
import EmissionsChart from './components/EmissionsChart';
import CountryComparison from './components/CountryComparison';
import TopCountriesChart from './components/TopCountriesChart';
import WorldMap from './components/WorldMap';
import DataTable from './components/DataTable';
import './styles/App.css';

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState(['Afghanistan', 'Albania', 'Algeria']);
  const [selectedYearRange, setSelectedYearRange] = useState([1940, 2024]);
  const [entityType, setEntityType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar datos del CSV
    fetch('/data/co2_emissions_1940_clean.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            const parsedData = result.data.filter(item => item.entity && item.year);
            setData(parsedData);
            // Aplicar filtros iniciales
            applyFilters(parsedData, selectedCountries, selectedYearRange, entityType);
            setLoading(false);
          }
        });
      })
      .catch(error => {
        console.error('Error loading CSV:', error);
        setLoading(false);
      });
  }, []);

  // Función para aplicar filtros
  const applyFilters = (dataToFilter = data, countries = selectedCountries, yearRange = selectedYearRange, type = entityType) => {
    let filtered = dataToFilter.filter(item => {
      const year = parseInt(item.year);
      const isCountry = countries.includes(item.entity);
      const isYearInRange = year >= yearRange[0] && year <= yearRange[1];
      const isEntityType = type === 'all' || item.tipo_entidad === type;
      
      return isCountry && isYearInRange && isEntityType;
    });
    setFilteredData(filtered);
  };

  const handleApplyFilters = () => {
    applyFilters();
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <h1>🌍 Cargando datos de CO₂...</h1>
          <p>Por favor espera mientras se cargan los datos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      <div className="dashboard-container">
        <Filters 
          data={data}
          selectedCountries={selectedCountries}
          setSelectedCountries={setSelectedCountries}
          selectedYearRange={selectedYearRange}
          setSelectedYearRange={setSelectedYearRange}
          entityType={entityType}
          setEntityType={setEntityType}
          onApplyFilters={handleApplyFilters}
        />
        
        {/* Primera fila: Gráfico de líneas y comparación */}
        <div className="charts-grid">
          <div className="chart-container">
            <EmissionsChart data={filteredData} />
          </div>
          
          <div className="chart-container">
            <CountryComparison data={filteredData} />
          </div>
        </div>

        {/* Segunda fila: Top países y Tabla de datos */}
        <div className="charts-grid">
          <div className="chart-container">
            <TopCountriesChart data={data} />
          </div>
          
          <div className="chart-container table-in-grid">
            <DataTable data={filteredData} />
          </div>
        </div>

        {/* Mapa mundial - Ancho completo */}
        <div className="full-width-chart">
          <WorldMap data={data} />
        </div>
      </div>
    </div>
  );
}

export default App;