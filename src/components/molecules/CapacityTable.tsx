import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
  } from '@tanstack/react-table';
  import { useState } from 'react';
  import type { CapacityData } from '../../types/common';
  import { Card, CardHeader, CardTitle, CardContent } from '../atoms/Card';
  
  const columnHelper = createColumnHelper<CapacityData>();
  
  const columns = [
    columnHelper.accessor('collaborator', {
      header: 'Colaborador',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('availableHours', {
      header: 'Horas Disponibles',
      cell: info => info.getValue().toFixed(1),
    }),
    columnHelper.accessor('estimatedHours', {
      header: 'Horas Estimadas',
      cell: info => info.getValue().toFixed(1),
    }),
    columnHelper.accessor('chargedHours', {
      header: 'Horas Cargadas',
      cell: info => info.getValue().toFixed(1),
    }),
    columnHelper.accessor('realLoadPercentage', {
      header: '% Carga Real',
      cell: info => `${info.getValue().toFixed(1)}%`,
    }),
    columnHelper.accessor('plannedLoadPercentage', {
      header: '% Carga Planificada',
      cell: info => `${info.getValue().toFixed(1)}%`,
    }),
    columnHelper.accessor('vacationDays', {
      header: 'Vacaciones',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('otherAbsences', {
      header: 'Otras Ausencias',
      cell: info => info.getValue(),
    }),
  ];
  
  interface CapacityTableProps {
    data: CapacityData[];
    className?: string;
  }
  
  export function CapacityTable({ data, className = '' }: CapacityTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
  
    const table = useReactTable({
      data,
      columns,
      state: {
        sorting,
      },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
    });
  
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Capacidad por Colaborador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }