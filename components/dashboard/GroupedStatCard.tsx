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
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full min-h-[140px] transition-colors">
        <div className="flex items-center justify-between mb-3">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none mt-1">{total}</p>
            </div>
            <div className={`p-2 rounded-lg ${bgColor} dark:bg-opacity-20`}>
                {icon}
            </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 border-t border-slate-50 dark:border-slate-700 pt-2">
            {hasData ? (
                <div className="space-y-1">
                    {Object.entries(dataMap).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center text-xs">
                            <span className="text-slate-600 dark:text-slate-400 truncate mr-2">{type}</span>
                            <span className={`font-semibold ${textColor} dark:text-slate-200`}>{count}</span>
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