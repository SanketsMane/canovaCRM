import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import './SalesAnalytics.css';

const SalesAnalytics = ({ data = [] }) => {
  // Custom tooltip to show total sales
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${label}`}</p>
          <p className="sales">{`Sales: ${payload[0].value}`}</p>
          <p className="cumulative">{`Total Sales: ${payload[0].payload.cumulativeSales}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="sales-analytics">
      <h2>Sale Analytics</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={20}>
          <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
          <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
          <Bar dataKey="sales" fill="#d1d5db" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesAnalytics; 