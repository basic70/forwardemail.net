# Посібник з встановлення самостійного хостингу для переадресації електронної пошти в Ubuntu {#forward-email-self-hosting-installation-guide-for-ubuntu}

## Зміст {#table-of-contents}

* [Огляд](#overview)
* [Передумови](#prerequisites)
* [Системні вимоги](#system-requirements)
* [Покрокове встановлення](#step-by-step-installation)
  * [Крок 1: Початкове налаштування системи](#step-1-initial-system-setup)
  * [Крок 2: Налаштування DNS-резолверів](#step-2-configure-dns-resolvers)
  * [Крок 3: Встановлення системних залежностей](#step-3-install-system-dependencies)
  * [Крок 4: Встановлення пакетів Snap](#step-4-install-snap-packages)
  * [Крок 5: Встановлення Docker](#step-5-install-docker)
  * [Крок 6: Налаштування служби Docker](#step-6-configure-docker-service)
  * [Крок 7: Налаштування брандмауера](#step-7-configure-firewall)
  * [Крок 8: Клонування сховища електронної пошти для пересилання](#step-8-clone-forward-email-repository)
  * [Крок 9: Налаштування конфігурації середовища](#step-9-set-up-environment-configuration)
  * [Крок 10: Налаштуйте свій домен](#step-10-configure-your-domain)
  * [Крок 11: Згенеруйте SSL-сертифікати](#step-11-generate-ssl-certificates)
  * [Крок 12: Згенеруйте ключі шифрування](#step-12-generate-encryption-keys)
  * [Крок 13: Оновіть шляхи SSL у конфігурації](#step-13-update-ssl-paths-in-configuration)
  * [Крок 14: Налаштування базової автентифікації](#step-14-set-up-basic-authentication)
  * [Крок 15: Розгортання за допомогою Docker Compose](#step-15-deploy-with-docker-compose)
  * [Крок 16: Перевірка встановлення](#step-16-verify-installation)
* [Конфігурація після встановлення](#post-installation-configuration)
  * [Налаштування DNS-записів](#dns-records-setup)
  * [Перший вхід](#first-login)
* [Конфігурація резервного копіювання](#backup-configuration)
  * [Налаштування резервного копіювання, сумісного з S3](#set-up-s3-compatible-backup)
  * [Налаштування резервного копіювання завдань Cron](#set-up-backup-cron-jobs)
* [Конфігурація автоматичного оновлення](#auto-update-configuration)
* [Технічне обслуговування та моніторинг](#maintenance-and-monitoring)
  * [Розташування журналів](#log-locations)
  * [Регулярні завдання з технічного обслуговування](#regular-maintenance-tasks)
  * [Поновлення сертифіката](#certificate-renewal)
* [Усунення несправностей](#troubleshooting)
  * [Поширені проблеми](#common-issues)
  * [Отримання допомоги](#getting-help)
* [Найкращі практики безпеки](#security-best-practices)
* [Висновок](#conclusion)

## Огляд {#overview}

Цей посібник містить покрокові інструкції щодо встановлення самостійно розміщеного рішення Forward Email на системах Ubuntu. Цей посібник спеціально розроблений для версій Ubuntu 20.04, 22.04 та 24.04 LTS.

## Передумови {#prerequisites}

Перш ніж розпочати встановлення, переконайтеся, що у вас є:

* **Сервер Ubuntu**: 20.04, 22.04 або 24.04 LTS
* **Root-доступ**: Ви повинні мати можливість виконувати команди від імені root (доступ sudo)
* **Доменне ім'я**: Домен, яким ви керуєте з доступом до керування DNS
* **Чистий сервер**: Рекомендується використовувати чисту інсталяцію Ubuntu
* **Підключення до Інтернету**: Потрібне для завантаження пакетів та образів Docker

## Системні вимоги {#system-requirements}

* **ОЗП**: Мінімум 2 ГБ (рекомендовано 4 ГБ для виробничої версії)
* **Сховище**: Мінімум 20 ГБ доступного простору (рекомендовано 50 ГБ+ для виробничої версії)
* **ЦП**: Мінімум 1 віртуальний ЦП (рекомендовано 2+ віртуальних ЦП для виробничої версії)
* **Мережа**: Публічна IP-адреса з доступними такими портами:
* 22 (SSH)
* 25 (SMTP)
* 80 (HTTP)
* 443 (HTTPS)
* 465 (SMTPS)
* 993 (IMAPS)
* 995 (POP3S)

## Покрокова інструкція з встановлення {#step-by-step-installation}

### Крок 1: Початкове налаштування системи {#step-1-initial-system-setup}

Спочатку переконайтеся, що ваша система оновлена, і перейдіть до root-користувача:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Switch to root user (required for the installation)
sudo su -
```

### Крок 2: Налаштування DNS-резолверів {#step-2-configure-dns-resolvers}

Налаштуйте свою систему для використання DNS-серверів Cloudflare для надійної генерації сертифікатів:

```bash
# Stop and disable systemd-resolved if running
if systemctl is-active --quiet systemd-resolved; then
    rm /etc/resolv.conf
    systemctl stop systemd-resolved
    systemctl disable systemd-resolved
    systemctl mask systemd-resolved
fi

# Configure Cloudflare DNS resolvers
tee /etc/resolv.conf > /dev/null <<EOF
nameserver 1.1.1.1
nameserver 2606:4700:4700::1111
nameserver 1.0.0.1
nameserver 2606:4700:4700::1001
nameserver 8.8.8.8
nameserver 2001:4860:4860::8888
nameserver 8.8.4.4
nameserver 2001:4860:4860::8844
EOF
```

### Крок 3: Встановлення системних залежностей {#step-3-install-system-dependencies}

Встановіть необхідні пакети для пересилання електронної пошти:

```bash
# Update package list
apt-get update -y

# Install basic dependencies
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    git \
    openssl \
    docker-compose \
    snapd
```

### Крок 4: Встановлення пакетів Snap {#step-4-install-snap-packages}

Встановіть AWS CLI та Certbot через snap:

```bash
# Install AWS CLI
snap install aws-cli --classic

# Install Certbot and DNS plugin
snap install certbot --classic
snap set certbot trust-plugin-with-root=ok
snap install certbot-dns-cloudflare
```

### Крок 5: Встановлення Docker {#step-5-install-docker}

Встановлення Docker CE та Docker Compose:

```bash
# Add Docker's official GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | tee /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list

# Update package index and install Docker
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify Docker installation
docker --version
docker compose version
```

### Крок 6: Налаштування служби Docker {#step-6-configure-docker-service}

Переконайтеся, що Docker запускається автоматично та працює:

```bash
# Enable and start Docker service
systemctl unmask docker
systemctl enable docker
systemctl start docker

# Verify Docker is running
docker info
```

Якщо Docker не запускається, спробуйте запустити його вручну:

```bash
# Alternative startup method if systemctl fails
nohup dockerd >/dev/null 2>/dev/null &
sleep 5
docker info
```

### Крок 7: Налаштування брандмауера {#step-7-configure-firewall}

Налаштуйте брандмауер UFW для захисту вашого сервера:

```bash
# Set default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (important - don't lock yourself out!)
ufw allow 22/tcp

# Allow email-related ports
ufw allow 25/tcp    # SMTP
ufw allow 80/tcp    # HTTP (for Let's Encrypt)
ufw allow 443/tcp   # HTTPS
ufw allow 465/tcp   # SMTPS
ufw allow 993/tcp   # IMAPS
ufw allow 995/tcp   # POP3S
ufw allow 2993/tcp  # IMAP (alternative port)
ufw allow 2995/tcp  # POP3 (alternative port)
ufw allow 3456/tcp  # Custom service port
ufw allow 4000/tcp  # Custom service port
ufw allow 5000/tcp  # Custom service port

# Allow local database connections
ufw allow from 127.0.0.1 to any port 27017  # MongoDB
ufw allow from 127.0.0.1 to any port 6379   # Redis

# Enable firewall
echo "y" | ufw enable

# Check firewall status
ufw status numbered
```

### Крок 8: Клонування сховища електронної пошти для пересилання {#step-8-clone-forward-email-repository}

Завантажте вихідний код пересилання електронної пошти:

```bash
# Set up variables
REPO_FOLDER_NAME="forwardemail.net"
REPO_URL="https://github.com/forwardemail/forwardemail.net.git"
ROOT_DIR="/root/$REPO_FOLDER_NAME"

# Clone the repository
git clone "$REPO_URL" "$ROOT_DIR"
cd "$ROOT_DIR"

# Verify the clone was successful
ls -la
```

### Крок 9: Налаштування конфігурації середовища {#step-9-set-up-environment-configuration}

Підготуйте конфігурацію середовища:

```bash
# Set up directory variables
SELF_HOST_DIR="$ROOT_DIR/self-hosting"
ENV_FILE_DEFAULTS=".env.defaults"
ENV_FILE=".env"

# Copy default environment file
cp "$ROOT_DIR/$ENV_FILE_DEFAULTS" "$SELF_HOST_DIR/$ENV_FILE"

# Create SSL directory
mkdir -p "$SELF_HOST_DIR/ssl"

# Create database directories
mkdir -p "$SELF_HOST_DIR/sqlite-data"
mkdir -p "$SELF_HOST_DIR/mongo-backups"
mkdir -p "$SELF_HOST_DIR/redis-backups"
```

### Крок 10: Налаштуйте свій домен {#step-10-configure-your-domain}

Встановіть ім'я вашого домену та оновіть змінні середовища:

```bash
# Replace 'yourdomain.com' with your actual domain
DOMAIN="yourdomain.com"

# Function to update environment file
update_env_file() {
  local key="$1"
  local value="$2"

  if grep -qE "^${key}=" "$SELF_HOST_DIR/$ENV_FILE"; then
    sed -i -E "s|^${key}=.*|${key}=${value}|" "$SELF_HOST_DIR/$ENV_FILE"
  else
    echo "${key}=${value}" >> "$SELF_HOST_DIR/$ENV_FILE"
  fi
}

# Update domain-related environment variables
update_env_file "DOMAIN" "$DOMAIN"
update_env_file "NODE_ENV" "production"
update_env_file "HTTP_PROTOCOL" "https"
update_env_file "WEB_HOST" "$DOMAIN"
update_env_file "WEB_PORT" "443"
update_env_file "CALDAV_HOST" "caldav.$DOMAIN"
update_env_file "CARDDAV_HOST" "carddav.$DOMAIN"
update_env_file "API_HOST" "api.$DOMAIN"
update_env_file "APP_NAME" "$DOMAIN"
update_env_file "SMTP_HOST" "smtp.$DOMAIN"
update_env_file "SMTP_PORT" "465"
update_env_file "IMAP_HOST" "imap.$DOMAIN"
update_env_file "IMAP_PORT" "993"
update_env_file "POP3_HOST" "pop3.$DOMAIN"
update_env_file "POP3_PORT" "995"
update_env_file "MX_HOST" "mx.$DOMAIN"
update_env_file "SMTP_EXCHANGE_DOMAINS" "mx.$DOMAIN"
update_env_file "SELF_HOSTED" "true"
update_env_file "WEBSITE_URL" "$DOMAIN"
update_env_file "AUTH_BASIC_ENABLED" "true"
```

### Крок 11: Згенеруйте SSL-сертифікати {#step-11-generate-ssl-certificates}

#### Варіант A: Ручний виклик DNS (рекомендовано для більшості користувачів) {#option-a-manual-dns-challenge-recommended-for-most-users}

```bash
# Generate certificates using manual DNS challenge
certbot certonly \
  --manual \
  --agree-tos \
  --preferred-challenges dns \
  -d "*.$DOMAIN" \
  -d "$DOMAIN"
```

**Важливо**: Коли з’явиться запит, вам потрібно буде створити TXT-записи у вашому DNS. Ви можете зіткнутися з кількома проблемами для одного й того ж домену – **створіть їх УСІ**. Не видаляйте перший TXT-запис під час додавання другого.

#### Варіант B: DNS Cloudflare (якщо ви використовуєте Cloudflare) {#option-b-cloudflare-dns-if-you-use-cloudflare}

Якщо ваш домен використовує Cloudflare для DNS, ви можете автоматизувати генерацію сертифікатів:

```bash
# Create Cloudflare credentials file
cat > /root/.cloudflare.ini <<EOF
dns_cloudflare_email = "your-email@example.com"
dns_cloudflare_api_key = "your-cloudflare-global-api-key"
EOF

# Set proper permissions
chmod 600 /root/.cloudflare.ini

# Generate certificates automatically
certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /root/.cloudflare.ini \
  -d "$DOMAIN" \
  -d "*.$DOMAIN" \
  --non-interactive \
  --agree-tos \
  --email "your-email@example.com"
```

#### Копіювати сертифікати {#copy-certificates}

Після створення сертифікатів скопіюйте їх до каталогу програми:

```bash
# Copy certificates to application SSL directory
cp /etc/letsencrypt/live/$DOMAIN*/* "$SELF_HOST_DIR/ssl/"

# Verify certificates were copied
ls -la "$SELF_HOST_DIR/ssl/"
```

### Крок 12: Згенеруйте ключі шифрування {#step-12-generate-encryption-keys}

Створіть різні ключі шифрування, необхідні для безпечної роботи:

```bash
# Generate helper encryption key
helper_encryption_key=$(openssl rand -base64 32 | tr -d /=+ | cut -c -32)
update_env_file "HELPER_ENCRYPTION_KEY" "$helper_encryption_key"

# Generate SRS secret for email forwarding
srs_secret=$(openssl rand -base64 32 | tr -d /=+ | cut -c -32)
update_env_file "SRS_SECRET" "$srs_secret"

# Generate TXT encryption key
txt_encryption_key=$(openssl rand -hex 16)
update_env_file "TXT_ENCRYPTION_KEY" "$txt_encryption_key"

# Generate DKIM private key for email signing
openssl genrsa -f4 -out "$SELF_HOST_DIR/ssl/dkim.key" 2048
update_env_file "DKIM_PRIVATE_KEY_PATH" "/app/ssl/dkim.key"

# Generate webhook signature key
webhook_signature_key=$(openssl rand -hex 16)
update_env_file "WEBHOOK_SIGNATURE_KEY" "$webhook_signature_key"

# Set SMTP transport password
update_env_file "SMTP_TRANSPORT_PASS" "$(openssl rand -base64 32)"

echo "✅ All encryption keys generated successfully"
```

### Крок 13: Оновіть шляхи SSL у конфігурації {#step-13-update-ssl-paths-in-configuration}

Налаштуйте шляхи SSL-сертифіката у файлі середовища:

```bash
# Update SSL paths to point to the correct certificate files
sed -i -E \
  -e 's|^(.*_)?SSL_KEY_PATH=.*|\1SSL_KEY_PATH=/app/ssl/privkey.pem|' \
  -e 's|^(.*_)?SSL_CERT_PATH=.*|\1SSL_CERT_PATH=/app/ssl/fullchain.pem|' \
  -e 's|^(.*_)?SSL_CA_PATH=.*|\1SSL_CA_PATH=/app/ssl/chain.pem|' \
  "$SELF_HOST_DIR/$ENV_FILE"
```

### Крок 14: Налаштування базової автентифікації {#step-14-set-up-basic-authentication}

Створіть тимчасові базові облікові дані для автентифікації:

```bash
# Generate a secure random password
PASSWORD=$(openssl rand -base64 16)

# Update environment file with basic auth credentials
update_env_file "AUTH_BASIC_USERNAME" "admin"
update_env_file "AUTH_BASIC_PASSWORD" "$PASSWORD"

# Display credentials (save these!)
echo ""
echo "🔐 IMPORTANT: Save these login credentials!"
echo "=================================="
echo "Username: admin"
echo "Password: $PASSWORD"
echo "=================================="
echo ""
echo "You'll need these to access the web interface after installation."
echo ""
```

### Крок 15: Розгортання за допомогою Docker Compose {#step-15-deploy-with-docker-compose}

Запустіть усі служби пересилання електронної пошти:

```bash
# Set Docker Compose file path
DOCKER_COMPOSE_FILE="$SELF_HOST_DIR/docker-compose-self-hosted.yml"

# Stop any existing containers
docker compose -f "$DOCKER_COMPOSE_FILE" down

# Pull the latest images
docker compose -f "$DOCKER_COMPOSE_FILE" pull

# Start all services in detached mode
docker compose -f "$DOCKER_COMPOSE_FILE" up -d

# Wait a moment for services to start
sleep 10

# Check service status
docker compose -f "$DOCKER_COMPOSE_FILE" ps
```

### Крок 16: Перевірка встановлення {#step-16-verify-installation}

Перевірте, чи всі служби працюють коректно:

```bash
# Check Docker containers
docker ps

# Check service logs for any errors
docker compose -f "$DOCKER_COMPOSE_FILE" logs --tail=50

# Test web interface connectivity
curl -I https://$DOMAIN

# Check if ports are listening
netstat -tlnp | grep -E ':(25|80|443|465|587|993|995)'
```

## Конфігурація після встановлення {#post-installation-configuration}

### Налаштування DNS-записів {#dns-records-setup}

Вам потрібно налаштувати такі DNS-записи для вашого домену:

#### Запис MX {#mx-record}

```
@ MX 10 mx.yourdomain.com
```

#### Записи A {#a-records}

```
@ A YOUR_SERVER_IP
mx A YOUR_SERVER_IP
smtp A YOUR_SERVER_IP
imap A YOUR_SERVER_IP
pop3 A YOUR_SERVER_IP
api A YOUR_SERVER_IP
caldav A YOUR_SERVER_IP
carddav A YOUR_SERVER_IP
```

#### Запис SPF {#spf-record}

```
@ TXT "v=spf1 mx ~all"
```

#### Запис DKIM {#dkim-record}

Отримайте свій відкритий ключ DKIM:

```bash
# Extract DKIM public key
openssl rsa -in "$SELF_HOST_DIR/ssl/dkim.key" -pubout -outform DER | openssl base64 -A
```

Створити DNS-запис DKIM:

```
default._domainkey TXT "v=DKIM1; k=rsa; p=YOUR_DKIM_PUBLIC_KEY"
```

#### Запис DMARC {#dmarc-record}

```
_dmarc TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
```

### Перший вхід {#first-login}

1. Відкрийте веббраузер і перейдіть до `https://yourdomain.com`
2. Введіть основні облікові дані автентифікації, які ви зберегли раніше
3. Завершіть роботу майстра початкового налаштування
4. Створіть свій перший обліковий запис електронної пошти

## Конфігурація резервного копіювання {#backup-configuration}

### Налаштування резервного копіювання, сумісного з S3 {#set-up-s3-compatible-backup}

Налаштуйте автоматичне резервне копіювання на сховище, сумісне з S3:

```bash
# Create AWS credentials directory
mkdir -p ~/.aws

# Configure AWS credentials
cat > ~/.aws/credentials <<EOF
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
EOF

# Configure AWS settings
cat > ~/.aws/config <<EOF
[default]
region = auto
output = json
EOF

# For non-AWS S3 (like Cloudflare R2), add endpoint URL
echo "endpoint_url = YOUR_S3_ENDPOINT_URL" >> ~/.aws/config
```

### Налаштувати резервне копіювання завдань Cron {#set-up-backup-cron-jobs}

```bash
# Make backup scripts executable
chmod +x "$ROOT_DIR/self-hosting/scripts/backup-mongo.sh"
chmod +x "$ROOT_DIR/self-hosting/scripts/backup-redis.sh"

# Add MongoDB backup cron job (runs daily at midnight)
(crontab -l 2>/dev/null; echo "0 0 * * * $ROOT_DIR/self-hosting/scripts/backup-mongo.sh >> /var/log/mongo-backup.log 2>&1") | crontab -

# Add Redis backup cron job (runs daily at midnight)
(crontab -l 2>/dev/null; echo "0 0 * * * $ROOT_DIR/self-hosting/scripts/backup-redis.sh >> /var/log/redis-backup.log 2>&1") | crontab -

# Verify cron jobs were added
crontab -l
```

## Конфігурація автоматичного оновлення {#auto-update-configuration}

Налаштуйте автоматичні оновлення для вашої інсталяції Forward Email:

```bash
# Create auto-update command
DOCKER_UPDATE_CMD="docker compose -f $DOCKER_COMPOSE_FILE pull && docker compose -f $DOCKER_COMPOSE_FILE up -d"

# Add auto-update cron job (runs daily at 1 AM)
(crontab -l 2>/dev/null; echo "0 1 * * * $DOCKER_UPDATE_CMD >> /var/log/autoupdate.log 2>&1") | crontab -

# Verify the cron job was added
crontab -l
```

## Технічне обслуговування та моніторинг {#maintenance-and-monitoring}

### Розташування журналів {#log-locations}

* **Журнали Docker Compose**: `docker compose -f $DOCKER_COMPOSE_FILE logs`
* **Системні журнали**: `/var/log/syslog`
* **Журнали резервного копіювання**: `/var/log/mongo-backup.log`, `/var/log/redis-backup.log`
* **Журнали автоматичного оновлення**: `/var/log/autoupdate.log`

### Регулярні завдання з технічного обслуговування {#regular-maintenance-tasks}

1. **Моніторинг дискового простору**: `df -h`
2. **Перевірка стану служби**: `docker compose -f $DOCKER_COMPOSE_FILE ps`
3. **Перегляд журналів**: `docker compose -f $DOCKER_COMPOSE_FILE logs --tail=100`
4. **Оновлення системних пакетів**: `apt update && apt upgrade`
5. **Поновлення сертифікатів**: Сертифікати автоматично поновлюються, але відстежується термін їх дії

### Поновлення сертифіката {#certificate-renewal}

Сертифікати повинні автоматично поновлюватися, але за потреби ви можете поновити їх вручну:

```bash
# Manual certificate renewal
certbot renew

# Copy renewed certificates
cp /etc/letsencrypt/live/$DOMAIN*/* "$SELF_HOST_DIR/ssl/"

# Restart services to use new certificates
docker compose -f "$DOCKER_COMPOSE_FILE" restart
```

## Виправлення неполадок {#troubleshooting}

### Поширені проблеми {#common-issues}

#### 1. Служба Docker не запускається {#1-docker-service-wont-start}

```bash
# Check Docker status
systemctl status docker

# Try alternative startup
nohup dockerd >/dev/null 2>/dev/null &
```

#### 2. Не вдалося створити сертифікат {#2-certificate-generation-fails}

* Переконайтеся, що порти 80 та 443 доступні
* Перевірте, чи записи DNS вказують на ваш сервер
* Перевірте налаштування брандмауера

#### 3. Проблеми з доставкою електронної пошти {#3-email-delivery-issues}

* Перевірте правильність записів MX
* Перевірте записи SPF, DKIM та DMARC
* Переконайтеся, що порт 25 не заблоковано вашим хостинг-провайдером

#### 4. Веб-інтерфейс недоступний {#4-web-interface-not-accessible}

* Перевірте налаштування брандмауера: `ufw status`
* Перевірте SSL-сертифікати: `openssl x509 -in $SELF_HOST_DIR/ssl/fullchain.pem -text -noout`
* Перевірте основні дані для авторизації

### Отримання допомоги {#getting-help}

* **Документація**: <https://forwardemail.net/self-hosted>
* **Проблеми GitHub**: <https://github.com/forwardemail/forwardemail.net/issues>
* **Підтримка спільноти**: Перегляньте обговорення проєкту на GitHub

## Рекомендації щодо безпеки {#security-best-practices}

1. **Оновлюйте систему**: Регулярно оновлюйте Ubuntu та пакети
2. **Моніторинг журналів**: Налаштуйте моніторинг журналів та сповіщення
3. **Регулярне резервне копіювання**: Тестуйте процедури резервного копіювання та відновлення
4. **Використовуйте надійні паролі**: Створюйте надійні паролі для всіх облікових записів
5. **Увімкніть Fail2Ban**: Розгляньте можливість встановлення fail2ban для додаткової безпеки
6. **Регулярні аудити безпеки**: Періодично переглядайте свою конфігурацію

## Висновок {#conclusion}

Ваша власна інсталяція Forward Email тепер має бути завершена та працювати в Ubuntu. Пам’ятайте:

1. Правильно налаштуйте записи DNS
2. Перевірте надсилання та отримання електронної пошти
3. Налаштуйте регулярне резервне копіювання
4. Регулярно контролюйте свою систему
5. Оновлюйте інсталяцію

Щоб дізнатися про додаткові параметри налаштування та розширені функції, зверніться до офіційної документації Forward Email за адресою <https://forwardemail.net/self-hosted#configuration>.