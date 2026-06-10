import React, { useState, useRef } from "react";
import { generateKvosImage, calculateChecksum } from "../utils/compiler";
import { HardDrive, Download, Upload, CheckSquare, ShieldCheck, AlertCircle, RefreshCw, File } from "lucide-react";
import { translations, Language } from "../utils/translations";

export default function Flasher({ language }: { language: Language }) {
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledImage, setCompiledImage] = useState<Blob | null>(null);
  const [checksum, setChecksum] = useState<string>("");
  const [compileStatus, setCompileStatus] = useState<string>("");

  const t = translations[language];

  // Upload/Mount state
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    isValidBootSec: boolean | null;
    signature: string;
    checksum: string;
  } | null>(null);
  
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger simulated local compiler
  const handleCompile = () => {
    setIsCompiling(true);
    setCompileStatus("nasm -f bin boot.asm -o boot.bin...");
    
    setTimeout(() => {
      setCompileStatus(
        language === "ru" ? "nasm -f bin kernel.asm -o kernel.bin [Ядро Stage 2 Long Mode]..." :
        language === "zh" ? "nasm -f bin kernel.asm -o kernel.bin [第二阶段长模式]..." :
        language === "de" ? "nasm -f bin kernel.asm -o kernel.bin [Stage 2 Long Mode]..." :
        language === "uk" ? "nasm -f bin kernel.asm -o kernel.bin [Ядро Stage 2 Long Mode]..." :
        "nasm -f bin kernel.asm -o kernel.bin [Stage 2 Long Mode]..."
      );
      
      setTimeout(() => {
        setCompileStatus(
          language === "ru" ? "cat boot.bin kernel.bin > kvos_0_11_1.img [Создание структуры FAT12]..." :
          language === "zh" ? "cat boot.bin kernel.bin > kvos_0_11_1.img [注入1.44MB软盘结构]..." :
          language === "de" ? "cat boot.bin kernel.bin > kvos_0_11_1.img [Strukturen in Floppy schreiben]..." :
          language === "uk" ? "cat boot.bin kernel.bin > kvos_0_11_1.img [Створення структури FAT12]..." :
          "cat boot.bin kernel.bin > kvos_0_11_1.img [Injecting floppy structures]..."
        );
        
        setTimeout(() => {
          const imgBlob = generateKvosImage();
          calculateChecksum(imgBlob, (hash) => {
            setChecksum(hash);
            setCompiledImage(imgBlob);
            setIsCompiling(false);
            setCompileStatus(
              language === "ru" ? "УСПЕШНО: Компиляция успешно завершена. Образ готов." :
              language === "zh" ? "构建成功：二进制编译处理完毕，操作内核可以下载。" :
              language === "de" ? "ERFOLG: Kompilierung erfolgreich abgeschlossen. Image bereit." :
              language === "uk" ? "УСПІШНО: Компіляція завершена. Образ готовий." :
              "SUCCESS: Compilation finished successfully. Image is ready."
            );
          });
        }, 600);
      }, 700);
    }, 600);
  };

  const handleDownload = () => {
    if (!compiledImage) return;
    const url = URL.createObjectURL(compiledImage);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kvos_v0.11.1.img";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Inspect uploaded file
  const handleFileAnalysis = (file: File) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      if (!e.target || !e.target.result) return;
      const arrayBuffer = e.target.result as ArrayBuffer;
      const view = new DataView(arrayBuffer);
      
      let isValidBoot = false;
      let signatureStr = "0x0000";

      const matchText = language === "ru" ? "0xAA55 (Совпало!)" :
                       language === "zh" ? "0xAA55 (通过!)" :
                       language === "de" ? "0xAA55 (Gepasst!)" :
                       language === "uk" ? "0xAA55 (Збіг!)" : "0xAA55 (Match!)";

      const mismatchText = language === "ru" ? " (Несовпало)" :
                          language === "zh" ? " (不匹配)" :
                          language === "de" ? " (Falsch)" :
                          language === "uk" ? " (Не збігається)" : " (Mismatched)";

      const boundText = language === "ru" ? "Неверный размер файла (< 512 байт)" :
                       language === "zh" ? "文件大小错误 (< 512 字节)" :
                       language === "de" ? "Ungültige Dateigröße (< 512 Bytes)" :
                       language === "uk" ? "Невірний розмір файлу (< 512 байт)" : "Incorrect file bounds (< 512 bytes)";

      // A real boot sector requires 0xAA55 signature in bytes 510 and 511
      if (arrayBuffer.byteLength >= 512) {
        const byte510 = view.getUint8(510);
        const byte511 = view.getUint8(511);
        if (byte510 === 0x55 && byte511 === 0xAA) {
          isValidBoot = true;
          signatureStr = matchText;
        } else {
          signatureStr = `0x${byte510.toString(16).padStart(2, "0")}${byte511.toString(16).padStart(2, "0")}${mismatchText}`;
        }
      } else {
        signatureStr = boundText;
      }

      // Calculate file checksum
      let hash = 0;
      for (let i = 0; i < view.byteLength; i++) {
        hash = (hash + view.getUint8(i)) % 0xFFFFFFFF;
      }
      const fileChecksum = `CRC32-${hash.toString(16).toUpperCase().padStart(8, "0")}`;

      setUploadedFile({
        name: file.name,
        size: file.size,
        isValidBootSec: isValidBoot,
        signature: signatureStr,
        checksum: fileChecksum
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileAnalysis(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileAnalysis(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Assemble & Download Box */}
        <div className="glass rounded-3xl p-5 flex flex-col justify-between border border-white/5 backdrop-blur-md" id="assemble-image-card">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-indigo-400/10 text-indigo-400 border border-indigo-400/10">
                <HardDrive className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-mono font-bold text-slate-200">{t.builder_card_title}</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4 font-sans">
              {t.builder_card_desc}
            </p>

            {isCompiling ? (
              <div className="p-4 rounded-xl bg-white/5 border border-indigo-500/20 mb-4 animate-pulse">
                <div className="flex items-center gap-2.5 text-xs text-indigo-300 font-mono">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>{compileStatus}</span>
                </div>
                <div className="w-full bg-[#000]/45 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[70%] rounded-full"></div>
                </div>
              </div>
            ) : compiledImage ? (
              <div className="p-4 rounded-xl bg-white/3 border border-indigo-500/10 mb-4 text-xs font-mono space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.builder_assembled}</span>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-slate-400 text-[11px] pt-1 border-t border-white/5">
                  <span>{t.builder_target_disk}</span> <span className="text-slate-200 text-right">{t.builder_floppy}</span>
                  <span>{t.builder_structure_size}</span> <span className="text-slate-200 text-right">1,474,560 bytes</span>
                  <span>{t.builder_sig}</span> <span className="text-indigo-300 text-right">{t.builder_sig_verified}</span>
                  <span>{t.builder_hash}</span> <span className="text-amber-400 text-right tracking-wider">{checksum}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white/2 border border-white/5 mb-4 text-xs text-slate-550 font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-slate-500" />
                <span>{t.builder_not_assembled}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!compiledImage ? (
              <button
                onClick={handleCompile}
                disabled={isCompiling}
                className="w-full py-2.5 rounded-xl btn-primary-gradient disabled:opacity-40 text-white font-mono text-xs font-bold transition flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95"
                id="compile-img-btn"
              >
                <RefreshCw className="w-4 h-4 animate-pulse" />
                {t.builder_btn_assemble}
              </button>
            ) : (
              <>
                <button
                  onClick={handleDownload}
                  className="flex-1 py-2.5 rounded-xl btn-primary-gradient text-white font-mono text-xs font-bold transition flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95"
                  id="download-img-btn"
                >
                  <Download className="w-4 h-4" />
                  {t.builder_btn_download}
                </button>
                <button
                  onClick={() => {
                    setCompiledImage(null);
                    setChecksum("");
                  }}
                  className="px-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-slate-200 transition font-mono text-xs cursor-pointer"
                  id="reset-compiler-btn"
                >
                  {t.builder_btn_reset}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Upload & Analyzer Box */}
        <div className="glass rounded-2xl p-5 flex flex-col justify-between border border-white/5 backdrop-blur-md" id="upload-checksum-card">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-indigo-400/10 text-indigo-400 border border-indigo-400/10">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-mono font-bold text-slate-205">{t.builder_checker_title}</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4 font-sans">
              {t.builder_checker_desc}
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".img,.bin,.iso"
              onChange={onFileChange}
              className="hidden"
            />

            {uploadedFile ? (
              <div className="p-4 rounded-xl bg-white/3 border border-indigo-500/10 mb-4 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-indigo-350 font-bold border-b border-white/5 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <File className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[120px]">{uploadedFile.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {t.builder_checker_bytes.replace("{bytes}", uploadedFile.size.toString())}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-1 text-slate-400 text-[11px] pt-0.5">
                  <span>{t.builder_checker_magic}</span> 
                  <span className={`text-right font-bold ${uploadedFile.isValidBootSec ? "text-emerald-450 animate-pulse" : "text-rose-455"}`}>
                    {uploadedFile.signature}
                  </span>
                  <span>{t.builder_checker_bios}</span> 
                  <span className={`text-right font-bold ${uploadedFile.isValidBootSec ? "text-emerald-450" : "text-rose-455"}`}>
                    {uploadedFile.isValidBootSec ? t.builder_checker_compliant_yes : t.builder_checker_compliant_no}
                  </span>
                  <span>{t.builder_checker_sig}</span>
                  <span className="text-slate-300 text-right">{uploadedFile.checksum}</span>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragging
                    ? "border-indigo-400 bg-indigo-500/10 text-indigo-300"
                    : "border-white/10 hover:border-white/20 bg-white/2 text-slate-400 hover:text-slate-200"
                }`}
                id="dropzone"
              >
                <Upload className={`w-8 h-8 mb-2 ${dragging ? "animate-bounce text-indigo-400" : "text-slate-500"}`} />
                <span className="text-xs font-mono font-medium block">
                  {dragging ? t.builder_checker_dropzone_drag : t.builder_checker_dropzone_idle}
                </span>
                <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                  {t.builder_checker_dropzone_click}
                </span>
              </div>
            )}
          </div>

          <div className="flex mt-4 md:mt-0">
            {uploadedFile && (
              <button
                onClick={() => setUploadedFile(null)}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-355 font-mono text-xs transition cursor-pointer"
                id="reset-uploader-btn"
              >
                {t.builder_checker_btn_clear}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
