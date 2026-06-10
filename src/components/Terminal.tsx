import React, { useState, useEffect, useRef } from "react";
import { Terminal as TerminalIcon, Cpu, RefreshCw, Power, Monitor, Play, RotateCcw, AlertTriangle } from "lucide-react";
import { translations, Language } from "../utils/translations";

interface TerminalLine {
  text: string;
  type: "system" | "input" | "error" | "info" | "success" | "warn";
}

export default function Terminal({ 
  language,
  setLanguage,
  onRunCommand 
}: { 
  language: Language;
  setLanguage?: (lang: Language) => void;
  onRunCommand?: (cmd: string) => void;
}) {
  const [powerOn, setPowerOn] = useState(true);
  const [booting, setBooting] = useState(false);
  const [bootStep, setBootStep] = useState(0);
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [inputText, setInputText] = useState("");
  const [isCalcMode, setIsCalcMode] = useState(false);
  const [isMatrixMode, setIsMatrixMode] = useState(false);
  const [screenWhiteout, setScreenWhiteout] = useState(false);
  
  const t = translations[language];

  // Matrix and core refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const crashTimerRef = useRef<any>(null);

  const clearCrashTimer = () => {
    if (crashTimerRef.current) {
      clearTimeout(crashTimerRef.current);
      crashTimerRef.current = null;
    }
  };

  // Play retro PC speaker beep
  const playBeep = (freq = 800, duration = 40) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = "square";
      oscillator.frequency.value = freq;
      gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration / 1000);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration / 1000);
    } catch (e) {
      // Audio context might be blocked or unsupported
    }
  };

  const appendLine = (text: string, type: TerminalLine["type"] = "system") => {
    setHistory(prev => [...prev, { text, type }]);
  };

  // Run Matrix rain animation
  useEffect(() => {
    if (!isMatrixMode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 640;
    canvas.height = canvas.parentElement?.clientHeight || 400;

    const columns = Math.floor(canvas.width / 12);
    const rainDrops: number[] = Array(columns).fill(1).map(() => Math.floor(Math.random() * -100));

    // Custom characters (inspired by the assembler source code keywords/chars)
    const chars = "0100110XAXBXCXD MOV JMP CLI STI INT HLT ADD SUB DIV POP PUSH XOR RET STC CLC BITS64 KV_OS RA_MIS 15_YO_VALERA_KRAVCHENKO MUSYA_RIP";
    const charArr = chars.split(" ");

    let intervalId = setInterval(() => {
      ctx.fillStyle = "rgba(0, 5, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#22c55e"; // bright green
      ctx.font = "11px monospace";

      for (let i = 0; i < rainDrops.length; i++) {
        const text = charArr[Math.floor(Math.random() * charArr.length)];
        ctx.fillText(text, i * 14, rainDrops[i] * 12);

        if (rainDrops[i] * 12 > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    }, 45);

    // ESC to exit
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMatrixMode(false);
        playBeep(440, 100);
        appendLine("matrix_loop: exited by hardware interrupt (ESC).", "warn");
        appendLine("pls> ", "system");
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMatrixMode]);

  // Initial Boot loader simulation
  const simulateBoot = () => {
    clearCrashTimer();
    setScreenWhiteout(false);
    setBooting(true);
    setBootStep(0);
    setHistory([]);
    setIsCalcMode(false);
    setIsMatrixMode(false);
    playBeep(600, 80);

    const steps = [
      { text: "BIOS v4.11 - KV/RaMIS Engineering 2026...", type: "info" as const },
      { text: "CPU ID: x86_64 Long Mode instruction sets detected.", type: "system" as const },
      { text: "Memory Test: 16384 MB OK (Base Lower RAM: 640 KB)", type: "success" as const },
      { text: "Probing ATA Devices... Boot Drive 0x80 identified.", type: "info" as const },
      { text: "Loading Sector 0x01 (MDR Bootstrap at 0x7C00)... OK.", type: "info" as const },
      { text: "Reading Stage 2 kernel (16 sectors / 8 KB at 0x7E00)... OK.", type: "info" as const },
      { text: "Enabling A20 gate... Page tables configured... Jump to Long Mode.", type: "success" as const },
      { text: "--------------------------------------------------------", type: "system" as const },
      { text: `KV/OS Console Client Console Mode active. [${language.toUpperCase()}]`, type: "success" as const },
      { text: language === "ru" ? "Введите 'help' для просмотра системных утилит." :
            language === "zh" ? "输入 'help' 获取可用的系统命令。" :
            language === "de" ? "Geben Sie 'help' für Befehle ein." :
            language === "uk" ? "Введіть 'help' для перегляду системних утиліт." :
            "Type 'help' to see available system tools.", type: "info" as const }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setHistory(prev => [...prev, steps[currentStep]]);
        playBeep(850, 15);
        currentStep++;
        setBootStep(currentStep);
      } else {
        clearInterval(interval);
        setBooting(false);

        clearCrashTimer();
        // Automatic CRT screen deflection timer disabled so the terminal remains perfectly stable during emulation.
      }
    }, 350);
  };

  useEffect(() => {
    if (powerOn) {
      simulateBoot();
    } else {
      clearCrashTimer();
      setScreenWhiteout(false);
      setHistory([]);
    }
  }, [powerOn, language]);

  useEffect(() => {
    return () => {
      clearCrashTimer();
    };
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommand = (rawValue: string) => {
    const cmd = rawValue.trim();
    if (!cmd) {
      if (isCalcMode) {
        appendLine("calc> ", "system");
      } else {
        appendLine("pls> ", "system");
      }
      return;
    }

    if (onRunCommand) {
      onRunCommand(cmd);
    }

    playBeep(920, 25);

    // If Calculator state
    if (isCalcMode) {
      appendLine(`calc> ${cmd}`, "input");
      processCalcCommand(cmd);
      return;
    }

    // Default primary state
    appendLine(`pls> ${cmd}`, "input");
    processMainCommand(cmd);
  };

  const processMainCommand = (cmd: string) => {
    const parts = cmd.split(" ");
    const primary = parts[0].toLowerCase();

    switch (primary) {
      case "help":
        if (language === "ru") {
          appendLine("Доступные команды:", "success");
          appendLine("clear, neofetch, version, time, matrix, calc, reboot, shutdown, author, rip", "info");
        } else if (language === "zh") {
          appendLine("可用的系统命令:", "success");
          appendLine("clear, neofetch, version, time, matrix, calc, reboot, shutdown, author, rip", "info");
        } else if (language === "de") {
          appendLine("Verfügbare Befehle:", "success");
          appendLine("clear, neofetch, version, time, matrix, calc, reboot, shutdown, author, rip", "info");
        } else if (language === "uk") {
          appendLine("Доступні команди:", "success");
          appendLine("clear, neofetch, version, time, matrix, calc, reboot, shutdown, author, rip", "info");
        } else {
          appendLine("Available commands:", "success");
          appendLine("clear, neofetch, version, time, matrix, calc, reboot, shutdown, author, rip", "info");
        }
        appendLine("pls> ", "system");
        break;

      case "clear":
        setHistory([]);
        break;

      case "neofetch":
        if (language === "ru") {
          appendLine("KV/OS [Плата группы разработчиков KV/RaMIS]", "success");
          appendLine("Тип ОС: 64-бит Ядро длинного режима (Стек x86_64)", "info");
          appendLine("Объем памяти: 16384 МБ (Базовая: 640 КБ)", "success");
          appendLine("Процессор: AMD Ryzen 9 7950X3D (Эмуляция Hyper-V 3.8 ГГц)", "info");
          appendLine("Компилятор: Построитель плоских бинарных образов NASM", "warn");
        } else if (language === "zh") {
          appendLine("KV/OS [KV/RaMIS 开发者控制台]", "success");
          appendLine("系统架构: 64位长模式内核阶层 (x86_64 Stack)", "info");
          appendLine("物理内存: 16384 MB (底端基址: 640 KB)", "success");
          appendLine("处理器核: AMD Ryzen 9 7950X3D (Hyper-V 虚拟核心 3.8Ghz)", "info");
          appendLine("编译环境: NASM 扁平二进制映像自动化装配器", "warn");
        } else if (language === "de") {
          appendLine("KV/OS [KV/RaMIS Project Group Board]", "success");
          appendLine("OS-Typ: 64-Bit-Long-Mode-Kernel (x86_64-Stack)", "info");
          appendLine("RAM-Kapazität: 16384 MB (Basis: 640 KB)", "success");
          appendLine("CPU-Kern: AMD Ryzen 9 7950X3D (Hyper-V Embedded vCPU 3.8GHz)", "info");
          appendLine("Compiler: NASM Flat-Binary Assembler Image Builder", "warn");
        } else if (language === "uk") {
          appendLine("KV/OS [Рада групи розробників KV/RaMIS]", "success");
          appendLine("Тип ОС: 64-біт Ядро довгого режиму (Стек x86_64)", "info");
          appendLine("Обсяг пам'яті: 16384 МБ (Базова: 640 КБ)", "success");
          appendLine("Процесор: AMD Ryzen 9 7950X3D (Емуляція Hyper-V 3.8 ГГц)", "info");
          appendLine("Компілятор: Будівник плоских бінарних образів NASM", "warn");
        } else {
          appendLine("KV/OS [KV/RaMIS Project Group]", "success");
          appendLine("OS Type: 64-bit Long Mode Kernel (x86_64 Stack)", "info");
          appendLine("RAM Capacity: 16384 MB (Base: 640 KB)", "success");
          appendLine("CPU Core: AMD Ryzen 9 7950X3D (Hyper-V Embedded virtual CPU 3.8Ghz)", "info");
          appendLine("Compile System: NASM assembler flat-binary module builder", "warn");
        }
        appendLine("pls> ", "system");
        break;

      case "version":
        appendLine("KV/OS Build 228. Kernel mode: x86_64 Core.", "warn");
        appendLine("pls> ", "system");
        break;

      case "time":
        const now = new Date();
        const timeStr = now.toTimeString().split(" ")[0];
        appendLine("System Time: " + timeStr, "info");
        appendLine("pls> ", "system");
        break;

      case "matrix":
        if (language === "ru") {
          appendLine("Инициализация каскадного матричного модуля...", "success");
          appendLine("Пожалуйста, подождите! Нажмите клавишу 'ESC' для выхода.", "warn");
        } else if (language === "zh") {
          appendLine("正在初始化级联数字矩阵生成模块...", "success");
          appendLine("请稍候！可以按 'ESC' 键退出该演示模式。", "warn");
        } else if (language === "de") {
          appendLine("Kaskadierendes Matrix-Modul wird initialisiert...", "success");
          appendLine("Bitte warten! Drücken Sie die 'ESC'-Taste zum Verlassen.", "warn");
        } else if (language === "uk") {
          appendLine("Ініціалізація каскадного матричного модуля...", "success");
          appendLine("Будь ласка, зачекайте! Натисніть клавішу 'ESC' для виходу.", "warn");
        } else {
          appendLine("Initializing cascading matrix module...", "success");
          appendLine("Hold tight! Press 'ESC' key to abort.", "warn");
        }
        setTimeout(() => {
          setIsMatrixMode(true);
        }, 800);
        break;

      case "calc":
        setIsCalcMode(true);
        if (language === "ru") {
          appendLine("Добро пожаловать в калькулятор! Наберите 'instr' для просмотра синтаксиса или 'ext' для выхода", "success");
        } else if (language === "zh") {
          appendLine("进入内置计算器！输入 'instr' 获取运算说明，输入 'ext' 退出运算模式", "success");
        } else if (language === "de") {
          appendLine("Willkommen im Taschenrechner! 'instr' eingeben für Syntax, 'ext' für Beenden", "success");
        } else if (language === "uk") {
          appendLine("Ласкаво просимо в калькулятор! Наберіть 'instr' для перегляду синтаксису або 'ext' для виходу", "success");
        } else {
          appendLine("Hello in Calculator! type instr for instructions or ext for exit", "success");
        }
        appendLine("calc> ", "system");
        break;

      case "author":
        if (language === "ru") {
          appendLine("Создано 15-летним российским школьником Валерием Кравченко", "success");
        } else if (language === "zh") {
          appendLine("由 15 岁俄罗斯少年开发天才 Valeriy Kravchenko 倾力编写", "success");
        } else if (language === "de") {
          appendLine("Geschrieben vom 15-jährigen russischen Schüler Valeriy Kravchenko", "success");
        } else if (language === "uk") {
          appendLine("Створено 15-річним російським школярем Валерієм Кравченком", "success");
        } else {
          appendLine("made by 15 y.o Russian schoolboy Valeriy Kravchenko", "success");
        }
        appendLine("pls> ", "system");
        break;

      case "rip":
        if (language === "ru") {
          appendLine("Покойся с миром, Муся [04.10.2023 - 15.05.2026]", "error");
        } else if (language === "zh") {
          appendLine("愿慕夏安息 [04.10.2023 - 15.05.2026]", "error");
        } else if (language === "de") {
          appendLine("Ruhe in Frieden, Musya [04.10.2023 - 15.05.2026]", "error");
        } else if (language === "uk") {
          appendLine("Спочивай з миром, Муся [04.10.2023 - 15.05.2026]", "error");
        } else {
          appendLine("rise in peace Musya [04.10.2023 - 15.05.2026]", "error");
        }
        appendLine("pls> ", "system");
        break;

      case "reboot":
        if (language === "ru") {
          appendLine("Вызов программного сброса через контроллер клавиатуры (Порт 0x64)...", "warn");
        } else if (language === "zh") {
          appendLine("正在通过键盘控制器(端口 0x64)调用系统级软引导重启...", "warn");
        } else if (language === "de") {
          appendLine("Löse Software-Reset über Tastatur-Controller (Port 0x64) aus...", "warn");
        } else if (language === "uk") {
          appendLine("Виклик програмного скидання через контролер клавіатури (Порт 0x64)...", "warn");
        } else {
          appendLine("Invoking soft-reboot via keyboard controller (Port 0x64)...", "warn");
        }
        setTimeout(() => {
          simulateBoot();
        }, 1000);
        break;

      case "shutdown":
        if (language === "ru") {
          appendLine("Отправка сигнала ACPI отключения питания на порт 0x604...", "warn");
        } else if (language === "zh") {
          appendLine("正在向虚拟ACPI端口发出硬件断电电源指令...", "warn");
        } else if (language === "de") {
          appendLine("Sende ACPI-Ausschaltsignal über vPort 0x604...", "warn");
        } else if (language === "uk") {
          appendLine("Надсилання сигналу ACPI про вимкнення живлення на порт 0x604...", "warn");
        } else {
          appendLine("Sending ACPI power-down command via virtualization port 0x604...", "warn");
        }
        setTimeout(() => {
          setPowerOn(false);
          playBeep(200, 300);
        }, 1200);
        break;

      default:
        if (language === "ru") {
          appendLine("Неизвестная системная команда.", "error");
        } else if (language === "zh") {
          appendLine("未知的汇编控制总线指令。", "error");
        } else if (language === "de") {
          appendLine("Unbekannte Befehlssequenz.", "error");
        } else if (language === "uk") {
          appendLine("Невідома системна команда.", "error");
        } else {
          appendLine("Unknown command sequence.", "error");
        }
        appendLine("pls> ", "system");
        break;
    }
  };

  const processCalcCommand = (cmd: string) => {
    const parts = cmd.toLowerCase().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      appendLine("calc> ", "system");
      return;
    }

    const op = parts[0];

    if (op === "ext") {
      setIsCalcMode(false);
      appendLine("Exiting Calculator Mode.", "info");
      appendLine("pls> ", "system");
      return;
    }

    if (op === "instr") {
      appendLine("syntax example:", "success");
      appendLine("sum 5 5  (= 10)", "info");
      appendLine("sub 10 5 (= 5)", "info");
      appendLine("mul 5 2  (= 10)", "info");
      appendLine("div 5 2  (= 2.5)", "info");
      appendLine("fdiv 16 3 (= 5)", "info");
      appendLine("pow 2 3  (= 8)", "info");
      appendLine("calc> ", "system");
      return;
    }

    if (parts.length < 3) {
      appendLine("Error: Invalid operation syntax. Format: <op> <num1> <num2>", "error");
      appendLine("calc> ", "system");
      return;
    }

    const n1 = parseFloat(parts[1]);
    const n2 = parseFloat(parts[2]);

    if (isNaN(n1) || isNaN(n2)) {
      appendLine("Error: Arguments must be integers or floating point numbers.", "error");
      appendLine("calc> ", "system");
      return;
    }

    let result = 0;
    let formatFloat = false;

    switch (op) {
      case "sum":
        result = n1 + n2;
        break;
      case "sub":
        result = n1 - n2;
        break;
      case "mul":
        result = n1 * n2;
        break;
      case "div":
        if (n2 === 0) {
          appendLine("Error: Division by zero is undefined.", "error");
          appendLine("calc> ", "system");
          return;
        }
        result = n1 / n2;
        formatFloat = true;
        break;
      case "fdiv":
        if (n2 === 0) {
          appendLine("Error: Division by zero is undefined.", "error");
          appendLine("calc> ", "system");
          return;
        }
        result = Math.floor(n1 / n2);
        break;
      case "pow":
        result = Math.pow(n1, n2);
        break;
      default:
        appendLine("Error: Invalid operation syntax.", "error");
        appendLine("calc> ", "system");
        return;
    }

    appendLine(`Result: ${formatFloat ? result.toFixed(1) : result}`, "success");
    appendLine("calc> ", "system");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(inputText);
      setInputText("");
    }
  };

  // Focus terminal input
  const focusTerminal = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Retro PC Display Box CSS */}
      <div className="relative panel-glass rounded-3xl p-4 md:p-6 shadow-2xl shadow-indigo-950/10 backdrop-blur-md">
        
        {/* Top Bezels / Display indicators */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-indigo-400" />
              {t.terminal_power_title}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Status LED */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono text-slate-400">{t.terminal_signal}</span>
              <span className={`w-2 h-2 rounded-full ${powerOn ? "bg-indigo-400 shadow-lg shadow-indigo-400" : "bg-slate-750"} transition-all duration-300`}></span>
            </div>
            
            {/* Action buttons */}
            <button 
              onClick={() => {
                playBeep(powerOn ? 300 : 500, 150);
                setPowerOn(!powerOn);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-mono font-medium flex items-center gap-1 transition cursor-pointer"
              title="Toggle Power Monitor Switch"
              id="monitor-power-btn"
            >
              <Power className={`w-3.5 h-3.5 ${powerOn ? "text-red-400" : "text-indigo-400"}`} />
              {powerOn ? t.terminal_power_off : t.terminal_power_on}
            </button>

            <button 
              onClick={() => {
                if (powerOn) {
                  playBeep(450, 100);
                  simulateBoot();
                }
              }}
              disabled={!powerOn || booting}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 border border-white/10 text-xs font-mono font-medium flex items-center gap-1 transition cursor-pointer"
              title="Reboot Board"
              id="monitor-reboot-btn"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              {t.terminal_reboot}
            </button>
          </div>
        </div>

        {/* Screen Bezel Mask */}
        <div 
          onClick={focusTerminal}
          className="relative bg-black/60 rounded-2xl border border-white/5 shadow-inner overflow-hidden cursor-text select-none min-h-[380px] flex flex-col md:min-h-[440px]"
        >
          {/* CRT Screen Tube Overlay */}
          <div className={`absolute inset-0 z-10 pointer-events-none ${powerOn ? "crt-screen" : ""}`} />
          {powerOn && <div className="scanline" />}

          {/* Actual display contents */}
          <div className={`p-4 font-mono text-sm leading-relaxed flex-1 flex flex-col justify-between transition-all duration-300 ${powerOn ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
            
            {isMatrixMode ? (
              // Matrix Mode overlay canvas
              <div className="absolute inset-0 bg-black z-20">
                <canvas ref={canvasRef} className="w-full h-full block" />
                <div className="absolute top-3 left-4 bg-black/75 px-2 py-1 border border-emerald-500/30 rounded text-[10px] text-emerald-500/80 font-mono tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  LONG_MODE_MATRIX_GEN // PRESS ESC TO EXIT
                </div>
              </div>
            ) : (
              // Regular console shell log
              <div className="flex-1 flex flex-col justify-between h-full">
                {/* Lines Area */}
                <div className="space-y-1.5 overflow-y-auto max-h-[350px] md:max-h-[390px] custom-scrollbar pr-1 flex-1">
                  
                  {/* Real visual BIOS Post Header */}
                  {booting && (
                    <div className="text-[10px] text-slate-500 border-b border-slate-900 pb-1 mb-2 flex items-center justify-between font-mono">
                      <span>KV/RaMIS POST v4.11 AMIBIOS</span>
                      <span>JUNE 8, 2026</span>
                    </div>
                  )}

                  {history.map((line, idx) => {
                    let colorClass = "text-emerald-500";
                    if (line.type === "input") colorClass = "text-slate-100 font-medium";
                    if (line.type === "error") colorClass = "text-red-400 retro-glow-green font-semibold";
                    if (line.type === "warn") colorClass = "text-amber-400 font-semibold";
                    if (line.type === "info") colorClass = "text-emerald-400/80";
                    if (line.type === "success") colorClass = "text-emerald-400 font-bold retro-glow-green";

                    return (
                      <div key={idx} className={`${colorClass} whitespace-pre-wrap leading-tight text-[13px] md:text-sm tracking-wide`}>
                        {line.text}
                      </div>
                    );
                  })}
                  
                  {/* Bottom scroll target */}
                  <div ref={terminalEndRef} />
                </div>

                {/* Live Console Prompt Input Row */}
                {!booting && (
                  <div className="flex items-center gap-1 border-t border-emerald-950/40 pt-2 mt-2">
                    <span className="text-emerald-400 font-bold text-[13px] md:text-sm tracking-wide">
                      {isCalcMode ? "calc>" : "pls>"}
                    </span>
                    <input
                      ref={inputRef}
                      type="text"
                      id="terminal-keyboard-input"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      maxLength={60}
                      disabled={booting}
                      className="bg-transparent text-slate-100 focus:outline-none flex-1 font-mono text-[13px] md:text-sm tracking-wider"
                      placeholder={isCalcMode ? (language === "ru" ? "например, sum 10 20" : "e.g. sum 10 20") : (language === "ru" ? "введите 'help' или команды..." : "type 'help' or commands...")}
                      autoFocus
                    />
                    <div className="text-[10px] text-slate-600 select-none hidden sm:block">
                      {isCalcMode ? "[ext: Exit]" : "[matrix: Rain]"}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Off screen placeholder */}
          {!powerOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 text-slate-600 animate-pulse">
                <Power className="w-8 h-8 text-slate-700" />
              </div>
              <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest font-bold">{t.terminal_deflection_off}</h3>
              <p className="text-xs font-mono text-slate-600 mt-1">{t.terminal_deflection_off_desc}</p>
            </div>
          )}

          {/* CRITICAL HARDWARE CRASH WHITEOUT SCREEN OVERLAY */}
          {powerOn && screenWhiteout && (
            <div className="absolute inset-0 z-35 bg-white flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in" style={{ contentVisibility: "auto" }}>
              <AlertTriangle className="w-12 h-12 text-red-600 mb-3 animate-bounce" />
              <h3 className="text-sm md:text-base font-mono tracking-wider font-extrabold text-red-600 uppercase">
                {t.terminal_whiteout_title}
              </h3>
              <p className="text-xs font-mono text-slate-700 max-w-xs mt-3 leading-relaxed font-semibold">
                {t.terminal_whiteout_desc}
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  playBeep(450, 100);
                  setScreenWhiteout(false);
                  simulateBoot();
                }}
                className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold rounded-lg transition-all active:scale-95 cursor-pointer shadow-md border border-red-500"
              >
                {t.terminal_whiteout_btn}
              </button>
            </div>
          )}

        </div>

        {/* Outer bottom decorative bar */}
        <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-900 pt-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>{t.terminal_cpu}: <span className="text-slate-300 font-medium">x86_64 Long Mode (64-bit Enabled)</span></span>
          </div>
          <div>
            <span>{t.terminal_ram}: <span className="text-slate-400">16,384 MB Alloc</span></span>
          </div>
        </div>

      </div>
    </div>
  );
}
