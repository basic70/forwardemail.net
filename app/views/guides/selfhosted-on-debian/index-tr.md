# Debian {#forward-email-self-hosting-installation-guide-for-debian} için E-postayı İlet Kendi Kendine Barındırma Kurulum Kılavuzu

## İçindekiler {#table-of-contents}

* [Genel Bakış](#overview)
* [Ön koşullar](#prerequisites)
* [Sistem Gereksinimleri](#system-requirements)
* [Adım Adım Kurulum](#step-by-step-installation)
  * [Adım 1: İlk Sistem Kurulumu](#step-1-initial-system-setup)
  * [Adım 2: DNS Çözücülerini Yapılandırın](#step-2-configure-dns-resolvers)
  * [Adım 3: Sistem Bağımlılıklarını Yükleyin](#step-3-install-system-dependencies)
  * [Adım 4: Snapd'i Kurun ve Yapılandırın](#step-4-install-and-configure-snapd)
  * [Adım 5: Snap Paketlerini Yükleyin](#step-5-install-snap-packages)
  * [Adım 6: Docker'ı yükleyin](#step-6-install-docker)
  * [Adım 7: Docker Hizmetini Yapılandırın](#step-7-configure-docker-service)
  * [Adım 8: UFW Güvenlik Duvarını Kurun ve Yapılandırın](#step-8-install-and-configure-ufw-firewall)
  * [Adım 9: Forward E-posta Deposunu Klonlayın](#step-9-clone-forward-email-repository)
  * [Adım 10: Ortam Yapılandırmasını Ayarlayın](#step-10-set-up-environment-configuration)
  * [Adım 11: Alan Adınızı Yapılandırın](#step-11-configure-your-domain)
  * [Adım 12: SSL Sertifikaları Oluşturun](#step-12-generate-ssl-certificates)
  * [Adım 13: Şifreleme Anahtarlarını Oluşturun](#step-13-generate-encryption-keys)
  * [Adım 14: Yapılandırmada SSL Yollarını Güncelleyin](#step-14-update-ssl-paths-in-configuration)
  * [Adım 15: Temel Kimlik Doğrulamayı Ayarlayın](#step-15-set-up-basic-authentication)
  * [Adım 16: Docker Compose ile dağıtım](#step-16-deploy-with-docker-compose)
  * [Adım 17: Kurulumu Doğrulayın](#step-17-verify-installation)
* [Kurulum Sonrası Yapılandırma](#post-installation-configuration)
  * [DNS Kayıtları Kurulumu](#dns-records-setup)
  * [İlk Giriş](#first-login)
* [Yedekleme Yapılandırması](#backup-configuration)
  * [S3 Uyumlu Yedekleme Kurulumu](#set-up-s3-compatible-backup)
  * [Yedekleme Cron İşlerini Ayarlayın](#set-up-backup-cron-jobs)
* [Otomatik Güncelleme Yapılandırması](#auto-update-configuration)
* [Debian'a Özgü Hususlar](#debian-specific-considerations)
  * [Paket Yönetimi Farklılıkları](#package-management-differences)
  * [Hizmet Yönetimi](#service-management)
  * [Ağ Yapılandırması](#network-configuration)
* [Bakım ve İzleme](#maintenance-and-monitoring)
  * [Günlük Konumları](#log-locations)
  * [Düzenli Bakım Görevleri](#regular-maintenance-tasks)
  * [Sertifika Yenileme](#certificate-renewal)
* [Sorun giderme](#troubleshooting)
  * [Debian'a Özgü Sorunlar](#debian-specific-issues)
  * [Ortak Sorunlar](#common-issues)
  * [Yardım Alma](#getting-help)
* [Güvenlik En İyi Uygulamaları](#security-best-practices)
* [Çözüm](#conclusion)

## Genel Bakış {#overview}

Bu kılavuz, Forward Email'in kendi barındırdığı çözümün Debian sistemlerine kurulumu için adım adım talimatlar sunar. Bu kılavuz, özellikle Debian 11 (Bullseye) ve Debian 12 (Bookworm) için tasarlanmıştır.

## Önkoşullar {#prerequisites}

Kuruluma başlamadan önce şunlara sahip olduğunuzdan emin olun:

* **Debian Sunucusu**: Sürüm 11 (Bullseye) veya 12 (Bookworm)
* **Kök Erişimi**: Komutları kök olarak çalıştırabilmeniz gerekir (sudo erişimi)
* **Alan Adı**: DNS yönetim erişimiyle kontrol ettiğiniz bir alan
* **Temiz Sunucu**: Yeni bir Debian kurulumu kullanmanız önerilir
* **İnternet Bağlantısı**: Paketleri ve Docker imajlarını indirmek için gereklidir

## Sistem Gereksinimleri {#system-requirements}

* **RAM**: Minimum 2 GB (üretim için 4 GB önerilir)
* **Depolama**: Minimum 20 GB kullanılabilir alan (üretim için 50 GB+ önerilir)
* **CPU**: Minimum 1 vCPU (üretim için 2+ vCPU önerilir)
* **Ağ**: Aşağıdaki bağlantı noktalarına erişilebilen genel IP adresi:
* 22 (SSH)
* 25 (SMTP)
* 80 (HTTP)
* 443 (HTTPS)
* 465 (SMTPS)
* 993 (IMAPS)
* 995 (POP3S)

## Adım Adım Kurulum {#step-by-step-installation}

### Adım 1: İlk Sistem Kurulumu {#step-1-initial-system-setup}

Öncelikle sisteminizin güncel olduğundan emin olun ve root kullanıcısına geçin:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Switch to root user (required for the installation)
sudo su -
```

### Adım 2: DNS Çözücülerini Yapılandırın {#step-2-configure-dns-resolvers}

Güvenilir sertifika üretimi için sisteminizi Cloudflare'in DNS sunucularını kullanacak şekilde yapılandırın:

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

### Adım 3: Sistem Bağımlılıklarını Yükleyin {#step-3-install-system-dependencies}

Debian'da E-postayı İletmek için gerekli paketleri kurun:

```bash
# Update package list
apt-get update -y

# Install basic dependencies (Debian-specific package list)
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    git \
    openssl \
    lsb-release \
    apt-transport-https \
    software-properties-common
```

### Adım 4: Snapd'i Kurun ve Yapılandırın {#step-4-install-and-configure-snapd}

Debian varsayılan olarak snapd'yi içermez, bu yüzden onu kurup yapılandırmamız gerekir:

```bash
# Install snapd
apt-get install -y snapd

# Enable and start snapd service
systemctl enable snapd
systemctl start snapd

# Create symlink for snap to work properly
ln -sf /var/lib/snapd/snap /snap

# Wait for snapd to be ready
sleep 10

# Verify snapd is working
snap version
```

### Adım 5: Snap Paketlerini Yükleyin {#step-5-install-snap-packages}

AWS CLI ve Certbot'u snap üzerinden kurun:

```bash
# Install AWS CLI
snap install aws-cli --classic

# Install Certbot and DNS plugin
snap install certbot --classic
snap set certbot trust-plugin-with-root=ok
snap install certbot-dns-cloudflare

# Verify installations
aws --version
certbot --version
```

### Adım 6: Docker'ı yükleyin {#step-6-install-docker}

Debian'a Docker CE ve Docker Compose'u kurun:

```bash
# Add Docker's official GPG key (Debian-specific)
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | tee /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# Add Docker repository (Debian-specific)
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list

# Update package index and install Docker
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Install standalone docker-compose as fallback (if plugin doesn't work)
if ! command -v docker-compose &> /dev/null; then
    apt-get install -y docker-compose
fi

# Verify Docker installation
docker --version
docker compose version || docker-compose --version
```

### Adım 7: Docker Hizmetini Yapılandırın {#step-7-configure-docker-service}

Docker'ın otomatik olarak başladığından ve çalıştığından emin olun:

```bash
# Enable and start Docker service
systemctl unmask docker
systemctl enable docker
systemctl start docker

# Verify Docker is running
docker info
```

Docker başlatılamazsa, manuel olarak başlatmayı deneyin:

```bash
# Alternative startup method if systemctl fails
nohup dockerd >/dev/null 2>/dev/null &
sleep 5
docker info
```

### Adım 8: UFW Güvenlik Duvarını Kurun ve Yapılandırın {#step-8-install-and-configure-ufw-firewall}

Debian'ın minimal kurulumları UFW'yi içermeyebilir, bu yüzden önce onu kurun:

```bash
# Install UFW if not present
if ! command -v ufw &> /dev/null; then
    apt-get update -y
    apt-get install -y ufw
fi

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

### Adım 9: İletme E-posta Deposunu Klonla {#step-9-clone-forward-email-repository}

Forward Email kaynak kodunu indirin:

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

### Adım 10: Ortam Yapılandırmasını Ayarlayın {#step-10-set-up-environment-configuration}

Ortam yapılandırmasını hazırlayın:

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

### Adım 11: Etki Alanınızı Yapılandırın {#step-11-configure-your-domain}

Alan adınızı ayarlayın ve ortam değişkenlerini güncelleyin:

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

### Adım 12: SSL Sertifikaları Oluşturun {#step-12-generate-ssl-certificates}

#### Seçenek A: Manuel DNS Sorgulaması (Çoğu kullanıcı için önerilir) {#option-a-manual-dns-challenge-recommended-for-most-users}

```bash
# Generate certificates using manual DNS challenge
certbot certonly \
  --manual \
  --agree-tos \
  --preferred-challenges dns \
  -d "*.$DOMAIN" \
  -d "$DOMAIN"
```

**Önemli**: İstendiğinde, DNS'inizde TXT kayıtları oluşturmanız gerekecektir. Aynı alan adı için birden fazla sorgu görebilirsiniz - **TÜMÜNÜ oluşturun**. İkinci TXT kaydını eklerken ilk TXT kaydını kaldırmayın.

#### Seçenek B: Cloudflare DNS (Cloudflare kullanıyorsanız) {#option-b-cloudflare-dns-if-you-use-cloudflare}

Alan adınız DNS için Cloudflare kullanıyorsa, sertifika oluşturmayı otomatikleştirebilirsiniz:

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

#### Sertifikaları Kopyala {#copy-certificates}

Sertifika oluşturulduktan sonra bunları uygulama dizinine kopyalayın:

```bash
# Copy certificates to application SSL directory
cp /etc/letsencrypt/live/$DOMAIN*/* "$SELF_HOST_DIR/ssl/"

# Verify certificates were copied
ls -la "$SELF_HOST_DIR/ssl/"
```

### Adım 13: Şifreleme Anahtarlarını Oluşturun {#step-13-generate-encryption-keys}

Güvenli işlem için gereken çeşitli şifreleme anahtarlarını oluşturun:

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

### Adım 14: {#step-14-update-ssl-paths-in-configuration} Yapılandırmasında SSL Yollarını Güncelleyin

Ortam dosyasında SSL sertifika yollarını yapılandırın:

```bash
# Update SSL paths to point to the correct certificate files
sed -i -E \
  -e 's|^(.*_)?SSL_KEY_PATH=.*|\1SSL_KEY_PATH=/app/ssl/privkey.pem|' \
  -e 's|^(.*_)?SSL_CERT_PATH=.*|\1SSL_CERT_PATH=/app/ssl/fullchain.pem|' \
  -e 's|^(.*_)?SSL_CA_PATH=.*|\1SSL_CA_PATH=/app/ssl/chain.pem|' \
  "$SELF_HOST_DIR/$ENV_FILE"
```

### Adım 15: Temel Kimlik Doğrulamasını Ayarlayın {#step-15-set-up-basic-authentication}

Geçici temel kimlik doğrulama kimlik bilgilerini oluşturun:

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

### Adım 16: Docker Compose ile dağıtım {#step-16-deploy-with-docker-compose}

Tüm E-posta İletme hizmetlerini başlatın:

```bash
# Set Docker Compose file path
DOCKER_COMPOSE_FILE="$SELF_HOST_DIR/docker-compose-self-hosted.yml"

# Stop any existing containers
if command -v docker-compose &> /dev/null; then
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
else
    docker compose -f "$DOCKER_COMPOSE_FILE" down
fi

# Pull the latest images
if command -v docker-compose &> /dev/null; then
    docker-compose -f "$DOCKER_COMPOSE_FILE" pull
else
    docker compose -f "$DOCKER_COMPOSE_FILE" pull
fi

# Start all services in detached mode
if command -v docker-compose &> /dev/null; then
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
else
    docker compose -f "$DOCKER_COMPOSE_FILE" up -d
fi

# Wait a moment for services to start
sleep 10

# Check service status
if command -v docker-compose &> /dev/null; then
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
else
    docker compose -f "$DOCKER_COMPOSE_FILE" ps
fi
```

### Adım 17: Kurulumu Doğrulayın {#step-17-verify-installation}

Tüm servislerin doğru şekilde çalıştığını kontrol edin:

```bash
# Check Docker containers
docker ps

# Check service logs for any errors
if command -v docker-compose &> /dev/null; then
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=50
else
    docker compose -f "$DOCKER_COMPOSE_FILE" logs --tail=50
fi

# Test web interface connectivity
curl -I https://$DOMAIN

# Check if ports are listening
ss -tlnp | grep -E ':(25|80|443|465|587|993|995)'
```

## Kurulum Sonrası Yapılandırma {#post-installation-configuration}

### DNS Kayıtları Kurulumu {#dns-records-setup}

Alan adınız için aşağıdaki DNS kayıtlarını yapılandırmanız gerekir:

#### MX Kaydı {#mx-record}

```
@ MX 10 mx.yourdomain.com
```

#### A Kayıtları {#a-records}

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

#### SPF Kaydı {#spf-record}

```
@ TXT "v=spf1 mx ~all"
```

#### DKIM Kaydı {#dkim-record}

DKIM genel anahtarınızı alın:

```bash
# Extract DKIM public key
openssl rsa -in "$SELF_HOST_DIR/ssl/dkim.key" -pubout -outform DER | openssl base64 -A
```

DKIM DNS kaydı oluşturun:

```
default._domainkey TXT "v=DKIM1; k=rsa; p=YOUR_DKIM_PUBLIC_KEY"
```

#### DMARC Kaydı {#dmarc-record}

```
_dmarc TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
```

### İlk Giriş {#first-login}

1. Web tarayıcınızı açın ve `https://yourdomain.com` adresine gidin.
2. Daha önce kaydettiğiniz temel kimlik doğrulama bilgilerini girin.
3. İlk kurulum sihirbazını tamamlayın.
4. İlk e-posta hesabınızı oluşturun.

## Yedekleme Yapılandırması {#backup-configuration}

### S3 Uyumlu Yedeklemeyi Ayarla {#set-up-s3-compatible-backup}

S3 uyumlu depolamaya otomatik yedeklemeleri yapılandırın:

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

### Yedekleme Cron İşlerini Ayarla {#set-up-backup-cron-jobs}

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

## Otomatik Güncelleme Yapılandırması {#auto-update-configuration}

Forward Email kurulumunuz için otomatik güncellemeleri ayarlayın:

```bash
# Create auto-update command (use appropriate docker compose command)
if command -v docker-compose &> /dev/null; then
    DOCKER_UPDATE_CMD="docker-compose -f $DOCKER_COMPOSE_FILE pull && docker-compose -f $DOCKER_COMPOSE_FILE up -d"
else
    DOCKER_UPDATE_CMD="docker compose -f $DOCKER_COMPOSE_FILE pull && docker compose -f $DOCKER_COMPOSE_FILE up -d"
fi

# Add auto-update cron job (runs daily at 1 AM)
(crontab -l 2>/dev/null; echo "0 1 * * * $DOCKER_UPDATE_CMD >> /var/log/autoupdate.log 2>&1") | crontab -

# Verify the cron job was added
crontab -l
```

## Debian'a Özgü Hususlar {#debian-specific-considerations}

### Paket Yönetimi Farklılıkları {#package-management-differences}

* **Snapd**: Debian'da varsayılan olarak kurulu değildir, manuel kurulum gerektirir.
* **Docker**: Debian'a özgü depoları ve GPG anahtarlarını kullanır.
* **UFW**: Minimum Debian kurulumlarına dahil olmayabilir.
* **systemd**: Davranışı Ubuntu'dan biraz farklı olabilir.

### Hizmet Yönetimi {#service-management}

```bash
# Check service status (Debian-specific commands)
systemctl status snapd
systemctl status docker
systemctl status ufw

# Restart services if needed
systemctl restart snapd
systemctl restart docker
```

### Ağ Yapılandırması {#network-configuration}

Debian'ın farklı ağ arayüzü adları veya yapılandırmaları olabilir:

```bash
# Check network interfaces
ip addr show

# Check routing
ip route show

# Check DNS resolution
nslookup google.com
```

## Bakım ve İzleme {#maintenance-and-monitoring}

### Günlük Konumları {#log-locations}

* **Docker Compose günlükleri**: Kuruluma bağlı olarak uygun Docker Compose komutunu kullanın.
* **Sistem günlükleri**: `/var/log/syslog`
* **Yedekleme günlükleri**: `/var/log/mongo-backup.log`, `/var/log/redis-backup.log`
* **Otomatik güncelleme günlükleri**: `/var/log/autoupdate.log`
* **Snapd günlükleri**: `journalctl -u snapd`

### Düzenli Bakım Görevleri {#regular-maintenance-tasks}

1. **Disk alanını izle**: `df -h`
2. **Hizmet durumunu kontrol et**: Uygun docker compose komutunu kullan
3. **Günlükleri incele**: Hem uygulama hem de sistem günlüklerini kontrol et
4. **Sistem paketlerini güncelle**: `apt update && apt upgrade`
5. **Snapd'yi izle**: `snap list` ve `snap refresh`

### Sertifika Yenileme {#certificate-renewal}

Sertifikalar otomatik olarak yenilenmelidir, ancak gerekirse manuel olarak yenileyebilirsiniz:

```bash
# Manual certificate renewal
certbot renew

# Copy renewed certificates
cp /etc/letsencrypt/live/$DOMAIN*/* "$SELF_HOST_DIR/ssl/"

# Restart services to use new certificates
if command -v docker-compose &> /dev/null; then
    docker-compose -f "$DOCKER_COMPOSE_FILE" restart
else
    docker compose -f "$DOCKER_COMPOSE_FILE" restart
fi
```

## Sorun Giderme {#troubleshooting}

### Debian'a Özgü Sorunlar {#debian-specific-issues}

#### 1. Snapd Çalışmıyor {#1-snapd-not-working}

```bash
# Check snapd status
systemctl status snapd

# Restart snapd
systemctl restart snapd

# Check snap path
echo $PATH | grep snap

# Add snap to PATH if missing
echo 'export PATH=$PATH:/snap/bin' >> ~/.bashrc
source ~/.bashrc
```

#### 2. Docker Compose Komutu Bulunamadı {#2-docker-compose-command-not-found}

```bash
# Check which docker compose command is available
command -v docker-compose
command -v docker

# Use the appropriate command in scripts
if command -v docker-compose &> /dev/null; then
    echo "Using docker-compose"
else
    echo "Using docker compose"
fi
```

#### 3. Paket Yükleme Sorunları {#3-package-installation-issues}

```bash
# Update package cache
apt update

# Fix broken packages
apt --fix-broken install

# Check for held packages
apt-mark showhold
```

### Yaygın Sorunlar {#common-issues}

#### 1. Docker Servisi Başlamıyor {#1-docker-service-wont-start}

```bash
# Check Docker status
systemctl status docker

# Check Docker logs
journalctl -u docker

# Try alternative startup
nohup dockerd >/dev/null 2>/dev/null &
```

#### 2. Sertifika Oluşturma Başarısız {#2-certificate-generation-fails}

* 80 ve 443 portlarının erişilebilir olduğundan emin olun
* DNS kayıtlarının sunucunuzu gösterdiğini doğrulayın
* Güvenlik duvarı ayarlarını `ufw status` ile kontrol edin

#### 3. E-posta Teslimat Sorunları {#3-email-delivery-issues}

* MX kayıtlarının doğru olduğunu doğrulayın
* SPF, DKIM ve DMARC kayıtlarını kontrol edin
* 25 numaralı portun barındırma sağlayıcınız tarafından engellenmediğinden emin olun

### Yardım Alma {#getting-help}

* **Belgeler**: <https://forwardemail.net/self-hosted>
* **GitHub Sorunları**: <https://github.com/forwardemail/forwardemail.net/issues>
* **Debian Belgeleri**: <https://www.debian.org/doc/>

## Güvenlik En İyi Uygulamaları {#security-best-practices}

1. **Sistemi Güncel Tutun**: Debian ve paketleri düzenli olarak güncelleyin
2. **Günlükleri İzleyin**: Günlük izleme ve uyarıları ayarlayın
3. **Düzenli Olarak Yedekleyin**: Yedekleme ve geri yükleme prosedürlerini test edin
4. **Güçlü Parolalar Kullanın**: Tüm hesaplar için güçlü parolalar oluşturun
5. **Fail2Ban'ı Etkinleştirin**: Ek güvenlik için fail2ban'ı yüklemeyi düşünün
6. **Düzenli Güvenlik Denetimleri**: Yapılandırmanızı düzenli olarak inceleyin
7. **Snapd'yi İzleyin**: Snap paketlerini `snap refresh` ile güncel tutun

## Sonuç {#conclusion}

Forward Email'inizin kendi barındırdığınız kurulumu artık tamamlanmış ve Debian'da çalışıyor olmalı. Unutmayın:

1. DNS kayıtlarınızı doğru şekilde yapılandırın
2. E-posta gönderme ve alma işlemlerini test edin
3. Düzenli yedeklemeler ayarlayın
4. Sisteminizi düzenli olarak izleyin
5. Kurulumunuzu güncel tutun
6. Snapd ve Snap paketlerini izleyin

Ubuntu'dan temel farkları, snapd kurulumu ve Docker deposu yapılandırmasıdır. Bunlar doğru şekilde ayarlandıktan sonra, Forward Email uygulaması her iki sistemde de aynı şekilde çalışır.

Ek yapılandırma seçenekleri ve gelişmiş özellikler için <https://forwardemail.net/self-hosted#configuration>. adresindeki resmi E-posta İletme belgelerine bakın