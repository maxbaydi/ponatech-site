# Setup GitHub Secrets for CI/CD
# Requires: gh (GitHub CLI) authenticated

Write-Host "Setup GitHub Secrets for CI/CD" -ForegroundColor Cyan
Write-Host ""

$repo = Read-Host "Enter repository (format: username/repo)"

# SSH config
$sshHost = "9dd974540d1f.vps.myjino.ru"
$sshPort = "49239"
$sshUser = "root"
$domain = "ponatech.ru"

Write-Host ""
Write-Host "Reading SSH private key..." -ForegroundColor Yellow
$sshKey = Get-Content "$env:USERPROFILE\.ssh\ponatech-jino" -Raw

Write-Host ""
Write-Host "Enter Container Registry PAT (needs packages:read scope):" -ForegroundColor Yellow
Write-Host "Create at: https://github.com/settings/tokens/new?scopes=read:packages" -ForegroundColor Gray
$crPat = Read-Host "CR_PAT"

Write-Host ""
Write-Host "Setting secrets..." -ForegroundColor Yellow

# SSH secrets
gh secret set SSH_HOST --repo $repo --body $sshHost
gh secret set SSH_PORT --repo $repo --body $sshPort
gh secret set SSH_USER --repo $repo --body $sshUser
gh secret set SSH_PRIVATE_KEY --repo $repo --body $sshKey
gh secret set DOMAIN --repo $repo --body $domain

# Container Registry PAT
gh secret set CR_PAT --repo $repo --body $crPat

# Frontend build args
gh secret set NEXT_PUBLIC_API_URL --repo $repo --body "https://$domain"
gh secret set NEXT_PUBLIC_AUTH_API_URL --repo $repo --body "https://$domain/api/auth"
gh secret set NEXT_PUBLIC_CATALOG_API_URL --repo $repo --body "https://$domain/api/catalog"

Write-Host ""
Write-Host "Secrets configured!" -ForegroundColor Green
Write-Host ""
Write-Host "Configured secrets:" -ForegroundColor Gray
Write-Host "  SSH_HOST, SSH_PORT, SSH_USER, SSH_PRIVATE_KEY" -ForegroundColor Gray
Write-Host "  CR_PAT (Container Registry)" -ForegroundColor Gray
Write-Host "  NEXT_PUBLIC_API_URL, NEXT_PUBLIC_AUTH_API_URL, NEXT_PUBLIC_CATALOG_API_URL" -ForegroundColor Gray
Write-Host "  DOMAIN: $domain" -ForegroundColor Gray
Write-Host ""
Write-Host "Push to main branch will trigger build and deploy." -ForegroundColor Gray
