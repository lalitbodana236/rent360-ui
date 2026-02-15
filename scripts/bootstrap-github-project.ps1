param(
  [string]$Owner = 'lalitbodana236',
  [string]$Repo = 'rent360-ui',
  [string]$ProjectTitle = 'RENT360',
  [string]$SeedFile = 'scripts/project-seed/issues.json',
  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Require-Gh {
  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw 'GitHub CLI (gh) is not installed. Install it with: winget install GitHub.cli'
  }
}

function Ensure-Auth {
  $status = gh auth status --hostname github.com 2>$null
  if ($LASTEXITCODE -ne 0) {
    throw 'gh is not authenticated. Run: gh auth login'
  }
  # Do not force scope refresh in non-interactive mode; user may have already granted it.
}

function Ensure-Label {
  param([string]$Name, [string]$Color = '1f6feb')
  $labels = gh label list --repo "$Owner/$Repo" --limit 200 --json name | ConvertFrom-Json
  $existing = $labels | Where-Object { $_.name -eq $Name } | Select-Object -First 1
  if (-not $existing) {
    if ($DryRun) {
      Write-Host "[DRY-RUN] Create label: $Name"
    } else {
      gh label create $Name --repo "$Owner/$Repo" --color $Color --description "Auto-created by bootstrap script" | Out-Null
      Write-Host "Created label: $Name"
    }
  }
}

function Ensure-Milestone {
  param([string]$Title)
  $ms = gh api "repos/$Owner/$Repo/milestones?state=all&per_page=100" | ConvertFrom-Json
  $existing = $ms | Where-Object { $_.title -eq $Title } | Select-Object -First 1
  if ($existing) { return [int]$existing.number }

  if ($DryRun) {
    Write-Host "[DRY-RUN] Create milestone: $Title"
    return -1
  }

  $created = gh api "repos/$Owner/$Repo/milestones" -f title="$Title" -f state='open' | ConvertFrom-Json
  Write-Host "Created milestone: $Title"
  return [int]$created.number
}

function Get-ProjectNumber {
  $projects = gh project list --owner $Owner --format json | ConvertFrom-Json
  $project = $projects.projects | Where-Object { $_.title -eq $ProjectTitle } | Select-Object -First 1
  if (-not $project) {
    throw "Project '$ProjectTitle' not found under owner '$Owner'."
  }
  return [int]$project.number
}

function Issue-Exists {
  param([string]$Title)
  $issues = gh issue list --repo "$Owner/$Repo" --state all --limit 500 --search "\"$Title\" in:title" --json title | ConvertFrom-Json
  $found = $issues | Where-Object { $_.title -eq $Title } | Select-Object -First 1
  return [bool]$found
}

function Create-Issue {
  param(
    [pscustomobject]$Issue,
    [hashtable]$MilestoneMap
  )

  if (Issue-Exists -Title $Issue.title) {
    Write-Host "Skip existing issue: $($Issue.title)"
    return
  }

  $labelCsv = ($Issue.labels -join ',')
  $milestoneTitle = "Sprint $($Issue.sprint)"
  $milestoneNumber = $MilestoneMap[$milestoneTitle]

  if ($DryRun) {
    Write-Host "[DRY-RUN] Create issue: $($Issue.title)"
    return
  }

  if ($milestoneNumber -gt 0) {
    gh issue create --repo "$Owner/$Repo" --title "$($Issue.title)" --body "$($Issue.body)" --label "$labelCsv" --milestone "$milestoneTitle" | Out-Null
  } else {
    gh issue create --repo "$Owner/$Repo" --title "$($Issue.title)" --body "$($Issue.body)" --label "$labelCsv" | Out-Null
  }

  Write-Host "Created issue: $($Issue.title)"
}

function Add-Issues-To-Project {
  param([int]$ProjectNumber)

  $issues = gh issue list --repo "$Owner/$Repo" --state open --limit 500 --json url,title | ConvertFrom-Json
  foreach ($it in $issues) {
    if ($it.title -match '^\[(CORE|AUTH|DASH|PROP|TEN|PAY|SOC|MKT|COMM|REP|SET|OPS)-\d+\]') {
      if ($DryRun) {
        Write-Host "[DRY-RUN] Add to project: $($it.title)"
      } else {
        gh project item-add $ProjectNumber --owner $Owner --url $it.url 1>$null 2>$null
        Write-Host "Added to project: $($it.title)"
      }
    }
  }
}

Require-Gh
Ensure-Auth

if (-not (Test-Path $SeedFile)) {
  throw "Seed file not found: $SeedFile"
}

$seed = Get-Content -Raw -Path $SeedFile | ConvertFrom-Json

# Global labels
$globalLabels = @(
  'story','bug','backend','frontend','qa','core','auth','dashboard','properties','tenants','payments',
  'society','marketplace','communications','reports','settings','ops','priority-high'
)

# Sprint labels + milestones (1..12)
$sprintLabels = 1..12 | ForEach-Object { "sprint-$_" }

foreach ($label in $globalLabels + $sprintLabels) {
  Ensure-Label -Name $label
}

$milestoneMap = @{}
foreach ($i in 1..12) {
  $msTitle = "Sprint $i"
  $milestoneMap[$msTitle] = Ensure-Milestone -Title $msTitle
}

foreach ($issue in $seed) {
  Create-Issue -Issue $issue -MilestoneMap $milestoneMap
}

$projectNumber = Get-ProjectNumber
Add-Issues-To-Project -ProjectNumber $projectNumber

Write-Host "Done. Backlog bootstrap completed for $Owner/$Repo project '$ProjectTitle'."
if ($DryRun) {
  Write-Host 'Dry run mode was enabled. No changes were made.'
}
