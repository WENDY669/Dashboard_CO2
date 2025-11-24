import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLog } from 'd3-scale';
import { interpolateReds } from 'd3-scale-chromatic';
import { geoCentroid } from 'd3-geo';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const WorldMap = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState(2020);
  const [tooltip, setTooltip] = useState(null);
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 });

  const { countryData, years, colorScale } = useMemo(() => {
    if (!data) return { countryData: {}, years: [], colorScale: null };

    const filtered = data.filter(
      d => parseInt(d.year) === selectedYear && d.tipo_entidad === "Pais"
    );

    const values = filtered.map(d => d.annual_co2_emissions).filter(v => v > 0);

    const scale = scaleLog()
      .domain([
        Math.min(...values) || 1,
        Math.max(...values) || 1000000000
      ])
      .range([0.2, 1]);

    const map = {};
    filtered.forEach(d => {
      map[d.entity] = d.annual_co2_emissions;
    });

    const availableYears = [...new Set(data.map(d => parseInt(d.year)))].sort((a, b) => a - b);

    return { countryData: map, years: availableYears, colorScale: scale };
  }, [data, selectedYear]);

  const handleReset = () => {
    setPosition({ coordinates: [0, 20], zoom: 1 });
  };

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
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <button className="reset-btn" onClick={handleReset}>🔄 Reset</button>
        </div>
      </div>

      <div className="map-wrapper" style={{ position: "relative" }}>
        {tooltip && (
          <div
            className="tooltip"
            style={{
              left: tooltip.x,
              top: tooltip.y,
            }}
          >
            <img
              src={`https://flagsapi.com/${tooltip.code}/flat/32.png`}
              alt={tooltip.name}
              style={{ borderRadius: "4px", marginBottom: "5px" }}
            />
            <strong>{tooltip.name}</strong>
            <br />
            {tooltip.value?.toLocaleString()} t CO₂
          </div>
        )}

        <ComposableMap projection="geoMercator" style={{ width: "100%", height: "520px" }}>
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            onMove={pos => setPosition(pos)}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const name = geo.properties.name;
                  const emissions = countryData[name];
                  const color = emissions ? interpolateReds(colorScale(emissions)) : "#dcdcdc";

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={color}
                      stroke="#FFF"
                      style={{
                        default: { transition: "all 0.3s ease" },
                        hover: {
                          fill: "#e63946",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }
                      }}
                      onMouseEnter={(evt) => {
                        const countryCode = geo.properties.iso_a2;
                        setTooltip({
                          name,
                          value: emissions,
                          code: countryCode,
                          x: evt.clientX - 100,
                          y: evt.clientY - 80,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <small>Colores más intensos = mayores emisiones</small>
    </div>
  );
};

export default WorldMap;
