# Setup GitHub Secrets for CI/CD
# Requires: gh (GitHub CLI) authenticated

Write-Host "Setup GitHub Secrets for CI/CD" -ForegroundColor Cyan
Write-Host "Make sure you are logged in: gh auth login" -ForegroundColor Yellow
Write-Host ""

$repo = Read-Host "Enter repository (format: username/repo)"

# SSH config
$sshHost = "9dd974540d1f.vps.myjino.ru"
$sshPort = "49239"
$sshUser = "root"
$domain = "ponatech.ru"
$repoUrl = "https://github.com/$repo.git"

Write-Host ""
Write-Host "Reading SSH private key..." -ForegroundColor Yellow
$sshKey = Get-Content "$env:USERPROFILE\.ssh\ponatech-jino" -Raw

Write-Host "Setting secrets..." -ForegroundColor Yellow

gh secret set SSH_HOST --repo $repo --body $sshHost
gh secret set SSH_PORT --repo $repo --body $sshPort
gh secret set SSH_USER --repo $repo --body $sshUser
gh secret set SSH_PRIVATE_KEY --repo $repo --body $sshKey
gh secret set REPO_URL --repo $repo --body $repoUrl
gh secret set DOMAIN --repo $repo --body $domain

Write-Host ""
Write-Host "Secrets configured!" -ForegroundColor Green
Write-Host ""
Write-Host "Configured secrets:" -ForegroundColor Gray
Write-Host "  SSH_HOST: $sshHost" -ForegroundColor Gray
Write-Host "  SSH_PORT: $sshPort" -ForegroundColor Gray
Write-Host "  SSH_USER: $sshUser" -ForegroundColor Gray
Write-Host "  SSH_PRIVATE_KEY: [hidden]" -ForegroundColor Gray
Write-Host "  REPO_URL: $repoUrl" -ForegroundColor Gray
Write-Host "  DOMAIN: $domain" -ForegroundColor Gray
Write-Host ""
Write-Host "Push to main branch will trigger automatic deployment." -ForegroundColor Gray
