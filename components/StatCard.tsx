import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, bgColor }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
    <div className={`p-3 rounded-lg ${bgColor}`}>
      {icon}
    </div>
  </div>
);

export default StatCard;