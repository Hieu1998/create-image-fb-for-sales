import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { TemplateDefinition, TemplateId } from '../types';
import { TEMPLATES } from '../data/templates';

interface TemplateStripSelectorProps {
  selectedTemplateId: TemplateId;
  onSelectTemplate: (template: TemplateDefinition) => void;
}

export const TemplateStripSelector: React.FC<TemplateStripSelectorProps> = ({
  selectedTemplateId,
  onSelectTemplate,
}) => {
  return (
    <div className="w-full max-w-xl space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span className="font-semibold flex items-center gap-1.5 text-white">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Đổi Khung Mẫu Ngay:</span>
        </span>
        <span className="text-[11px] text-slate-400 shrink-0">10 Mẫu Hiện Đại</span>
      </div>

      {/* Horizontal Scrollable Strip of Templates */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory">
        {TEMPLATES.map((template) => {
          const isSelected = template.id === selectedTemplateId;
          return (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className={`group flex-shrink-0 snap-start text-left p-2.5 rounded-xl border transition-all relative flex flex-col justify-between w-32 sm:w-36 ${
                isSelected
                  ? 'border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/10 ring-1 ring-amber-400'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {/* Mini visual mockup box */}
              <div
                className="w-full h-14 rounded-lg overflow-hidden relative flex flex-col justify-between p-1.5 mb-2 border border-white/10"
                style={{ backgroundColor: template.bgColor }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: template.primaryColor }}
                  />
                  <div className="h-1 w-8 bg-white/20 rounded" />
                </div>

                <div className="flex items-center justify-center gap-1 h-5 my-auto">
                  <div className="flex-1 h-full bg-slate-800/90 rounded flex items-center justify-center text-[7px] text-slate-400 font-bold">
                    T
                  </div>
                  <div
                    className="w-0.5 h-full"
                    style={{ backgroundColor: template.primaryColor }}
                  />
                  <div className="flex-1 h-full bg-slate-700/90 rounded flex items-center justify-center text-[7px] text-amber-200 font-bold">
                    S
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="h-1 w-10 bg-white/20 rounded" />
                  <div
                    className="h-1.5 w-4 rounded-full"
                    style={{ backgroundColor: template.primaryColor }}
                  />
                </div>
              </div>

              {/* Template title & checkmark */}
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`text-[11px] font-bold truncate block ${
                    isSelected ? 'text-amber-300' : 'text-slate-200 group-hover:text-white'
                  }`}
                >
                  {template.name}
                </span>
                {isSelected && (
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[8px] font-black shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-1">
                <span style={{ color: template.primaryColor }}>●</span>
                <span className="truncate">{template.category}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
