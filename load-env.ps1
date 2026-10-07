Get-Content .env.mcp | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') {
    [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim())
  }
}
Write-Host "Da nap token tu .env.mcp" -ForegroundColor Green