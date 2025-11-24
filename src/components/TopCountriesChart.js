import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TopCountriesChart = ({ data }) => {
  // Calcular emisiones totales históricas por país
  const processTopCountriesData = () => {
    const countryTotals = {};
    
    data.forEach(item => {
      // Solo países, excluyendo regiones como "World", "Africa", etc.
        if (
          item.entity &&
          !item.entity.includes('(GCP)') &&
          !['World', 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'].includes(item.entity)) {
          
        if (!countryTotals[item.entity]) {
          countryTotals[item.entity] = 0;
        }
        countryTotals[item.entity] += item.annual_co2_emissions;
      }
    });
    
    return Object.entries(countryTotals)
      .map(([country, total]) => ({ 
        country: country.length > 15 ? country.substring(0, 15) + '...' : country,
        fullCountry: country,
        total: Math.round(total / 1000000000), // Convertir a miles de millones
        emissions: total
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20); // Top 20 países
  };

  const topCountriesData = processTopCountriesData();

  // Si no hay datos, mostrar mensaje
  if (data.length === 0 || topCountriesData.length === 0) {
    return (
      <div className="chart-card">
        <h2>🥇 Top 20 Países Históricos</h2>
        <div className="no-data">
          <p>No hay datos de países para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h2>🥇 Top 20 Países Históricos</h2>
      <div className="chart-info">
        <p>Países con mayores emisiones acumuladas en todo el periodo (excluyendo regiones)</p>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={topCountriesData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number"
              label={{ value: 'Miles de millones de toneladas', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              type="category" 
              dataKey="country"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => [`${Number(value).toFixed(2)}B ton`, 'Emisiones']}
              labelFormatter={(value, payload) => {
                if (payload && payload[0]) {
                  return `País: ${payload[0].payload.fullCountry}`;
                }
                return value;
              }}
            />
            <Legend />
            <Bar 
              dataKey="total" 
              fill="#ff6b6b" 
              name="Emisiones Totales"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-footer">
        <small>Emisiones acumuladas desde 1940 - Solo países individuales</small>
      </div>
    </div>
  );
};

export default TopCountriesChart;