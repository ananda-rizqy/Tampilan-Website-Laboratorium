import React from "react";
import { flexRender } from "@tanstack/react-table";

export function InventoryTable({ table, loading, header }: any) {
  if (loading) return <div className="p-10 text-center font-bold">Memuat data...</div>;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
      <div className="p-6 border-b border-slate-50">
        <h3 className="font-bold text-slate-800">{header}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50">
            {table.getHeaderGroups().map((headerGroup: any) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => (
                  <th key={header.id} className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row: any) => (
              <tr key={row.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                {row.getVisibleCells().map((cell: any) => (
                  <th key={cell.id} className="p-4 text-sm text-slate-600 font-medium">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}