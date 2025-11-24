import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OCDEChart = ({ data }) => {
  // Lista de países OCDE
  const ocedeCountries = [
    'Australia', 'Austria', 'Belgium', 'Canada', 'Chile', 'Colombia', 'Costa Rica',
    'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece',
    'Hungary', 'Iceland', 'Ireland', 'Israel', 'Italy', 'Japan', 'South Korea', 'Latvia',
    'Lithuania', 'Luxembourg', 'Mexico', 'Netherlands', 'New Zealand', 'Norway',
    'Poland', 'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
    'Turkey', 'United Kingdom', 'United States'
  ];

  // Procesar datos para OCDE vs NO OCDE
  const processOCDEData = () => {
    const yearData = {};
    
    data.forEach(item => {
      if (item.tipo_entidad === 'Pais') {
        const year = item.year;
        if (!yearData[year]) {
          yearData[year] = { 
            year: parseInt(year),
            OCDE: 0,
            "NO OCDE": 0
          };
        }
        
        const isOCDE = ocedeCountries.includes(item.entity);
        const category = isOCDE ? 'OCDE' : 'NO OCDE';
        yearData[year][category] += item.annual_co2_emissions;
      }
    });
    
    return Object.values(yearData)
      .sort((a, b) => a.year - b.year)
      .map(item => ({
        ...item,
        OCDE: item.OCDE / 1000000, // Convertir a millones
        "NO OCDE": item["NO OCDE"] / 1000000
      }));
  };

  const chartData = processOCDEData();

  // Calcular totales
  const totals = useMemo(() => {
    const ocedeTotal = chartData.reduce((sum, item) => sum + item.OCDE, 0);
    const noOCDETotal = chartData.reduce((sum, item) => sum + item["NO OCDE"], 0);
    const grandTotal = ocedeTotal + noOCDETotal;
    
    return {
      ocedeTotal,
      noOCDETotal,
      ocedePercentage: ((ocedeTotal / grandTotal) * 100).toFixed(1),
      noOCDEPercentage: ((noOCDETotal / grandTotal) * 100).toFixed(1)
    };
  }, [chartData]);

  // Si no hay datos, mostrar mensaje
  if (data.length === 0 || chartData.length === 0) {
    return (
      <div className="chart-card">
        <h2>🏛️ OCDE vs NO OCDE</h2>
        <div className="no-data">
          <p>No hay datos suficientes para generar la gráfica</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h2>🏛️ OCDE vs NO OCDE</h2>
      <div className="chart-info">
        <div className="ocde-stats">
          <div className="stat-item">
            <span className="stat-label">OCDE:</span>
            <span className="stat-value">{totals.ocedeTotal.toFixed(0)}M ton</span>
            <span className="stat-percentage">({totals.ocedePercentage}%)</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">NO OCDE:</span>
            <span className="stat-value">{totals.noOCDETotal.toFixed(0)}M ton</span>
            <span className="stat-percentage">({totals.noOCDEPercentage}%)</span>
          </div>
        </div>
      </div>
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year" 
              label={{ value: 'Año', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Emisiones (millones de toneladas)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value) => [`${Number(value).toFixed(2)}M ton`, 'Emisiones']}
              labelFormatter={(year) => `Año: ${year}`}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="OCDE" 
              stackId="1"
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.8}
              name="Países OCDE"
            />
            <Area 
              type="monotone" 
              dataKey="NO OCDE" 
              stackId="1"
              stroke="#82ca9d" 
              fill="#82ca9d" 
              fillOpacity={0.8}
              name="Resto del Mundo"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chart-footer">
        <small>Comparación de emisiones entre países pertenecientes a la OCDE y el resto del mundo</small>
      </div>
    </div>
  );
};

export default OCDEChart;