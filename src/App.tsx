import React, { useState } from "react";
import Terminal from "./components/Terminal";
import CodeExplorer from "./components/CodeExplorer";
import Flasher from "./components/Flasher";
import Memorial from "./components/Memorial";
import { translations, Language } from "./utils/translations";
import { 
  Terminal as TerminalIcon, 
  Cpu, 
  FileCode, 
  Layers, 
  Wrench, 
  Heart, 
  BookOpen, 
  ArrowUpRight, 
  ExternalLink,
  Github,
  Calendar,
  Copy,
  Check,
  Zap,
  HardDrive,
  Palette
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"terminal" | "code" | "builder" | "docs" | "memorial">("terminal");
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("ru"); // Russian as default per owner origin, easy to toggle!
  const [themeMode, setThemeMode] = useState<"indigo" | "matrix" | "amber" | "glacier" | "classic">("indigo");

  const getThemeStyles = () => {
    switch (themeMode) {
      case "matrix":
        return `
          :root {
            --color-primary-base: #22c55e;
            --color-primary-glow: rgba(34, 197, 94, 0.4);
            --color-accent: #10b981;
          }
          .mesh-bg {
            background: radial-gradient(circle at 20% 30%, #03200c 0%, transparent 40%), radial-gradient(circle at 80% 70%, #08140a 0%, transparent 40%), radial-gradient(circle at 50% 50%, #010402 0%, #010402 100%) !important;
          }
          .btn-primary-gradient {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.3) !important;
            color: #000 !important;
          }
          .text-indigo-400, .text-indigo-300, .text-indigo-350, .text-indigo-600 {
            color: #10b981 !important;
          }
          .border-indigo-500\\/15, .border-indigo-500\\/20, .border-indigo-500\\/10 {
            border-color: rgba(16, 185, 129, 0.25) !important;
          }
          .bg-indigo-500\\/10, .bg-indigo-400\\/10 {
            background-color: rgba(16, 185, 129, 0.1) !important;
            color: #10b981 !important;
          }
          .bg-indigo-650 {
            background-color: #059669 !important;
          }
          .text-emerald-400, .text-emerald-500 {
            color: #22c55e !important;
          }
        `;
      case "amber":
        return `
          :root {
            --color-primary-base: #f59e0b;
            --color-primary-glow: rgba(245, 158, 11, 0.4);
            --color-accent: #f59e0b;
          }
          .mesh-bg {
            background: radial-gradient(circle at 20% 30%, #2d1904 0%, transparent 40%), radial-gradient(circle at 80% 70%, #170f03 0%, transparent 40%), radial-gradient(circle at 50% 50%, #050301 0%, #050301 100%) !important;
          }
          .btn-primary-gradient {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.3) !important;
            color: #000 !important;
          }
          .text-indigo-400, .text-indigo-300, .text-indigo-350, .text-indigo-600 {
            color: #f59e0b !important;
          }
          .border-indigo-500\\/15, .border-indigo-500\\/20, .border-indigo-500\\/10 {
            border-color: rgba(245, 158, 11, 0.25) !important;
          }
          .bg-indigo-500\\/10, .bg-indigo-400\\/10 {
            background-color: rgba(245, 158, 11, 0.1) !important;
            color: #f59e0b !important;
          }
          .bg-indigo-650 {
            background-color: #d97706 !important;
          }
          .text-emerald-400, .text-emerald-500 {
            color: #f59e0b !important;
          }
          .scanline {
            background: linear-gradient(
              to bottom,
              rgba(255,255,255,0),
              rgba(245, 158, 11, 0.08) 10%,
              rgba(245, 158, 11, 0.15) 30%,
              rgba(245, 158, 11, 0.08) 50%,
              rgba(255,255,255,0)
            ) !important;
          }
        `;
      case "glacier":
        return `
          :root {
            --color-primary-base: #06b6d4;
            --color-primary-glow: rgba(6, 182, 212, 0.4);
            --color-accent: #06b6d4;
          }
          .mesh-bg {
            background: radial-gradient(circle at 20% 30%, #083344 0%, transparent 40%), radial-gradient(circle at 80% 70%, #0f172a 0%, transparent 40%), radial-gradient(circle at 50% 50%, #020617 0%, #020617 100%) !important;
          }
          .btn-primary-gradient {
            background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%) !important;
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.3) !important;
            color: #000 !important;
          }
          .text-indigo-400, .text-indigo-300, .text-indigo-350, .text-indigo-600 {
            color: #22d3ee !important;
          }
          .border-indigo-500\\/15, .border-indigo-500\\/20, .border-indigo-500\\/10 {
            border-color: rgba(6, 182, 212, 0.25) !important;
          }
          .bg-indigo-500\\/10, .bg-indigo-400\\/10 {
            background-color: rgba(6, 182, 212, 0.1) !important;
            color: #22d3ee !important;
          }
          .bg-indigo-650 {
            background-color: #0891b2 !important;
          }
          .text-emerald-400, .text-emerald-500 {
            color: #06b6d4 !important;
          }
          .scanline {
            background: linear-gradient(
              to bottom,
              rgba(255,255,255,0),
              rgba(6, 182, 212, 0.08) 10%,
              rgba(6, 182, 212, 0.15) 30%,
              rgba(6, 182, 212, 0.08) 50%,
              rgba(255,255,255,0)
            ) !important;
          }
        `;
      case "classic":
        return `
          :root {
            --color-primary-base: #cbd5e1;
            --color-primary-glow: rgba(203, 213, 225, 0.3);
            --color-accent: #ffffff;
          }
          .mesh-bg {
            background: radial-gradient(circle at 20% 30%, #1e293b 0%, transparent 40%), radial-gradient(circle at 80% 70%, #0f172a 0%, transparent 40%), radial-gradient(circle at 50% 50%, #030712 0%, #030712 100%) !important;
          }
          .btn-primary-gradient {
            background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%) !important;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.15) !important;
            color: #0f172a !important;
          }
          .text-indigo-400, .text-indigo-300, .text-indigo-350, .text-indigo-600 {
            color: #cbd5e1 !important;
          }
          .border-indigo-500\\/15, .border-indigo-500\\/20, .border-indigo-500\\/10 {
            border-color: rgba(255, 255, 255, 0.15) !important;
          }
          .bg-indigo-500\\/10, .bg-indigo-400\\/10 {
            background-color: rgba(255, 255, 255, 0.05) !important;
            color: #f8fafc !important;
          }
          .bg-indigo-650 {
            background-color: #475569 !important;
          }
          .text-emerald-400, .text-emerald-500 {
            color: #e2e8f0 !important;
          }
          .scanline {
            background: linear-gradient(
              to bottom,
              rgba(255,255,255,0),
              rgba(255, 255, 255, 0.08) 10%,
              rgba(255, 255, 255, 0.15) 30%,
              rgba(255, 255, 255, 0.08) 50%,
              rgba(255, 255, 255, 0)
            ) !important;
          }
        `;
      default: // indigo
        return "";
    }
  };

  const t = translations[language];

  const copyScript = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const winScriptText = `@echo off
echo ========================================================
echo       KV/OS v0.11.1 - NASM Windows Assembler Script
echo ========================================================
nasm -f bin boot.asm -o boot.bin
nasm -f bin kernel.asm -o kernel.bin
copy /b boot.bin + kernel.bin kvos_v0.11.1.img
echo Verification complete.
dir kvos_v0.11.1.img
echo Launching in qemu...
qemu-system-x86_64 -drive format=raw,file=kvos_v0.11.1.img
pause`;

  const unixScriptText = `#!/bin/bash
# ========================================================
#       KV/OS v0.11.1 - NASM Linux/macOS Assembler Script
# ========================================================
echo "Assembling Bootloader Stage 1..."
nasm -f bin boot.asm -o boot.bin

echo "Assembling Kernel long-tables Stage 2..."
nasm -f bin kernel.asm -o kernel.bin

echo "Combining structures into raw Floppy format..."
cat boot.bin kernel.bin > kvos_v0.11.1.img

echo "Disk payload statistics:"
ls -lh kvos_v0.11.1.img

echo "Launching virtual QEMU client container..."
qemu-system-x86_64 -drive format=raw,file=kvos_v0.11.1.img`;

  const powershellScriptText = `# cd to workspace directory e.g. C:\\kv_os v. 0.11.1
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
./build.ps1`;

  const languages: { key: Language; label: string; flag: string }[] = [
    { key: "ru", label: "Русский", flag: "🇷🇺" },
    { key: "en", label: "English", flag: "🇺🇸" },
    { key: "zh", label: "中文", flag: "🇨🇳" },
    { key: "de", label: "Deutsch", flag: "🇩🇪" },
    { key: "uk", label: "Українська", flag: "🇺🇦" },
  ];

  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-500/20 selection:text-indigo-300 relative overflow-x-hidden">
      
      {/* Frosted Glass Mesh Background */}
      <div className="mesh-bg" />
      <style dangerouslySetInnerHTML={{ __html: getThemeStyles() }} />

      {/* Dynamic scanline overlay behind whole landing page */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,58,237,0.03),rgba(0,0,0,0))]" />

      {/* Decorative Grid Background for modern alignment design */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative border-b border-white/5 bg-slate-950/20 backdrop-blur-md" id="page-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center shadow-lg shadow-indigo-500/5 bg-white/5">
              <Cpu className="w-5.5 h-5.5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono font-bold tracking-tight text-white">{t.header_title}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/15">{t.header_badge}</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest font-bold">{t.header_subtitle}</p>
            </div>
          </div>

          {/* Social and Language selection row */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Elegant pill selectors for switching site language */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 shadow-inner" id="language-pill-picker">
              {languages.map((lang) => (
                <button
                  key={lang.key}
                  onClick={() => setLanguage(lang.key)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition flex items-center gap-1 cursor-pointer select-none ${
                    language === lang.key
                      ? "bg-indigo-650 text-white shadow"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                  title={`Switch language tab to ${lang.label}`}
                >
                  <span>{lang.flag}</span>
                  <span className="hidden xs:inline">{lang.label.toUpperCase().substring(0, 2)}</span>
                </button>
              ))}
            </div>

            {/* Theme switcher */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 shadow-inner" id="theme-pill-picker">
              <span className="pl-1.5 pr-0.5 text-slate-500">
                <Palette className="w-3.5 h-3.5" />
              </span>
              {([
                { key: "indigo", color: "bg-indigo-500", name: language === "ru" ? "Инд" : "Ind" },
                { key: "matrix", color: "bg-emerald-500", name: language === "ru" ? "Матр" : "Matr" },
                { key: "amber", color: "bg-amber-500", name: language === "ru" ? "Янт" : "Amb" },
                { key: "glacier", color: "bg-cyan-400", name: language === "ru" ? "Лед" : "Glac" },
                { key: "classic", color: "bg-slate-300", name: language === "ru" ? "Класс" : "Clas" }
              ] as const).map((theme) => (
                <button
                  key={theme.key}
                  onClick={() => setThemeMode(theme.key)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer select-none ${
                    themeMode === theme.key
                      ? "bg-indigo-650 text-white shadow"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                  title={`Switch theme style to ${theme.key}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${theme.color}`} />
                  <span className="hidden xs:inline">{theme.name}</span>
                </button>
              ))}
            </div>

            <a 
              href="https://github.com/KV-RaMIS" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl glass border border-white/5 hover:bg-white/5 text-slate-300 hover:text-white transition text-xs font-mono flex items-center gap-1.5 cursor-pointer"
              id="github-link"
            >
              <Github className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.header_repos}</span>
              <ArrowUpRight className="w-3 h-3 text-slate-500" />
            </a>

            <div className="text-[11px] font-mono py-1.5 px-2.5 bg-white/3 rounded-xl border border-white/5 hidden lg:flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.header_release}</span>
            </div>
          </div>

        </div>
      </header>

      {/* Hero Header Presentation */}
      <section className="relative pt-12 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" id="hero-intro">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-5xl font-mono font-bold tracking-tight text-white leading-tight">
            {language === "ru" ? (
              <>Кастомная <span className="bg-gradient-to-r from-indigo-300 to-purple-400 bg-clip-text text-transparent">64-битная Long Mode</span> ОС</>
            ) : language === "zh" ? (
              <>定制型 <span className="bg-gradient-to-r from-indigo-300 to-purple-400 bg-clip-text text-transparent">64 位长模式</span> 操作系统</>
            ) : language === "de" ? (
              <>Das benutzerdefinierte <span className="bg-gradient-to-r from-indigo-300 to-purple-400 bg-clip-text text-transparent">64-Bit-Long-Mode</span> OS</>
            ) : language === "uk" ? (
              <>Кастомна <span className="bg-gradient-to-r from-indigo-300 to-purple-400 bg-clip-text text-transparent">64-бітна Long Mode</span> ОС</>
            ) : (
              <>The Custom <span className="bg-gradient-to-r from-indigo-300 to-purple-400 bg-clip-text text-transparent">64-bit Long Mode</span> OS</>
            )}
          </h1>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto font-sans">
            {t.hero_subtitle}
          </p>
        </div>
      </section>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-10" id="main-content">
        
        {/* Responsive Dashboard Tabs */}
        <div className="flex items-center justify-center" id="nav-tabs-wrapper">
          <div className="inline-flex flex-wrap p-1 rounded-2xl glass border-white/5 bg-[#0b0c14]/40 backdrop-blur-md p-1.5 gap-1 shadow-inner justify-center" id="nav-tabs-list">
            
            <button
              onClick={() => setActiveTab("terminal")}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer select-none ${
                activeTab === "terminal"
                  ? "btn-primary-gradient text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
              id="tab-btn-terminal"
            >
              <TerminalIcon className="w-3.5 h-3.5 animate-pulse" />
              {t.tab_terminal}
            </button>

            <button
              onClick={() => setActiveTab("code")}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer select-none ${
                activeTab === "code"
                  ? "btn-primary-gradient text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
              id="tab-btn-code"
            >
              <FileCode className="w-3.5 h-3.5" />
              {t.tab_code}
            </button>

            <button
              onClick={() => setActiveTab("builder")}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer select-none ${
                activeTab === "builder"
                  ? "btn-primary-gradient text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
              id="tab-btn-builder"
            >
              <HardDrive className="w-3.5 h-3.5" />
              {t.tab_builder}
            </button>

            <button
              onClick={() => setActiveTab("docs")}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer select-none ${
                activeTab === "docs"
                  ? "btn-primary-gradient text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
              id="tab-btn-docs"
            >
              <Wrench className="w-3.5 h-3.5" />
              {t.tab_docs}
            </button>

            <button
              onClick={() => setActiveTab("memorial")}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer select-none ${
                activeTab === "memorial"
                  ? "bg-rose-500/20 text-rose-300 shadow shadow-rose-500/10 border border-rose-500/15"
                  : "text-rose-450 hover:text-rose-300 hover:bg-rose-500/5"
              }`}
              id="tab-btn-memorial"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-rose-550 animate-pulse" />
              {t.tab_memorial}
            </button>

          </div>
        </div>

        {/* Tab content panel Display */}
        <div className="relative" id="tab-content-panel">
          
          {activeTab === "terminal" && (
            <div className="space-y-6">
              <Terminal language={language} setLanguage={setLanguage} />
              
              {/* Quick instructions list detailing shell tools */}
              <div className="max-w-4xl mx-auto glass border border-white/5 rounded-2xl p-5 backdrop-blur-md" id="terminal-instructions">
                <h4 className="text-xs font-mono font-bold text-slate-200 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  {t.terminal_guide_title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t.terminal_guide_desc}
                </p>
              </div>
            </div>
          )}

          {activeTab === "code" && (
            <CodeExplorer language={language} />
          )}

          {activeTab === "builder" && (
            <Flasher language={language} />
          )}

          {activeTab === "docs" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="compiling-specifications">
              
              {/* Left Column compile instructions & VMware host script */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Linux/Unix QEMU code box */}
                <div className="glass rounded-3xl p-6 space-y-6 border border-white/5 backdrop-blur-md">
                  <div className="space-y-2">
                    <h3 className="text-lg font-mono font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-400" />
                      {t.docs_title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      {t.docs_desc}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="text-xs uppercase font-mono text-slate-350 tracking-wider font-bold">
                      {t.docs_linux_title}
                    </div>

                    <div className="relative">
                      <pre className="bg-[#000]/50 border border-white/5 p-4 rounded-xl text-xs leading-relaxed overflow-x-auto text-indigo-300 font-mono font-semibold select-text custom-scrollbar">
{`# 1. Compile primary Boot sector stage (loads kernel)
nasm -f bin boot.asm -o boot.bin

# 2. Compile Stage 2 Kernel in Long Mode (x86_64 core logic)
nasm -f bin kernel.asm -o kernel.bin

# 3. Concatenate binaries into a raw playable virtual drive image
cat boot.bin kernel.bin > kvos_v0.11.1.img

# 4. Fire the image up in any hardware virtualization hypervisor (e.g. QEMU)
qemu-system-x86_64 -drive format=raw,file=kvos_v0.11.1.img`}
                      </pre>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    
                    {/* Windows bat block */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-t-2xl border-b border-white/5">
                        <span className="text-[10px] font-mono text-slate-350">{t.docs_win_script}</span>
                        <button
                          onClick={() => copyScript(winScriptText, "win")}
                          className="text-[10px] uppercase font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer select-none"
                          id="copy-win-bat"
                        >
                          {copiedScript === "win" ? (
                            <>
                              <Check className="w-3 h-3 text-indigo-400" />
                              <span className="text-indigo-400 font-semibold">COPIED</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>COPY</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="bg-black/40 p-3 rounded-b-2xl text-[10px] text-slate-400 font-mono border border-white/5 border-t-0 overflow-x-auto select-text custom-scrollbar">
{winScriptText}
                      </pre>
                    </div>

                    {/* Linux sh block */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-t-2xl border-b border-white/5">
                        <span className="text-[10px] font-mono text-slate-350">{t.docs_linux_script}</span>
                        <button
                          onClick={() => copyScript(unixScriptText, "unix")}
                          className="text-[10px] uppercase font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer select-none"
                          id="copy-linux-sh"
                        >
                          {copiedScript === "unix" ? (
                            <>
                              <Check className="w-3 h-3 text-indigo-400" />
                              <span className="text-indigo-400 font-semibold">COPIED</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>COPY</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="bg-black/40 p-3 rounded-b-2xl text-[10px] text-slate-400 font-mono border border-white/5 border-t-0 overflow-x-auto select-text custom-scrollbar">
{unixScriptText}
                      </pre>
                    </div>

                  </div>
                </div>

                {/* VMWare 26H1 setup guide requested by User */}
                <div className="glass rounded-3xl p-6 space-y-4 border border-white/5 backdrop-blur-md">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-mono uppercase font-bold border border-indigo-500/10">POWER TOOL</span>
                    <h3 className="text-sm font-mono font-bold text-slate-200">
                      {t.docs_vmware_title}
                    </h3>
                  </div>
                  
                  <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
                    {t.docs_vmware_subtitle}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Part A: Workspace preparation */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono font-bold text-indigo-300 uppercase">
                        {t.docs_vmware_h1}
                      </h4>
                      <ol className="text-[11px] text-slate-400 space-y-2 list-decimal pl-4 leading-relaxed font-sans">
                        <li>{t.docs_vmware_s1}</li>
                        <li>{t.docs_vmware_s2}</li>
                        <li>{t.docs_vmware_s3}</li>
                      </ol>
                    </div>

                    {/* Part B: PowerShell Compile */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono font-bold text-indigo-300 uppercase">
                        {t.docs_vmware_h2}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        {t.docs_vmware_ps_desc}
                      </p>

                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between items-center bg-white/5 px-2 py-1 rounded-t-xl border-b border-white/5">
                          <span className="text-[9px] font-mono text-slate-350">PowerShell Administrator</span>
                          <button
                            onClick={() => copyScript(powershellScriptText, "ps1")}
                            className="text-[9px] uppercase font-mono text-slate-500 hover:text-slate-300 flex items-center gap-0.5 cursor-pointer select-none"
                            id="copy-ps1-script"
                          >
                            {copiedScript === "ps1" ? "COPIED" : "COPY"}
                          </button>
                        </div>
                        <pre className="bg-black/45 p-2 rounded-b-xl text-[10px] text-slate-400 font-mono border border-white/5 border-t-0 select-text overflow-x-auto text-[9.5px]">
{`# 1. ${t.docs_vmware_step_cd}
cd "C:\\kv_os v. 0.11.1"

# 2. ${t.docs_vmware_step_run}
Set-ExecutionPolicy Bypass -Scope Process
.\\build.ps1`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Right Column Vercel hosting & Hypervisors */}
              <div className="space-y-6">
                
                {/* Vercel Guide Card */}
                <div className="glass rounded-3xl p-5 space-y-4 border border-white/5 backdrop-blur-md" id="docs-vercel-card">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <ExternalLink className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                      {t.docs_vercel_title}
                    </h4>
                  </div>
                  
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {t.docs_vercel_desc}
                  </p>

                  <ol className="text-xs text-slate-400 space-y-3.5 pl-4 list-decimal leading-relaxed font-sans">
                    <li>{t.docs_vercel_step1}</li>
                    <li>{t.docs_vercel_step2}</li>
                    <li>{t.docs_vercel_step3}</li>
                    <li>{t.docs_vercel_step4}</li>
                  </ol>

                  <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-500/10 text-[10px] text-slate-450 leading-relaxed font-mono">
                    {t.docs_vercel_tip}
                  </div>
                </div>

                {/* Hypervisor configs */}
                <div className="glass rounded-3xl p-5 space-y-3.5 border border-white/5 backdrop-blur-md" id="docs-vbox-rufus-card">
                  <div className="text-[11px] uppercase font-mono text-slate-400 tracking-wider font-bold">
                    {t.docs_hypervisor_title}
                  </div>

                  <div className="space-y-3 text-[11px] font-mono leading-relaxed">
                    <div className="text-slate-200 font-bold border-b border-white/5 pb-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      {t.docs_vbox_title}
                    </div>
                    <ul className="list-disc pl-4 text-slate-400 space-y-1.5 text-[10px]">
                      <li>{t.docs_vbox_s1}</li>
                      <li>{t.docs_vbox_s2}</li>
                      <li>{t.docs_vbox_s3}</li>
                      <li>{t.docs_vbox_s4}</li>
                    </ul>

                    <div className="text-slate-200 font-bold border-b border-white/5 pb-1 pt-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      {t.docs_rufus_title}
                    </div>
                    <ul className="list-disc pl-4 text-slate-400 space-y-1.5 text-[10px]">
                      <li>{t.docs_rufus_s1}</li>
                      <li>{t.docs_rufus_s2}</li>
                      <li>{t.docs_rufus_s3}</li>
                    </ul>
                  </div>
                </div>

              </div>

            </div>
          )}

          {activeTab === "memorial" && (
            <Memorial language={language} />
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/40 py-8 text-center backdrop-blur-md" id="page-footer-base" style={{ contentVisibility: "auto" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5 font-mono">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            {t.footer_ops}
          </div>
          <p className="text-xs text-slate-400 leading-tight">
            {t.footer_author}
          </p>
          <p className="text-[10px] text-slate-500">
            {t.footer_rip}
          </p>
        </div>
      </footer>

    </div>
  );
}
