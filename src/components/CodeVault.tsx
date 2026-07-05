import React, { useState } from 'react';
import { sourceCodeFiles, CodeFile } from '../data/sourceCode';
import { Folder, FileCode, Copy, Check, Info, FileText, Download } from 'lucide-react';

export default function CodeVault({ isArabic }: { isArabic: boolean }) {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(sourceCodeFiles[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Backend' | 'Frontend' | 'Config'>('All');

  const filteredFiles = sourceCodeFiles.filter(
    (f) => activeCategory === 'All' || f.category === activeCategory
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Truncate path for visual tab
  const getDisplayPath = (path: string) => {
    const parts = path.split('/');
    if (parts.length > 3) {
      return `.../${parts.slice(-3).join('/')}`;
    }
    return path;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden" id="code-vault">
      {/* Sidebar: Files & Folders */}
      <div className="lg:col-span-4 border-r border-slate-800 bg-slate-900/60 p-4 flex flex-col gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-amber-500" />
            {isArabic ? "مستودع الأكواد والملفات" : "Native & RN Code Workspace"}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic 
              ? "مجموعة كاملة من ملفات الـ Kotlin وتكوينات المشروع الجاهزة للبناء" 
              : "Full Kotlin classes and React Native workspace components."
            }
          </p>
        </div>

        {/* Categories Tab selector */}
        <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['All', 'Backend', 'Frontend', 'Config'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isArabic 
                ? cat === 'All' ? 'الكل' : cat === 'Backend' ? 'الخلفية' : cat === 'Frontend' ? 'الواجهة' : 'الإعدادات'
                : cat
              }
            </button>
          ))}
        </div>

        {/* File Tree */}
        <div className="flex flex-col gap-1 overflow-y-auto max-h-[420px] pr-1">
          {filteredFiles.map((file) => {
            const isSelected = selectedFile.path === file.path;
            return (
              <button
                key={file.path}
                onClick={() => {
                  setSelectedFile(file);
                  setCopied(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'bg-amber-500/10 border border-amber-500/30 text-white'
                    : 'border border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-white'
                }`}
              >
                <FileCode className={`w-4.5 h-4.5 shrink-0 ${isSelected ? 'text-amber-500' : 'text-slate-500'}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-mono font-medium truncate">{file.name}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5" dir="ltr">
                    {getDisplayPath(file.path)}
                  </div>
                </div>
                <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-md font-mono ${
                  file.category === 'Backend' 
                    ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40' 
                    : file.category === 'Frontend' 
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' 
                    : 'bg-purple-950/60 text-purple-400 border border-purple-800/40'
                }`}>
                  {file.category}
                </span>
              </button>
            );
          })}
        </div>

        {/* Integration Instructions */}
        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg flex items-start gap-2.5">
          <Info className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h5 className="font-bold text-slate-300">
              {isArabic ? "مسار ملفات Android الأصلي:" : "Android Paths Standard:"}
            </h5>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              {isArabic 
                ? "يجب وضع ملفات الكوتلن داخل حزمة com.receiver.wifidirect في مشروع الأندرويد لكي يتطابق الكود وتكتمل عملية البناء بنجاح."
                : "Place Kotlin modules exactly under the package com.receiver.wifidirect inside your android folder to ensure correct resolution during APK compile."
              }
            </p>
          </div>
        </div>
      </div>

      {/* Code Editor Window */}
      <div className="lg:col-span-8 flex flex-col min-w-0">
        {/* Header toolbar */}
        <div className="bg-slate-900 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-mono text-slate-400 truncate" dir="ltr">
              {selectedFile.path}
            </div>
            <div className="text-xs text-slate-500 mt-1 leading-relaxed">
              {isArabic ? selectedFile.descriptionAr : selectedFile.descriptionEn}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">{isArabic ? "تم النسخ" : "Copied"}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-500" />
                <span>{isArabic ? "نسخ الكود" : "Copy Code"}</span>
              </>
            )}
          </button>
        </div>

        {/* Real Code Editor Body */}
        <div className="relative flex-1 bg-[#0d0e12] font-mono text-xs overflow-auto max-h-[500px]">
          <pre className="p-5 text-slate-300 leading-relaxed overflow-x-auto" dir="ltr">
            <code>{selectedFile.content}</code>
          </pre>
        </div>

        {/* Bottom Status bar */}
        <div className="bg-slate-900 border-t border-slate-800 px-5 py-2.5 flex justify-between items-center text-[11px] text-slate-500 font-mono">
          <span>Language: {selectedFile.language.toUpperCase()}</span>
          <span>Lines: {selectedFile.content.split('\n').length}</span>
        </div>
      </div>
    </div>
  );
}
