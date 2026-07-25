Add-Type -AssemblyName System.Drawing

$sourceDir = Join-Path $PSScriptRoot '..\assets\promo-screens'
$names = @(
  '01-school-select-full.png',
  '02-pattern-preview-full.png',
  '03-materials-full.png'
)

foreach ($name in $names) {
  $sourcePath = Join-Path $sourceDir $name
  $targetPath = Join-Path $sourceDir ($name -replace '-full', '-phone')
  $source = [System.Drawing.Bitmap]::FromFile($sourcePath)
  try {
    $crop = New-Object System.Drawing.Rectangle 695, 90, 365, 786
    $target = $source.Clone($crop, $source.PixelFormat)
    try {
      $target.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
      $target.Dispose()
    }
  }
  finally {
    $source.Dispose()
  }
}
