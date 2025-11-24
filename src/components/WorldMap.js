import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';

const WorldMap = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState(2020);
  const [tooltipContent, setTooltipContent] = useState('');
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

  // 👉 Fix SOLO para Estados Unidos
  const nameFixes = {
    "United States of America": "United States"
  };

  const { countryData, yearRange, colorScale } = useMemo(() => {
    if (!data || data.length === 0) return { countryData: {}, yearRange: [], colorScale: null };

    const yearData = data.filter(item => parseInt(item.year) === selectedYear);

    const excludedEntities = [
      "World", "Africa", "Asia", "Europe",
      "North America", "South America", "Oceania"
    ];

    const countryData = {};
    yearData.forEach(item => {
      if (!excludedEntities.includes(item.entity)) {
        countryData[item.entity] = {
          emissions: item.annual_co2_emissions ?? 0,
          year: item.year
        };
      }
    });

    const years = [...new Set(data.map(item => parseInt(item.year)))].sort((a, b) => a - b);

    const emissionsValues = Object.values(countryData)
      .map(d => d.emissions)
      .filter(v => v > 0);

    const colorScale = scaleQuantile()
      .domain(emissionsValues)
      .range([
        "#ffedea", "#ffcec5", "#ffad9f", "#ff8a75",
        "#ff5533", "#e2492d", "#be3d26", "#9a311f", "#782618"
      ]);

    return { countryData, yearRange: years, colorScale };
  }, [data, selectedYear]);

  const getFillColor = (countryName) => {
    if (!countryData[countryName]) return '#E0E0E0';
    return colorScale(countryData[countryName].emissions);
  };

  if (!data || data.length === 0) {
    return <p>No hay datos para mostrar</p>;
  }

  return (
    <div className="chart-card">
      <h2>🗺️ Mapa Mundial de Emisiones de CO₂</h2>

      <label>Año: </label>
      <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
        {yearRange.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>

      <ComposableMap projection="geoMercator" style={{ width: "100%", height: "500px" }}>
        <ZoomableGroup zoom={position.zoom}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {

                // 👉 Aplicando la corrección aquí
                let name = geo.properties.name;
                if (nameFixes[name]) {
                  name = nameFixes[name];
                }

                const emissions = countryData[name]?.emissions ?? 0;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getFillColor(name)}
                    stroke="#FFF"
                    onMouseEnter={() =>
                      setTooltipContent(`${name}: ${emissions?.toLocaleString() ?? "Sin datos"} ton`)
                    }
                    onMouseLeave={() => setTooltipContent('')}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltipContent && (
        <div className="map-tooltip">
          {tooltipContent}
        </div>
      )}
    </div>
  );
};

export default WorldMap;
