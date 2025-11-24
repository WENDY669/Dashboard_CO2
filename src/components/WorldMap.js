import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';

const WorldMap = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState(2020);
  const [tooltipContent, setTooltipContent] = useState('');
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  // URL del archivo GeoJSON del mundo
  const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

  // Procesar datos para el mapa
  const { countryData, yearRange, colorScale } = useMemo(() => {
    if (!data || data.length === 0) return { countryData: {}, yearRange: [], colorScale: null };

    // Filtrar datos del año seleccionado y solo países
    const yearData = data.filter(item => 
      parseInt(item.year) === selectedYear && item.tipo_entidad === 'Pais'
    );

    // Crear objeto con datos por país
    const countryData = {};
    yearData.forEach(item => {
      countryData[item.entity] = {
        emissions: item.annual_co2_emissions,
        year: item.year
      };
    });

    // Obtener rango de años disponibles
    const years = [...new Set(data.map(item => parseInt(item.year)))].sort((a, b) => a - b);
    
    // Crear escala de colores basada en los datos
    const emissionsValues = yearData.map(item => item.annual_co2_emissions).filter(val => val > 0);
    const colorScale = scaleQuantile()
      .domain(emissionsValues)
      .range([
        "#ffedea",
        "#ffcec5",
        "#ffad9f",
        "#ff8a75",
        "#ff5533",
        "#e2492d",
        "#be3d26",
        "#9a311f",
        "#782618"
      ]);

    return { countryData, yearRange: years, colorScale };
  }, [data, selectedYear]);

  // Función para obtener el color basado en las emisiones
  const getFillColor = (countryName) => {
    const country = countryData[countryName];
    if (!country || country.emissions === 0) return '#F5F5F5';
    return colorScale(country.emissions);
  };

  // Si no hay datos, mostrar mensaje
  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <h2>🗺️ Mapa Mundial de Emisiones de CO₂</h2>
        <div className="no-data">
          <p>No hay datos suficientes para generar el mapa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h2>🗺️ Mapa Mundial de Emisiones de CO₂</h2>
        <div className="map-controls">
          <div className="year-selector">
            <label>Año: </label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="year-select"
            >
              {yearRange.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="map-info">
            <p>Intensidad de color representa nivel de emisiones en {selectedYear}</p>
          </div>
        </div>
      </div>

      <div className="map-wrapper">
        <div className="map-container">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 130,
              center: [0, 20]
            }}
            style={{ width: '100%', height: '500px' }}
          >
            <ZoomableGroup
              center={position.coordinates}
              zoom={position.zoom}
              onMove={({ coordinates, zoom }) => {
                setPosition({ coordinates, zoom });
              }}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryName = geo.properties.name;
                    const countryDataItem = countryData[countryName];
                    const emissions = countryDataItem ? countryDataItem.emissions : 0;
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={getFillColor(countryName)}
                        stroke="#FFFFFF"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: 'none' },
                          hover: { 
                            fill: '#F53',
                            outline: 'none',
                            stroke: '#000',
                            strokeWidth: 1
                          },
                          pressed: { outline: 'none' }
                        }}
                        onMouseEnter={() => {
                          setTooltipContent(`
                            <strong>${countryName}</strong><br/>
                            Emisiones: ${emissions > 0 ? emissions.toLocaleString() + ' ton' : 'No data'}
                            <br/>Año: ${selectedYear}
                          `);
                        }}
                        onMouseLeave={() => {
                          setTooltipContent('');
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {/* Tooltip */}
        {tooltipContent && (
          <div 
            className="map-tooltip"
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '10px',
              borderRadius: '5px',
              fontSize: '14px',
              zIndex: 1000
            }}
            dangerouslySetInnerHTML={{ __html: tooltipContent }}
          />
        )}

        {/* Leyenda */}
        <div className="map-legend">
          <div className="legend-title">Intensidad de Emisiones (toneladas)</div>
          <div className="legend-gradient">
            <span>Bajo</span>
            <div className="gradient-bar">
              <div className="gradient-color" style={{ background: '#ffedea' }}></div>
              <div className="gradient-color" style={{ background: '#ffcec5' }}></div>
              <div className="gradient-color" style={{ background: '#ffad9f' }}></div>
              <div className="gradient-color" style={{ background: '#ff8a75' }}></div>
              <div className="gradient-color" style={{ background: '#ff5533' }}></div>
              <div className="gradient-color" style={{ background: '#e2492d' }}></div>
              <div className="gradient-color" style={{ background: '#be3d26' }}></div>
              <div className="gradient-color" style={{ background: '#9a311f' }}></div>
              <div className="gradient-color" style={{ background: '#782618' }}></div>
            </div>
            <span>Alto</span>
          </div>
        </div>
      </div>

      <div className="chart-footer">
        <small>
          Mapa interactivo mostrando emisiones de CO₂ por país en {selectedYear}. 
          Los países en gris no tienen datos disponibles.
        </small>
      </div>
    </div>
  );
};

export default WorldMap;