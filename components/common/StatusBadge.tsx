
import React from 'react';
import { EstadoEquipo } from '../../types';

interface StatusBadgeProps {
  estado: EstadoEquipo | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ estado }) => {
  const getStatusColor = (est: string) => {
    switch (est) {
      case EstadoEquipo.ACTIVO: return 'bg-green-100 text-green-800';
      case EstadoEquipo.DISPONIBLE: return 'bg-blue-100 text-blue-800';
      case EstadoEquipo.EN_MANTENIMIENTO: return 'bg-amber-100 text-amber-800';
      case EstadoEquipo.BAJA: return 'bg-red-100 text-red-800';
      case EstadoEquipo.PARA_BAJA: return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(estado as string)}`}>
      {estado}
    </span>
  );
};
