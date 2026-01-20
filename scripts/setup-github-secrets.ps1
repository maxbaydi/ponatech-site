# Настройка GitHub Secrets для CI/CD
# Требуется: gh (GitHub CLI) авторизованный

Write-Host "⚙️ Настройка GitHub Secrets для CI/CD" -ForegroundColor Cyan
Write-Host "Убедитесь что вы авторизованы в GitHub CLI: gh auth login`n" -ForegroundColor Yellow

$repo = Read-Host "Введите репозиторий (формат: username/repo)"

# SSH данные
$sshHost = "9dd974540d1f.vps.myjino.ru"
$sshPort = "49239"
$sshUser = "root"
$domain = "ponatech.ru"
$repoUrl = "https://github.com/$repo.git"

Write-Host "`n📝 Чтение SSH приватного ключа..." -ForegroundColor Yellow
$sshKey = Get-Content "$env:USERPROFILE\.ssh\ponatech-jino" -Raw

Write-Host "🔐 Установка секретов..." -ForegroundColor Yellow

# Устанавливаем секреты
gh secret set SSH_HOST --repo $repo --body $sshHost
gh secret set SSH_PORT --repo $repo --body $sshPort
gh secret set SSH_USER --repo $repo --body $sshUser
gh secret set SSH_PRIVATE_KEY --repo $repo --body $sshKey
gh secret set REPO_URL --repo $repo --body $repoUrl
gh secret set DOMAIN --repo $repo --body $domain

Write-Host "`n✅ Секреты установлены!" -ForegroundColor Green
Write-Host @"

Установленные секреты:
- SSH_HOST: $sshHost
- SSH_PORT: $sshPort
- SSH_USER: $sshUser
- SSH_PRIVATE_KEY: [скрыт]
- REPO_URL: $repoUrl
- DOMAIN: $domain

Теперь при пуше в main ветку будет автоматический деплой.
"@ -ForegroundColor Gray
