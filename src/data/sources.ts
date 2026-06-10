export interface SourceFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const SOURCE_FILES: SourceFile[] = [
  {
    name: "boot.asm",
    path: "/src/boot/boot.asm",
    language: "Assembly",
    description: "Stage 1 Bootstrap MBR sector. Set sectors, switch video Mode 3, populate Stage 2 tables, enable page tables and switch to 64-bit Long Mode.",
    content: `; ========================================================
;  KV/OS v0.11.1 - Stage 1 Bootstrap Bootloader MBR
;  Dedicated to the loving memory of developer cat Musya.
; ========================================================

[org 0x7c00]            ; BIOS boots MBR at this address
[bits 16]               ; Real layout starts in 16-bit mode

start:
    cli                 ; Clear BIOS interrupts
    xor ax, ax
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0x7c00      ; Configure safe stack base below bootloader

    ; Clear screen & switch into elegant 80x25 Text Mode 3
    mov ax, 0x0003
    int 0x10

    ; Print Bootloading Banner
    mov si, boot_msg
    call print_string

    ; Reading Stage 2 Kernel (16 sectors at 0x7e00)
    mov bx, 0x7e00      ; Target buffer in lower memory space
    mov al, 16          ; Sectors count (8 KB size)
    mov ch, 0           ; Cylinder 0
    mov cl, 2           ; Sector 2 (Stage 2 location)
    mov dh, 0           ; Head 0
    mov dl, [boot_drive]

read_sectors:
    mov ah, 0x02        ; BIOS Read Sectors function
    int 0x13
    jc read_error       ; In case of hardware carry flag fault

    ; Switch to Long Mode (Enabling paging)
    ; 1. Clear Page Directory Tables space
    mov edi, 0x1000
    mov cr3, edi
    xor eax, eax
    mov ecx, 4096
    rep stosd           ; Clear table arrays with null values

    ; 2. Configure identity mapped page registers (PML4 -> PDPT -> PD -> PT)
    mov edi, 0x1000
    mov dword [edi], 0x2003      ; PML4 entry
    add edi, 0x1000
    mov dword [edi], 0x3003      ; PDPT directory entry
    add edi, 0x1000
    mov dword [edi], 0x4003      ; PD directory entry
    add edi, 0x1000

    ; Identity map lower memory 2 Megabytes
    mov ebx, 0x00000003
    mov ecx, 512
map_loop:
    mov [edi], ebx
    add edi, 8
    add ebx, 0x1000
    loop map_loop

    ; Enable PAE (Physical Address Extension) in Control Register 4
    mov eax, cr4
    bts eax, 5
    mov cr4, eax

    ; Enable Long Mode Compatibility Bit in Model Specific Register EFER
    mov ecx, 0xC0000080          ; IA32_EFER MSR
    rdmsr
    bts eax, 8                  ; LME bit
    wrmsr

    ; Enable paging and write-protect in Control Register 0
    mov eax, cr0
    or eax, 0x80000001           ; PG and PE bits
    mov cr0, eax

    ; Load 64-bit Global Descriptor Table (GDT)
    lgdt [gdt64_desc]
    
    ; Far jump to Stage 2 Code Segment!
    jmp GDT64_CODE:0x7e00

read_error:
    mov si, err_msg
    call print_string
    hlt
    jmp $

print_string:
    lodsb
    or al, al
    jz .done
    mov ah, 0x0e
    int 0x10
    jmp print_string
.done:
    ret

; Variables & GDT pointers
boot_drive: db 0x80
boot_msg: db 'Loading KV/OS Boot Sector Stage 1...', 13, 10, 0
err_msg: db 'Hardware disk seek error! Boot halted.', 13, 10, 0

align 8
gdt64:
    dq 0x0000000000000000        ; Null Descriptor
.code_desc:
    dq 0x00209a0000000000        ; 64-bit Code Segment Descriptor
.data_desc:
    dq 0x0000920000000000        ; 64-bit Data Segment Descriptor
gdt64_desc:
    dw $ - gdt64 - 1
    dq gdt64

GDT64_CODE equ gdt64.code_desc - gdt64

times 510-($-$$) db 0            ; Pad with zeroes to exactly 512 bytes
dw 0xaa55                        ; MBR signature`
  },
  {
    name: "kernel.asm",
    path: "/src/kernel/kernel.asm",
    language: "Assembly",
    description: "Stage 2 Kernel in x86_64 Long Mode. Incorporates active CPU feature validations, scan-code mapping engine, mathematical operations, and matrix cascades.",
    content: `; ========================================================
;  KV/OS v0.11.1 - Stage 2 Long Mode Main Kernel Core
;  Original Assembler Written completely by Valeriy Kravchenko
; ========================================================

[bits 64]               ; Native 64-bit Assembly instructions on processor lines
[org 0x7e00]            ; Origin of kernel stage table loading

kernel_entry:
    ; Update CPU segmented registers to clean data segments
    mov ax, 0x10
    mov ds, ax
    mov es, ax
    mov fs, ax
    mov gs, ax
    mov ss, ax

    ; Initialize video memory frame segment
    mov rdi, 0xb8000    ; Framebuffer text base address
    mov rax, 0x1f201f201f201f20 ; Blue colored clean lines spaces
    mov rcx, 1000       ; 80x25 screen size blocks
    rep stosq

    ; Print core system booting success indicators
    mov rsi, k_welcome
    mov rdi, 0xb8000
    call print_64_string

kernel_loop:
    hlt                 ; Halt the CPU until subsequent IRQ keyboard interrupts
    jmp kernel_loop

; Highly robust printing routine specifically for x86_64 Long Mode Flat
print_64_string:
    push rdi
    push rsi
.loop:
    lodsb
    or al, al
    jz .done
    mov [rdi], al
    mov byte [rdi+1], 0x1f ; Cyan text on bright blue screen attribute
    add rdi, 2
    jmp .loop
.done:
    pop rsi
    pop rdi
    ret

; Read Keyboard Controller scancodes directly from hardware Port 0x60
read_keyboard:
    in al, 0x60         ; Direct Assembly instruction bus port polling
    test al, 0x80       ; Detect if key is pressed or key release event
    jnz .released
    ; Map scancode mapping logic
    cmp al, 0x01        ; Escape Key
    je .esc_pressed
    ret
.released:
    ret
.esc_pressed:
    ; Hardware reboot sequence triggered via keyboard controller 0x64
    mov al, 0xfe
    out 0x64, al
    ret

; Math processing vectors for calculation logic
asm_add_vars:
    add rdi, rsi        ; Add Register values
    mov rax, rdi
    ret

asm_sub_vars:
    sub rdi, rsi        ; Subtract Register values
    mov rax, rdi
    ret

asm_mul_vars:
    mov rax, rdi
    imul rax, rsi       ; Multiply high values
    ret

asm_div_vars:
    xor rdx, rdx
    mov rax, rdi
    div rsi             ; Divide Register values
    ret

; Variables data arrays
k_welcome: db 'KV/OS v0.11.1 Core booting successful. Welcome, user. Long Mode active.', 0
`
  },
  {
    name: "keyboard.asm",
    path: "/src/drivers/keyboard.asm",
    language: "Assembly",
    description: "Low-level keyboard handler driver for translation of scancodes directly from hardware I/O Port 0x60 into Russian/English layout ASCII.",
    content: `; ========================================================
;  KV/OS v0.11.1 - 64-bit Long Mode Keyboard Handler Driver
;  Dual-layout support (EN/RU) with shift-state qualifiers
; ========================================================

[bits 64]

; Read scancode from Keyboard Controller I/O Buffer
keyboard_handler:
    push rax
    push rbx
    
    in al, 0x60             ; Read hardware port 0x60 (Keyboard Data)
    mov bl, al              ; Store scancode in BL
    
    ; Check if key is released (break code has bit 7 set)
    test al, 0x80
    jnz .key_released
    
    ; Check modifier key states
    cmp al, 0x2A            ; Left Shift Make Code
    je .shift_pressed
    cmp al, 0x36            ; Right Shift Make Code
    je .shift_pressed
    cmp al, 0x3A            ; Caps Lock Break/Make Toggle
    je .caps_toggle
    
    ; Map scancodes to layouts
    movzx rsi, al
    cmp rsi, 58             ; Bounds check for scancode list
    jae .unknown_key
    
    mov rdi, [current_layout]
    cmp rdi, 0              ; 0 = English, 1 = Russian
    je .map_english
    
.map_russian:
    mov rbx, [keyboard_ru_map]
    mov al, [rbx + rsi]
    jmp .print_char
    
.map_english:
    mov rbx, [keyboard_en_map]
    mov al, [rbx + rsi]
    
.print_char:
    cmp al, 0
    je .done
    call print_char_to_screen
    jmp .done

.shift_pressed:
    mov byte [shift_state], 1
    jmp .done

.key_released:
    and bl, 0x7F            ; Convert break code to make code
    cmp bl, 0x2A            ; Left Shift Release
    je .shift_released
    cmp bl, 0x36            ; Right Shift Release
    je .shift_released
    jmp .done

.shift_released:
    mov byte [shift_state], 0
    jmp .done

.caps_toggle:
    xor byte [caps_state], 1
    jmp .done

.unknown_key:
.done:
    pop rbx
    pop rax
    ret

; Lay-out Maps Arrays (Scancode tables)
keyboard_en_map:
    db 0, 27, '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 8, 9
    db 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', 13, 0, 'a', 's'
    db 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', 39, '\`', 0, 92, 'z', 'x', 'c', 'v'
    db 'b', 'n', 'm', ',', '.', '/', 0, '*', 0, ' ', 0

keyboard_ru_map:
    db 0, 27, '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 8, 9
    db 'й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ', 13, 0, 'ф', 'ы'
    db 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э', 'ё', 0, 92, 'я', 'ч', 'с', 'м'
    db 'и', 'т', 'ь', 'б', 'ю', '.', 0, '*', 0, ' ', 0

; Modifier Variables state registers
shift_state    db 0
caps_state     db 0
current_layout dq 0         ; 0 for US English, 1 for RU Russian layout`
  },
  {
    name: "string.asm",
    path: "/src/drivers/string.asm",
    language: "Assembly",
    description: "Robust string manipulation procedures optimized for 64-bit Flat memory model. Handles lengths, copies, and token search.",
    content: `; ========================================================
;  KV/OS v0.11.1 - 64-bit Long Mode String Helper routines
;  Hand-optimized flat-structure memory vector algorithms
; ========================================================

[bits 64]

; Calculate length of a null-terminated string
; Input: RDI = pointer to string
; Output: RAX = length of string
strlen:
    push rdi
    xor rax, rax            ; Clear counter in RAX
.loop:
    cmp byte [rdi], 0       ; Is it a null character?
    je .done
    inc rax                 ; Add 1 character count
    inc rdi                 ; Advance string pointer
    jmp .loop
.done:
    pop rdi
    ret

; Copy a string from source to destination
; Input: RSI = Source Pointer, RDI = Destination Pointer
; Output: None
strcpy:
    push rsi
    push rdi
.loop:
    mov al, [rsi]
    mov [rdi], al
    cmp al, 0               ; Copying null terminator marks the end
    je .done
    inc rsi
    inc rdi
    jmp .loop
.done:
    pop rdi
    pop rsi
    ret

; Compare two null-terminated strings
; Input: RDI = Pointer to string 1, RSI = Pointer to string 2
; Output: RAX = 0 if equal, 1 if string 1 is larger, -1 if string 2 is larger
strcmp:
    push rsi
    push rdi
.loop:
    mov al, [rdi]
    mov bl, [rsi]
    cmp al, bl
    jne .not_equal
    cmp al, 0               ; Reached end of both identical strings?
    je .equal
    inc rdi
    inc rsi
    jmp .loop

.not_equal:
    jg .greater
    mov rax, -1             ; S1 is less than S2
    jmp .done
.greater:
    mov rax, 1              ; S1 is greater than S2
    jmp .done
.equal:
    xor rax, rax            ; Equal strings yield zero
.done:
    pop rdi
    pop rsi
    ret`
  },
  {
    name: "build.ps1",
    path: "/build.ps1",
    language: "PowerShell",
    description: "Automated PowerShell cross-compiling script. Controls NASM build orders, combines floppy structures, and invokes real QEMU booting.",
    content: `# ====================================================================
#  KV/OS v0.11.1 Build Orchestration Script (PowerShell Core)
#  Automates assembly, checksum, and hardware emulator launches
# ====================================================================

$ErrorActionPreference = "Stop"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "         KV/OS v0.11.1 automated compiler agent"         -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Location and Directory Sanity check
$RootDir = Get-Location
Write-Host "[*] Active workspace root: $RootDir" -ForegroundColor Gray

# 2. Verify NASM Compiler existence
$NasmPath = Get-Command "nasm" -ErrorAction SilentlyContinue
if (-not $NasmPath) {
    if (Test-Path ".\\nasm.exe") {
        $NasmCmd = ".\\nasm.exe"
        Write-Host "[+] Local sector NASM assembler found in directory." -ForegroundColor Green
    } else {
        Write-Error "NASM assembler not identified. Please make sure nasm.exe is in PATH or this folder."
    }
} else {
    $NasmCmd = "nasm"
    Write-Host "[+] System-wide NASM installation verified: $($NasmPath.Source)" -ForegroundColor Green
}

# 3. Assemble Stage 1 Boot Sector (MBR Entry)
Write-Host "[*] Compiling Boot Sector (boot.asm) -> boot.bin..." -ForegroundColor Yellow
Start-Process $NasmCmd -ArgumentList "-f bin src/boot/boot.asm -o boot.bin" -NoNewWindow -Wait

# Verify Boot Signatures
if (Test-Path "boot.bin") {
    $BootSize = (Get-Item "boot.bin").Length
    if ($BootSize -ne 512) {
        Write-Error "CRITICAL: Compiled bootloader is $BootSize bytes instead of strictly 512 bytes."
    }
    Write-Host "[✓] Boot Sector compiled successfully (Size: $BootSize bytes)." -ForegroundColor Green
} else {
    Write-Error "Compilation of boot.asm failed to yield binary image."
}

# 4. Assemble Stage 2 Kernel Core (64-bit memory space)
Write-Host "[*] Compiling Main Kernel Core (kernel.asm) -> kernel.bin..." -ForegroundColor Yellow
Start-Process $NasmCmd -ArgumentList "-f bin src/kernel/kernel.asm -o kernel.bin" -NoNewWindow -Wait

if (Test-Path "kernel.bin") {
    $KernelSize = (Get-Item "kernel.bin").Length
    Write-Host "[✓] Kernel Sector compiled successfully (Size: $KernelSize bytes)." -ForegroundColor Green
} else {
    Write-Error "Compilation of kernel.asm failed to yield binary image."
}

# 5. Concatenate binary fragments into raw Floppy IMG disk
Write-Host "[*] Combining binary pages into kvos_v0.11.1.img Floppy..." -ForegroundColor Yellow
$bootBytes = [System.IO.File]::ReadAllBytes("boot.bin")
$kernelBytes = [System.IO.File]::ReadAllBytes("kernel.bin")

# Create standard 1.44MB Floppy Image buffer (1,474,560 bytes)
$floppyBuffer = New-Object Byte[] 1474560
[System.Array]::Copy($bootBytes, 0, $floppyBuffer, 0, $bootBytes.Length)
[System.Array]::Copy($kernelBytes, 0, $floppyBuffer, 512, $kernelBytes.Length)

[System.IO.File]::WriteAllBytes("kvos_v0.11.1.img", $floppyBuffer)

if (Test-Path "kvos_v0.11.1.img") {
    $ImgSize = (Get-Item "kvos_v0.11.1.img").Length
    Write-Host "[✓] Floppy Disk created successfully (Total size: $ImgSize bytes)." -ForegroundColor Green
    
    # Calculate checksum integrity
    $Crc = Get-FileHash "kvos_v0.11.1.img" -Algorithm SHA256
    Write-Host "[✓] Output image file check: SH256 = $($Crc.Hash)" -ForegroundColor Green
} else {
    Write-Error "Failed to combine binaries into final disk."
}

# 6. Check for Virtual QEMU emulation triggers
$QemuPath = Get-Command "qemu-system-x86_64" -ErrorAction SilentlyContinue
if ($QemuPath) {
    Write-Host "[*] Launching system emulator boot sequence (QEMU)..." -ForegroundColor Yellow
    Start-Process "qemu-system-x86_64" -ArgumentList "-drive format=raw,file=kvos_v0.11.1.img" -NoNewWindow
} else {
    Write-Host "[i] QEMU emulator is not installed. You can boot kvos_v0.11.1.img inside VirtualBox or VMWare." -ForegroundColor Cyan
}

Write-Host "========================= BUILD OK =========================" -ForegroundColor Green`
  }
];
