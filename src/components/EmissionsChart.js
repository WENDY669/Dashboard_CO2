import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EmissionsChart = ({ data }) => {
  // Procesar datos para el gráfico
  const { chartData, maxEmissions } = useMemo(() => {
    const yearData = {};
    let maxEmissionsValue = 0;
    
    data.forEach(item => {
      const year = item.year;
      if (!yearData[year]) {
        yearData[year] = { year: parseInt(year) };
      }
      yearData[year][item.entity] = item.annual_co2_emissions;
      
      // Encontrar el valor máximo para la escala fija
      if (item.annual_co2_emissions > maxEmissionsValue) {
        maxEmissionsValue = item.annual_co2_emissions;
      }
    });
    
    const sortedData = Object.values(yearData).sort((a, b) => a.year - b.year);
    
    return {
      chartData: sortedData,
      maxEmissions: maxEmissionsValue
    };
  }, [data]);

  const countries = [...new Set(data.map(item => item.entity))];

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#8a89a6', '#7b6888'];

  // Si no hay datos, mostrar mensaje
  if (data.length === 0) {
    return (
      <div className="chart-card">
        <h2>📈 Evolución de Emisiones de CO₂</h2>
        <div className="no-data">
          <p>Selecciona países en los filtros para ver la evolución de emisiones</p>
        </div>
      </div>
    );
  }

  // Calcular un dominio máximo razonable para el eje Y
  const calculateYDomain = () => {
    if (maxEmissions === 0) return [0, 1000];
    
    // Usar el máximo encontrado más un margen del 10%
    const upperBound = maxEmissions * 1.1;
    
    // Para números muy grandes, redondear a millones/billones
    if (upperBound > 1000000000) {
      return [0, Math.ceil(upperBound / 100000000) * 100000000];
    } else if (upperBound > 1000000) {
      return [0, Math.ceil(upperBound / 100000) * 100000];
    } else {
      return [0, Math.ceil(upperBound / 1000) * 1000];
    }
  };

  const yDomain = calculateYDomain();

  return (
    <div className="chart-card">
      <h2>📈 Evolución de Emisiones de CO₂</h2>
      <div className="chart-info">
        <p>Escala fija para mejor comparación entre países</p>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year" 
              label={{ value: 'Año', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              domain={yDomain}
              label={{ value: 'Emisiones (toneladas)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => {
                if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value;
              }}
            />
            <Tooltip 
              formatter={(value) => {
                if (value >= 1000000000) return [`${(value / 1000000000).toFixed(2)}B ton`, 'Emisiones'];
                if (value >= 1000000) return [`${(value / 1000000).toFixed(2)}M ton`, 'Emisiones'];
                if (value >= 1000) return [`${(value / 1000).toFixed(2)}K ton`, 'Emisiones'];
                return [`${Number(value).toLocaleString()} ton`, 'Emisiones'];
              }}
              labelFormatter={(year) => `Año: ${year}`}
            />
            <Legend />
            {countries.map((country, index) => (
              <Line
                key={country}
                type="monotone"
                dataKey={country}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-footer">
        <small>Escala fija para comparación consistente. Líneas pueden superponerse con valores muy diferentes.</small>
      </div>
    </div>
  );
};

export default EmissionsChart;