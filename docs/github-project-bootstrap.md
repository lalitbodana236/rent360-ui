# GitHub Project Bootstrap

This setup creates sprint planning items directly in GitHub using `gh`.

## What it creates
1. Labels (module labels + sprint labels)
2. Milestones (`Sprint 1` ... `Sprint 12`)
3. Issues from `scripts/project-seed/issues.json`
4. Adds matching issues to project `RENT360`

## Prerequisites
1. Install GitHub CLI:
```powershell
winget install GitHub.cli
```
2. Authenticate:
```powershell
gh auth login
gh auth refresh --hostname github.com -s project
```

## Dry Run
```powershell
powershell -ExecutionPolicy Bypass -File scripts/bootstrap-github-project.ps1 -DryRun
```

## Execute
```powershell
powershell -ExecutionPolicy Bypass -File scripts/bootstrap-github-project.ps1 -Owner lalitbodana236 -Repo rent360-ui -ProjectTitle RENT360
```

## Customize Seed Backlog
Edit:
- `scripts/project-seed/issues.json`

Each item supports:
- `id`
- `title`
- `sprint`
- `labels`
- `body`

## Notes
1. Script is idempotent for issue titles (skips existing).
2. Project items are added for matching story IDs in title format `[MODULE-###]`.
3. If your project title changes, pass `-ProjectTitle` accordingly.
