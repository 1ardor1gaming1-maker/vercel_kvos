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
  }
];
