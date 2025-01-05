import { useEffect, useState } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { ColDef, ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { fetchCapacityData, type CapacityData } from '../../lib/supabase';

// Registra el módulo ClientSideRowModelModule
ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface CapacityGridProps {
  selectedMonth: Date;
}

export function CapacityGrid({ selectedMonth }: CapacityGridProps) {
  const [rowData, setRowData] = useState<CapacityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        console.log("🕵️‍♂️ Buscando capacidad para:", selectedMonth);
        const data = await fetchCapacityData(selectedMonth);

        console.log("📊 Datos recibidos:", data);
        setRowData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error cargando datos';
        console.error("❌ Error al obtener datos:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedMonth]);

  const columnDefs: ColDef[] = [
    { field: 'full_name', headerName: 'Colaborador', sortable: true, filter: true },
    { field: 'working_days', headerName: 'Días Laborables', sortable: true },
    { field: 'absence_days', headerName: 'Días de Ausencia', sortable: true },
    { field: 'gross_hours', headerName: 'Horas Brutas', sortable: true, valueFormatter: params => params.value ? Number(params.value).toFixed(1) : '-' },
    { field: 'available_hours', headerName: 'Horas Disponibles', sortable: true, valueFormatter: params => params.value ? Number(params.value).toFixed(1) : '-' },
    { field: 'charged_hours', headerName: 'Horas Cargadas', sortable: true, valueFormatter: params => params.value ? Number(params.value).toFixed(1) : '-' },
    { field: 'actual_load_percentage', headerName: '% Carga Real', sortable: true, valueFormatter: params => `${Number(params.value).toFixed(1)}%` },
    { field: 'planned_load_percentage', headerName: '% Carga Planificada', sortable: true, valueFormatter: params => `${Number(params.value).toFixed(1)}%` },
  ];

  if (error) {
    return <div className="text-red-500 p-4">❌ {error}</div>;
  }

  return (
    <div className="ag-theme-alpine w-full h-[600px]">
      {loading ? (
        <div className="text-gray-500 p-4">⏳ Cargando datos...</div>
      ) : (
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{
            flex: 1,
            minWidth: 100,
            resizable: true
          }}
          overlayLoadingTemplate="Cargando..."
          overlayNoRowsTemplate="No hay datos para mostrar"
        />
      )}
    </div>
  );
}
