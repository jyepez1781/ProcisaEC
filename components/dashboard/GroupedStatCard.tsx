
import React from 'react';

interface GroupedStatCardProps {
  title: string;
  icon: React.ReactNode;
  dataMap: Record<string, number>;
  total: number;
  bgColor: string;
  textColor: string;
}

export const GroupedStatCard: React.FC<GroupedStatCardProps> = ({ 
  title, icon, dataMap, total, bgColor, textColor 
}) => {
  const hasData = Object.keys(dataMap).length > 0;
  
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full min-h-[140px]">
        <div className="flex items-center justify-between mb-3">
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-800 leading-none mt-1">{total}</p>
            </div>
            <div className={`p-2 rounded-lg ${bgColor}`}>
                {icon}
            </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 border-t border-slate-50 pt-2">
            {hasData ? (
                <div className="space-y-1">
                    {Object.entries(dataMap).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center text-xs">
                            <span className="text-slate-600 truncate mr-2">{type}</span>
                            <span className={`font-semibold ${textColor}`}>{count}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-slate-400 italic mt-1">Sin registros</p>
            )}
        </div>
    </div>
  );
};
