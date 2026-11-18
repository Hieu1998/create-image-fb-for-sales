import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { TemplateDefinition, TemplateId } from '../types';
import { TEMPLATES } from '../data/templates';
import { isMinimalOnlyTemplate } from '../utils/templateHelpers';

interface TemplateStripSelectorProps {
  selectedTemplateId: TemplateId;
  onSelectTemplate: (template: TemplateDefinition) => void;
}

export const TemplateStripSelector: React.FC<TemplateStripSelectorProps> = ({
  selectedTemplateId,
  onSelectTemplate,
}) => {
  const renderMiniMockup = (template: TemplateDefinition) => {
    const id = template.id;

    if (id === 'minimal_luxe_gold') {
      return (
        <div
          className="w-full h-14 rounded-lg overflow-hidden relative flex flex-col justify-between p-1.5 mb-2 border border-amber-400/70"
          style={{ backgroundColor: template.bgColor }}
        >
          <div className="flex-1 flex items-center gap-1 border border-amber-300/30 p-0.5 rounded-sm">
            <div className="flex-1 h-full bg-slate-800/90 flex items-center justify-center text-[7px] text-amber-200/80 font-bold">
              T
            </div>
            <div className="w-[1.5px] h-full bg-amber-400/80" />
            <div className="flex-1 h-full bg-slate-700/90 flex items-center justify-center text-[7px] text-amber-200 font-bold">
              S
            </div>
          </div>
          <div className="flex items-center justify-center pt-1">
            <div className="h-2 w-14 rounded-sm border border-amber-400 bg-amber-500/20" />
          </div>
        </div>
      );
    }

    if (id === 'minimal_silk_ivory') {
      return (
        <div
          className="w-full h-14 rounded-lg overflow-hidden relative flex flex-col justify-between p-1.5 mb-2 border border-rose-200/60"
          style={{ backgroundColor: template.bgColor }}
        >
          <div className="flex-1 flex items-center gap-1.5">
            <div className="flex-1 h-full bg-[#DED5CB] rounded flex items-center justify-center text-[7px] text-stone-700 font-bold">
              T
            </div>
            <div className="flex-1 h-full bg-[#D1B8B8] rounded flex items-center justify-center text-[7px] text-stone-800 font-bold">
              S
            </div>
          </div>
          <div className="flex items-center justify-center pt-1">
            <div className="h-2 w-14 rounded-full bg-[#1E181A] border border-rose-300/60" />
          </div>
        </div>
      );
    }

    if (id === 'minimal_diagonal_prism') {
      return (
        <div
          className="w-full h-14 rounded-lg overflow-hidden relative mb-2 border border-white/15"
          style={{ backgroundColor: template.bgColor }}
        >
          <div className="absolute inset-0 flex">
            <div className="w-1/2 h-full bg-slate-800/90 flex items-center justify-center pr-2 text-[7px] text-slate-300 font-bold">
              T
            </div>
            <div className="w-1/2 h-full bg-slate-700/90 flex items-center justify-center pl-2 text-[7px] text-pink-200 font-bold">
              S
            </div>
          </div>
          {/* Diagonal Prism Line */}
          <div
            className="absolute inset-y-[-4px] left-1/2 w-[2px] -translate-x-1/2 rotate-12 bg-gradient-to-b from-white via-pink-400 to-violet-400 shadow"
          />
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-2.5 w-14 rounded-full bg-slate-950/85 border border-pink-300/70" />
        </div>
      );
    }

    if (id === 'minimal_arch_editorial') {
      return (
        <div
          className="w-full h-14 rounded-lg overflow-hidden relative flex flex-col justify-between p-1.5 mb-2 border border-amber-500/40"
          style={{ backgroundColor: template.bgColor }}
        >
          <div className="flex-1 flex items-end gap-1.5 px-1">
            <div className="flex-1 h-full bg-emerald-950/90 rounded-t-full border border-amber-500/40 flex items-center justify-center text-[7px] text-amber-200/70 font-bold">
              T
            </div>
            <div className="flex-1 h-full bg-emerald-900/90 rounded-t-full border border-amber-400 flex items-center justify-center text-[7px] text-amber-200 font-bold">
              S
            </div>
          </div>
          <div className="flex items-center justify-center pt-1">
            <div className="h-2 w-14 rounded-full bg-gradient-to-r from-[#C89D66] to-[#F3DFC1]" />
          </div>
        </div>
      );
    }

    if (id === 'minimal_consult') {
      return (
        <div
          className="w-full h-14 rounded-lg overflow-hidden relative flex flex-col justify-between p-1.5 mb-2 border border-white/10"
          style={{ backgroundColor: template.bgColor }}
        >
          <div className="flex items-center justify-center gap-1 h-8 my-auto">
            <div className="flex-1 h-full bg-slate-800/90 rounded flex items-center justify-center text-[7px] text-slate-400 font-bold">
              T
            </div>
            <div className="w-0.5 h-full" style={{ backgroundColor: template.primaryColor }} />
            <div className="flex-1 h-full bg-slate-700/90 rounded flex items-center justify-center text-[7px] text-amber-200 font-bold">
              S
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="h-2 w-12 rounded-full bg-rose-500" />
          </div>
        </div>
      );
    }

    if (id === 'diagonal_split') {
      return (
        <div
          className="w-full h-14 rounded-lg overflow-hidden relative flex flex-col justify-between p-1.5 mb-2 border border-white/10"
          style={{ backgroundColor: template.bgColor }}
        >
          <div className="flex items-center justify-between">
            <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            <div className="h-1 w-8 bg-white/20 rounded" />
          </div>
          <div className="relative h-5 flex items-center justify-center gap-1 my-auto overflow-hidden rounded">
            <div className="flex-1 h-full bg-slate-800/90 flex items-center justify-center text-[7px] text-slate-300 font-bold">
              T
            </div>
            <div className="w-0.5 h-7 rotate-12 bg-gradient-to-b from-pink-500 to-violet-500" />
            <div className="flex-1 h-full bg-slate-700/90 flex items-center justify-center text-[7px] text-pink-200 font-bold">
              S
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-1 w-10 bg-white/20 rounded" />
            <div className="h-1.5 w-4 rounded-full bg-pink-500" />
          </div>
        </div>
      );
    }

    // Default: luxury_gold
    return (
      <div
        className="w-full h-14 rounded-lg overflow-hidden relative flex flex-col justify-between p-1.5 mb-2 border border-white/10"
        style={{ backgroundColor: template.bgColor }}
      >
        <div className="flex items-center justify-between">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: template.primaryColor }} />
          <div className="h-1 w-8 bg-white/20 rounded" />
        </div>
        <div className="flex items-center justify-center gap-1 my-auto h-5">
          <div className="flex-1 h-full bg-slate-800/90 rounded flex items-center justify-center text-[7px] text-slate-400 font-bold">
            T
          </div>
          <div className="w-0.5 h-full" style={{ backgroundColor: template.primaryColor }} />
          <div className="flex-1 h-full bg-slate-700/90 rounded flex items-center justify-center text-[7px] text-amber-200 font-bold">
            S
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-1 w-10 bg-white/20 rounded" />
          <div className="h-1.5 w-4 rounded-full" style={{ backgroundColor: template.primaryColor }} />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-xl space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span className="font-semibold flex items-center gap-1.5 text-white">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Đổi Khung Mẫu Ngay:</span>
        </span>
        <span className="text-[11px] text-slate-400 shrink-0">{TEMPLATES.length} Mẫu Thiết Kế</span>
      </div>

      {/* Horizontal Scrollable Strip of Templates */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory">
        {TEMPLATES.map((template) => {
          const isSelected = template.id === selectedTemplateId;
          const isMinimal = isMinimalOnlyTemplate(template.id);
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelectTemplate(template)}
              className={`group flex-shrink-0 snap-start text-left p-2.5 rounded-xl border transition-all relative flex flex-col justify-between w-36 sm:w-40 ${
                isSelected
                  ? 'border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/10 ring-1 ring-amber-400'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {renderMiniMockup(template)}

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

              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 whitespace-nowrap truncate">
                <span style={{ color: template.primaryColor }}>●</span>
                <span className="truncate">
                  {template.category} · {isMinimal ? 'Ảnh + Zalo' : 'Đầy đủ'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
