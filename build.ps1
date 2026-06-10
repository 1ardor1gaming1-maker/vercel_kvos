Write-Host "Compiling KV/OS sources..." -ForegroundColor Cyan

if (Test-Path "boot.bin") { Remove-Item "boot.bin" }
if (Test-Path "kernel.bin") { Remove-Item "kernel.bin" }
if (Test-Path "kvos.img") { Remove-Item "kvos.img" }

.\nasm.exe -f bin boot.asm -o boot.bin
if ($LastExitCode -ne 0) {
    Write-Host "Error compiling boot.asm" -ForegroundColor Red
    exit
}

.\nasm.exe -f bin kernel.asm -o kernel.bin
if ($LastExitCode -ne 0) {
    Write-Host "Error compiling kernel.asm" -ForegroundColor Red
    exit
}

if ((Test-Path "boot.bin") -and (Test-Path "kernel.bin")) {
    $bootBytes = [System.IO.File]::ReadAllBytes((Get-Item "boot.bin").FullName)
    $kernelBytes = [System.IO.File]::ReadAllBytes((Get-Item "kernel.bin").FullName)
    
    $finalImage = New-Object byte[] ($bootBytes.Length + $kernelBytes.Length)
    [Array]::Copy($bootBytes, 0, $finalImage, 0, $bootBytes.Length)
    [Array]::Copy($kernelBytes, 0, $finalImage, $bootBytes.Length, $kernelBytes.Length)
    
    [System.IO.File]::WriteAllBytes((Get-Item ".").FullName + "\kvos.img", $finalImage)
    Write-Host "Success! kvos.img generated accurately." -ForegroundColor Green
} else {
    Write-Host "Compilation failed. Binary files missing." -ForegroundColor Red
}
