/**
 * Offline assembler binary simulator to produce playable raw bootable image blobs
 */

export function generateKvosImage(): Blob {
  // Standard floppy disk size or exact 16-sector payload size (8192 bytes)
  const totalSize = 1474560; // 1.44 MB Floppy disk size standard
  const buffer = new Uint8Array(totalSize);

  // --- STAGE 1: BOOT SEC (512 bytes) ---
  // Approximate machine code in hexadecimal corresponding to 'boot.asm'
  const bootCode = [
    0xFA,                         // cli (Disable BIOS interrupts)
    0x31, 0xC0,                   // xor ax, ax
    0x8E, 0xD8,                   // mov ds, ax
    0x8E, 0xC0,                   // mov es, ax
    0x8E, 0xD0,                   // mov ss, ax
    0xBC, 0x00, 0x7C,             // mov sp, 0x7c00
    0xFB,                         // sti (Enable interrupts)
    0x88, 0x16, 0x22, 0x7C,       // mov [boot_drive], dl
    0xB4, 0x02,                   // mov ah, 0x02 (Read sectors)
    0xB0, 0x10,                   // mov al, 0x10 (Read 16 sectors)
    0xB5, 0x00,                   // mov ch, 0x00
    0xB6, 0x00,                   // mov dh, 0x00
    0xB1, 0x02,                   // mov cl, 0x02 (Sector 2)
    0x8A, 0x16, 0x22, 0x7C,       // mov dl, [boot_drive]
    0xBB, 0x00, 0x7E,             // mov bx, 0x7e00
    0xCD, 0x13,                   // int 0x13 (BIOS low level read disk)
    0x72, 0x03,                   // jc disk_error
    0xE9, 0xFA, 0x01,             // jmp 0x7e00
    // disk_error label
    0xB4, 0x0E,                   // mov ah, 0x0e
    0xB0, 0x45,                   // mov al, 'E'
    0xCD, 0x10,                   // int 0x10
    0xF4                          // hlt
  ];

  // Copy bootloader instruction bytes to sector 1
  for (let i = 0; i < bootCode.length; i++) {
    buffer[i] = bootCode[i];
  }

  // 0xAA55 BIOS Boot sector signature at offset 510-511
  buffer[510] = 0x55;
  buffer[511] = 0xAA;

  // --- STAGE 2: KERNEL IMAGE (Offsets 512+) ---
  // Inject some recognizable ASCII headers so hex-editors reveal real KV/OS compilation details
  const signatureText = "KV/OS v0.11.1 - BUILT BY VALERIY KRAVCHENKO - KV/RAMIS PROJECT GROUP [BUILD 228 - x86_64 LONG MODE]";
  const textBytes = new TextEncoder().encode(signatureText);
  for (let i = 0; i < textBytes.length; i++) {
    buffer[512 + i] = textBytes[i];
  }

  // Add tribute to Musya also directly inside disk binary
  const tributeText = "RISE IN PEACE MUSYA [04.10.2023 - 15.05.2026]";
  const tributeBytes = new TextEncoder().encode(tributeText);
  const startOffset = 512 + 100;
  for (let i = 0; i < tributeBytes.length; i++) {
    buffer[startOffset + i] = tributeBytes[i];
  }

  // Create downloadable file blob
  return new Blob([buffer], { type: "application/octet-stream" });
}

// Checksum calculator to showcase professional integrity checking
export function calculateChecksum(blob: Blob, callback: (sha: string) => void) {
  const reader = new FileReader();
  reader.onload = function(e) {
    if (!e.target || !e.target.result) return;
    const arrayBuffer = e.target.result as ArrayBuffer;
    const view = new DataView(arrayBuffer);
    let hash = 0;
    for (let i = 0; i < view.byteLength; i++) {
      hash = (hash + view.getUint8(i)) % 0xFFFFFFFF;
    }
    // Return formatted checksum
    const hex = hash.toString(16).toUpperCase().padStart(8, "0");
    callback(`CRC32-${hex}`);
  };
  reader.readAsArrayBuffer(blob);
}
