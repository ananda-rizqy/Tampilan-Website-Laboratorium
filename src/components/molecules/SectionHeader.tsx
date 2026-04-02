import React from "react";

export function SectionHeader({ title, badgeText, description, rightElement }: any) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-black text-slate-900">{title}</h1>
          <span className="bg-indigo-100 text-indigo-600 text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded">
            {badgeText}
          </span>
        </div>
        <p className="text-slate-500 text-sm">{description}</p>
      </div>
      <div>{rightElement}</div>
    </div>
  );
}