import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CountryComparison = ({ data }) => {
  const processComparisonData = () => {
    const countryTotals = {};
    
    data.forEach(item => {
      if (!countryTotals[item.entity]) {
        countryTotals[item.entity] = 0;
      }
      countryTotals[item.entity] += item.annual_co2_emissions;
    });
    
    return Object.entries(countryTotals)
      .map(([country, total]) => ({ 
        country: country.length > 15 ? country.substring(0, 15) + '...' : country,
        fullCountry: country,
        total: total,
        totalMillions: total / 1000000 // Para display
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Top 10 países
  };

  const comparisonData = processComparisonData();

  // Calcular dominio máximo para escala consistente
  const calculateDomain = () => {
    if (comparisonData.length === 0) return [0, 1000];
    const maxValue = Math.max(...comparisonData.map(item => item.total));
    return [0, maxValue * 1.1]; // 10% de margen
  };

  const domain = calculateDomain();

  // Si no hay datos, mostrar mensaje
  if (data.length === 0 || comparisonData.length === 0) {
    return (
      <div className="chart-card">
        <h2>🏆 Comparación por País/Región</h2>
        <div className="no-data">
          <p>Selecciona países y ajusta los filtros para ver la comparación</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h2>🏆 Comparación por País/Región</h2>
      <div className="chart-info">
        <p>Top 10 países por emisiones totales en el periodo seleccionado</p>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart 
            data={comparisonData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="country" 
              angle={-45} 
              textAnchor="end" 
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={domain}
              tickFormatter={(value) => {
                if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value;
              }}
            />
            <Tooltip 
              formatter={(value) => {
                if (value >= 1000000000) return [`${(value / 1000000000).toFixed(2)}B ton`, 'Emisiones Totales'];
                if (value >= 1000000) return [`${(value / 1000000).toFixed(2)}M ton`, 'Emisiones Totales'];
                if (value >= 1000) return [`${(value / 1000).toFixed(2)}K ton`, 'Emisiones Totales'];
                return [`${Number(value).toLocaleString()} ton`, 'Emisiones Totales'];
              }}
              labelFormatter={(country, payload) => {
                if (payload && payload[0]) {
                  return `País: ${payload[0].payload.fullCountry}`;
                }
                return country;
              }}
            />
            <Legend />
            <Bar 
              dataKey="total" 
              fill="#8884d8" 
              name="Emisiones Totales"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-footer">
        <small>Escala automática ajustada al rango de datos. Barras representan emisiones acumuladas.</small>
      </div>
    </div>
  );
};

export default CountryComparison;