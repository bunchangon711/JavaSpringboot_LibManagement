import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface BorrowingTrendsProps {
  data: Array<{
    month: string;
    borrowed: number;
    returned: number;
  }>;
}

const BorrowingTrendsChart: React.FC<BorrowingTrendsProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="borrowed" 
            stroke="#3498db" 
            strokeWidth={3}
            name="Books Borrowed"
          />
          <Line 
            type="monotone" 
            dataKey="returned" 
            stroke="#2ecc71" 
            strokeWidth={3}
            name="Books Returned"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BorrowingTrendsChart;
