import React from "react";

interface InventoryTemplateProps {
  header: React.ReactNode;
  form?: React.ReactNode;
  table: React.ReactNode;
}

export const InventoryTemplate: React.FC<InventoryTemplateProps> = ({ header, form, table }) => {
  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>{header}</header>
        {form && <section className="animate-in fade-in slide-in-from-top-4">{form}</section>}
        <main className="pb-20">{table}</main>
      </div>
    </div>
  );
};