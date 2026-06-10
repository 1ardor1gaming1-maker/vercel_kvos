import React, { useState } from "react";
import { SOURCE_FILES, SourceFile } from "../data/sources";
import { Copy, Check, FileCode, Cpu, ChevronRight, HelpCircle, HardDrive, Terminal } from "lucide-react";
import { translations, Language } from "../utils/translations";

export default function CodeExplorer({ language }: { language: Language }) {
  const [selectedFile, setSelectedFile] = useState<SourceFile>(SOURCE_FILES[1]); // kernel.asm by default
  const [copied, setCopied] = useState<string | null>(null);

  const t = translations[language];

  const handleCopy = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  const getFileDesc = () => {
    if (selectedFile.name === "boot.asm") {
      return language === "ru" ? "Сектор MBR начальной загрузки Stage 1. Настройка видеорежима 3, включение страничной адресации и переход в 64-битный Long Mode." :
             language === "zh" ? "第一阶段 MBR 启动区。设置视频Mode 3，映射页表，开启PAE，跳转到64位长模式。" :
             language === "de" ? "Stage 1 Bootstrap MBR Sektor. Setzt Videomodus 3, aktiviert Paging und springt in den 64-Bit Long Mode." :
             language === "uk" ? "Сектор MBR початкового завантаження Stage 1. Налаштування відеорежиму 3, увімкнення сторінкової адресації та перехід у 64-бітовий Long Mode." :
             selectedFile.description;
    } else {
      return language === "ru" ? "Основное ядро Stage 2 во влажном режиме x86_64 Long Mode. Осуществляет проверки процессора, опрос скан-кодов клавиатуры, математические векторы и матричные структуры." :
             language === "zh" ? "第二阶段 x86_64 长模式系统主内核。负责校验CPU特性，轮询键盘扫描码硬件端口，以及核心算法和数字矩阵瀑布流交互。" :
             language === "de" ? "Stage 2 Kernel im x86_64 Long Mode. Beinhaltet CPU-Prüfungen, Tastatur-Scancode-Mapping, Rechenoperationen und Matrix-Animationen." :
             language === "uk" ? "Основне ядро Stage 2 у режимі x86_64 Long Mode. Здійснює перевірки процесора, опитування скан-кодів клавіатури, математичні вектори та матричні структури." :
             selectedFile.description;
    }
  };

  // Basic custom syntax highlighting for primitive assembly commands
  const highlightAsm = (code: string) => {
    const lines = code.split("\n");
    return lines.map((line, idx) => {
      // Find comment section
      const commentIndex = line.indexOf(";");
      let mainText = commentIndex !== -1 ? line.substring(0, commentIndex) : line;
      const commentText = commentIndex !== -1 ? line.substring(commentIndex) : "";

      // Replace common ASM keywords with colored classes
      const keywords = ["mov", "jmp", "cli", "sti", "int", "hlt", "rep", "stosd", "stosb", "bts", "rdmsr", "wrmsr", "lgdt", "in", "out", "cmp", "je", "jne", "jg", "jl", "jc", "jnz", "jz", "imul", "add", "sub", "div", "xor", "shl", "shr", "lodsb", "push", "pop", "ret", "stc", "clc", "loop", "call", "test"];
      const registers = ["rax", "rbx", "rcx", "rdx", "rsi", "rdi", "rsp", "rbp", "eax", "ebx", "ecx", "edx", "esi", "edi", "cr0", "cr3", "cr4", "ax", "bx", "cx", "dx", "di", "si", "sp", "al", "bl", "cl", "dl", "ah", "bh", "ch", "dh", "ds", "es", "fs", "gs", "ss"];
      const types = ["db", "dw", "dd", "dq", "times", "align"];

      // Escape HTML chars
      let html = mainText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // Highlight types
      types.forEach(type => {
        const regex = new RegExp(`\\b${type}\\b`, 'g');
        html = html.replace(regex, `<span class="text-amber-400 font-semibold">${type}</span>`);
      });

      // Highlight keywords
      keywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'g');
        html = html.replace(regex, `<span class="text-emerald-400 font-medium">${kw}</span>`);
      });

      // Highlight registers
      registers.forEach(reg => {
        const regex = new RegExp(`\\b${reg}\\b`, 'g');
        html = html.replace(regex, `<span class="text-blue-400">${reg}</span>`);
      });

      // Highlight hex values and labels
      html = html.replace(/\b(0x[0-9a-fA-F]+)\b/g, '<span class="text-pink-400">$1</span>');
      html = html.replace(/^([a-zA-Z0-9_\.]+):/g, '<span class="text-yellow-400 font-semibold">$1:</span>');

      return (
        <div key={idx} className="table-row group hover:bg-slate-900/40 text-[12.5px] font-mono leading-relaxed" id={`asm-line-${idx}`}>
          <span className="table-cell select-none text-right text-slate-600/80 pr-4 pl-2 border-r border-slate-900 bg-slate-950/20 w-10">{idx + 1}</span>
          <span className="table-cell pl-4 pr-2 whitespace-pre-wrap">
            <span dangerouslySetInnerHTML={{ __html: html }} />
            {commentText && <span className="text-slate-500 font-light italic">{commentText}</span>}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side File Tabs */}
        <div className="lg:col-span-1 space-y-2.5">
          <div className="text-xs uppercase font-mono text-slate-400 tracking-wider mb-2 font-bold flex items-center gap-1.5 px-1">
            <FileCode className="w-4 h-4 text-indigo-400" />
            {t.code_asm_trees}
          </div>

          <div className="space-y-1.5" id="asm-file-tabs">
            {SOURCE_FILES.map((file) => {
              const active = file.name === selectedFile.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-mono flex items-center justify-between cursor-pointer ${
                    active
                      ? "btn-primary-gradient border-transparent text-white shadow-lg shadow-indigo-500/20"
                      : "glass border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                  id={`tab-${file.name.replace(".", "-")}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${active ? "bg-black/20 text-white" : "bg-white/5 text-slate-550"}`}>
                      <Terminal className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block font-medium">{file.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">{file.path}</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${active ? "text-white" : "text-slate-500"}`} />
                </button>
              );
            })}
          </div>

          {/* Quick Technical Specs Info Board */}
          <div className="glass p-4 rounded-2xl space-y-3.5 border border-white/5">
            <div className="text-[11px] uppercase font-mono text-slate-300 tracking-widest font-bold border-b border-white/5 pb-1.5">
              {t.code_specs_title}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <span className="text-slate-400">{t.code_specs_arch_lbl}</span>
              <span className="text-slate-200 text-right">{t.code_specs_arch_val}</span>
              <span className="text-slate-400">{t.code_specs_mode_lbl}</span>
              <span className="text-slate-200 text-right">{t.code_specs_mode_val}</span>
              <span className="text-slate-400">{t.code_specs_addr_lbl}</span>
              <span className="text-slate-200 text-right">{t.code_specs_addr_val}</span>
              <span className="text-slate-400">{t.code_specs_bios_lbl}</span>
              <span className="text-slate-200 text-right">0x7C00</span>
              <span className="text-slate-400">{t.code_specs_kernel_lbl}</span>
              <span className="text-slate-150 text-right font-medium text-indigo-300 font-bold">0x7E00</span>
            </div>
            
            <div className="text-[10px] leading-relaxed text-slate-400 border-t border-white/5 pt-3">
              <Cpu className="w-3.5 h-3.5 text-indigo-400 inline mr-1" />
              {t.code_specs_desc}
            </div>
          </div>
        </div>

        {/* Right Side Code View Panel */}
        <div className="lg:col-span-3 flex flex-col glass rounded-2xl overflow-hidden shadow-2xl border border-white/5 backdrop-blur-md" id="code-viewer-panel">
          
          {/* Header toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></div>
              <span className="text-xs font-mono text-slate-200 font-semibold">{selectedFile.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5 uppercase font-mono">
                {selectedFile.language}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline border-r border-white/5 pr-2 mr-1">
                {t.code_lines_chars
                  .replace("{lines}", selectedFile.content.split("\n").length.toString())
                  .replace("{chars}", selectedFile.content.length.toString())}
              </span>
              <button
                onClick={() => handleCopy(selectedFile.content, selectedFile.name)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-slate-100 transition flex items-center gap-1 cursor-pointer text-xs font-mono border border-transparent hover:border-white/5"
                title={t.code_copy_title}
                id="copy-code-btn"
              >
                {copied === selectedFile.name ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-emerald-500 font-semibold text-[10px]">{t.code_copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium">{language === "ru" ? "КОПИРОВАТЬ" : "COPY"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Description banner */}
          <div className="px-4 py-3 bg-slate-900/30 border-b border-slate-900 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-500/80 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              <span className="font-bold text-slate-300 font-mono">{selectedFile.name}</span>: {getFileDesc()}
            </p>
          </div>

          {/* Code Box */}
          <div className="flex-1 overflow-auto max-h-[500px] md:max-h-[580px] custom-scrollbar bg-[#030608]/90">
            <div className="table w-full select-text py-4">
              {highlightAsm(selectedFile.content)}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
