param(
  [string]$EnvFile = ".env"
)

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Docker is required but not installed. Aborting."
  exit 1
}

if (Test-Path -Path ".env.example" -PathType Leaf -and -not (Test-Path -Path $EnvFile -PathType Leaf)) {
  Copy-Item -Path .env.example -Destination $EnvFile
  Write-Output "Copied .env.example to $EnvFile - please review before running in production."
}

Write-Output "Starting full stack with: docker compose up --build -d"
docker compose up --build -d

$healthUrl = 'http://localhost:8000/health'
$tries = 30
$delay = 2
for ($i = 0; $i -lt $tries; $i++) {
  try {
    $resp = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 5
    if ($resp.StatusCode -eq 200) {
      Write-Output "Backend is healthy."
      exit 0
    }
  } catch {
    Write-Output "Attempt $($i+1)/$tries: backend not healthy yet..."
  }
  Start-Sleep -Seconds $delay
}

Write-Error "Timed out waiting for backend to become healthy."
exit 2
