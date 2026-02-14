param(
  [string]$ProjectName = 'rent360',
  [string]$PublishBranch = 'gh-pages'
)

$ErrorActionPreference = 'Stop'

function Get-RepoUrl {
  $remoteNames = @(git remote 2>$null)
  if (-not $remoteNames -or $remoteNames.Count -eq 0) {
    throw 'No git remotes found. Add a remote first (origin or rent360).'
  }

  $preferred = @('origin', 'rent360')
  $targetRemote = $null

  foreach ($name in $preferred) {
    if ($remoteNames -contains $name) {
      $targetRemote = $name
      break
    }
  }

  if (-not $targetRemote) {
    $targetRemote = $remoteNames[0]
  }

  $remoteUrl = (git remote get-url $targetRemote 2>$null)
  if (-not $remoteUrl) {
    throw "Could not read URL for remote '$targetRemote'."
  }

  return $remoteUrl.Trim()
}

function Get-RepoName([string]$remoteUrl) {
  if ($remoteUrl -match '[:/]([^/]+?)\.git$') {
    return $matches[1]
  }

  if ($remoteUrl -match '/([^/]+)$') {
    return $matches[1]
  }

  throw "Could not parse repository name from remote URL: $remoteUrl"
}

$repoUrl = Get-RepoUrl
$repoName = Get-RepoName $repoUrl
$baseHref = "/$repoName/"

Write-Host "[deploy] Repo URL: $repoUrl"
Write-Host "[deploy] Repo Name: $repoName"
Write-Host "[deploy] Base href: $baseHref"
Write-Host "[deploy] Publish branch: $PublishBranch"

if (-not (Test-Path 'node_modules')) {
  Write-Host '[deploy] node_modules not found. Running npm install...'
  cmd /c npm install
}

Write-Host '[deploy] Building production bundle...'
cmd /c "npm run build -- --configuration ghpages --base-href $baseHref"

$distPath = Join-Path 'dist' $ProjectName
if (-not (Test-Path $distPath)) {
  throw "Build output not found at $distPath"
}

$noJekyll = Join-Path $distPath '.nojekyll'
Set-Content -Path $noJekyll -Value ''

Write-Host '[deploy] Publishing dist...'
cmd /c "npx angular-cli-ghpages@1.0.7 --dir=$distPath --branch=$PublishBranch --repo=$repoUrl --no-silent"

Write-Host '[deploy] Done.'
