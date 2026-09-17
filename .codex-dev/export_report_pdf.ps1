$sourceDocx = Get-ChildItem -Path "D:\cmtc\CMTC-AI-System" -Recurse -Filter "*CMTC_AI_KMS.docx" | Select-Object -First 1
$docxPath = "D:\cmtc\CMTC-AI-System\.codex-dev\report-render-word\report.docx"
$pdfPath = "D:\cmtc\CMTC-AI-System\.codex-dev\report-render-word\report.pdf"
$outDir = Split-Path -Parent $pdfPath
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
Copy-Item -LiteralPath $sourceDocx.FullName -Destination $docxPath -Force

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $document = $word.Documents.Open($docxPath, $false, $true)
    $document.ExportAsFixedFormat($pdfPath, 17)
    $document.Close($false)
} finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
Write-Output "done"
