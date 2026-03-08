$destination = Join-Path (Get-Location) 'public\about-us-source.html'

$html = (Invoke-WebRequest -Uri 'https://comem.vn/ve-co-mem' -UseBasicParsing).Content
$html = $html.Replace('<head>', "<head>`r`n    <base href=`"https://comem.vn/`" />")
$html = [regex]::Replace($html, '((?:src|href|action)=["''])/(?!/)', '$1https://comem.vn/')
$html = [regex]::Replace($html, 'url\(/', 'url(https://comem.vn/')

[System.IO.File]::WriteAllText($destination, $html, [System.Text.UTF8Encoding]::new($false))

Test-Path $destination
Get-Item $destination | Select-Object FullName, Length