Add-Type -AssemblyName System.Drawing

$sourceDir = Join-Path $PSScriptRoot '..\assets\promo-screens'
$screens = @(
  @{ Source = '02-school-no-notch.png'; Target = '02-school-model-screen.png' },
  @{ Source = '02-ruc-pattern-phone.png'; Target = '03-ruc-model-screen.png' },
  @{ Source = '04-materials-no-notch.png'; Target = '04-materials-model-screen.png' }
)

foreach ($screen in $screens) {
  $sourcePath = Join-Path $sourceDir $screen.Source
  $targetPath = Join-Path $sourceDir $screen.Target
  $bitmap = [System.Drawing.Bitmap]::FromFile($sourcePath)
  try {
    $output = New-Object System.Drawing.Bitmap $bitmap
    try {
      $background = $output.GetPixel([int]($output.Width / 2), 42)
      $graphics = [System.Drawing.Graphics]::FromImage($output)
      try {
        $brush = New-Object System.Drawing.SolidBrush $background
        try {
          $graphics.FillRectangle($brush, 0, 0, $output.Width, 38)
        }
        finally {
          $brush.Dispose()
        }
      }
      finally {
        $graphics.Dispose()
      }
      $output.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
      $output.Dispose()
    }
  }
  finally {
    $bitmap.Dispose()
  }
}
