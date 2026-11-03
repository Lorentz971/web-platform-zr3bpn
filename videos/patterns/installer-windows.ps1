# Installe tout ce qu'il faut pour analyse_montage.py sous Windows 10/11.
# Clic droit sur ce fichier > « Exécuter avec PowerShell » (ou : powershell -ExecutionPolicy Bypass -File installer-windows.ps1)
Set-Location $PSScriptRoot
Write-Host "== 1/3 Logiciels : Python, ffmpeg, Tesseract"
winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements
winget install -e --id Gyan.FFmpeg --accept-source-agreements --accept-package-agreements
winget install -e --id UB-Mannheim.TesseractOCR --accept-source-agreements --accept-package-agreements
# Langue française pour Tesseract
$tess = "C:\Program Files\Tesseract-OCR\tessdata"
if (Test-Path $tess) {
  Invoke-WebRequest "https://github.com/tesseract-ocr/tessdata_fast/raw/main/fra.traineddata" -OutFile "$tess\fra.traineddata"
}
# Recharger le PATH pour voir les nouveaux logiciels
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "== 2/3 Modules Python"
py -m pip install --upgrade -r requirements.txt
Write-Host "== 3/3 Vérification"
py verifier_installation.py
Read-Host "Terminé. Appuyez sur Entrée pour fermer"
