import React from 'react';
import { Type, MousePointer2, CheckSquare, Circle, Download, Trash2, Loader2 } from 'lucide-react';
import { FieldType, FormElement } from '../types';

interface SidebarProps {
  activeTool: FieldType | 'select';
  setActiveTool: (t: FieldType | 'select') => void;
  selectedElement: FormElement | null;
  updateElement: (id: string, updates: Partial<FormElement>) => void;
  deleteElement: (id: string) => void;
  onDownload: () => void;
  isDownloading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTool,
  setActiveTool,
  selectedElement,
  updateElement,
  deleteElement,
  onDownload,
  isDownloading
}) => {
  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shadow-xl z-20">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="text-blue-600 text-2xl">❖</span> FormFlow
        </h1>
        <p className="text-xs text-slate-500 mt-1">Interactive PDF Builder</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Tools Section */}
        <section>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tools</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTool('select')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                activeTool === 'select'
                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <MousePointer2 size={20} className="mb-1" />
              <span className="text-xs font-medium">Select</span>
            </button>

            <button
              onClick={() => setActiveTool(FieldType.TEXT)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                activeTool === FieldType.TEXT
                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <Type size={20} className="mb-1" />
              <span className="text-xs font-medium">Text Field</span>
            </button>

            <button
              onClick={() => setActiveTool(FieldType.CHECKBOX)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                activeTool === FieldType.CHECKBOX
                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <CheckSquare size={20} className="mb-1" />
              <span className="text-xs font-medium">Checkbox</span>
            </button>

            <button
              onClick={() => setActiveTool(FieldType.RADIO)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                activeTool === FieldType.RADIO
                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <Circle size={20} className="mb-1" />
              <span className="text-xs font-medium">Radio</span>
            </button>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Properties Panel */}
        <section>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Properties</h3>
          {selectedElement ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Field Name</label>
                <input
                  type="text"
                  value={selectedElement.name}
                  onChange={(e) => updateElement(selectedElement.id, { name: e.target.value })}
                  className="w-full p-2 text-sm border border-slate-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="e.g. fullName"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="req-check"
                  checked={selectedElement.required}
                  onChange={(e) => updateElement(selectedElement.id, { required: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="req-check" className="text-sm text-slate-700">Required Field</label>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => deleteElement(selectedElement.id)}
                  className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-md border border-red-200 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                >
                  <Trash2 size={16} /> Delete Field
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-400 italic text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              Select a field to edit properties
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-lg flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          {isDownloading ? 'Generating...' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;