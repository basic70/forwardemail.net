# E-mail továbbítása saját tárhelyszolgáltatáshoz Telepítési útmutató Debianhoz {#forward-email-self-hosting-installation-guide-for-debian}

## Tartalomjegyzék {#table-of-contents}

* [Áttekintés](#overview)
* [Előfeltételek](#prerequisites)
* [Rendszerkövetelmények](#system-requirements)
* [Lépésről lépésre telepítés](#step-by-step-installation)
  * [1. lépés: Kezdeti rendszerbeállítás](#step-1-initial-system-setup)
  * [2. lépés: DNS-feloldók konfigurálása](#step-2-configure-dns-resolvers)
  * [3. lépés: Rendszerfüggőségek telepítése](#step-3-install-system-dependencies)
  * [4. lépés: A Snapd telepítése és konfigurálása](#step-4-install-and-configure-snapd)
  * [5. lépés: Telepítse a Snap csomagokat](#step-5-install-snap-packages)
  * [6. lépés: Docker telepítése](#step-6-install-docker)
  * [7. lépés: Docker szolgáltatás konfigurálása](#step-7-configure-docker-service)
  * [8. lépés: Az UFW tűzfal telepítése és konfigurálása](#step-8-install-and-configure-ufw-firewall)
  * [9. lépés: Klónozza a továbbított e-mail-tárházat](#step-9-clone-forward-email-repository)
  * [10. lépés: Környezeti konfiguráció beállítása](#step-10-set-up-environment-configuration)
  * [11. lépés: A domain konfigurálása](#step-11-configure-your-domain)
  * [12. lépés: SSL-tanúsítványok generálása](#step-12-generate-ssl-certificates)
  * [13. lépés: Titkosítási kulcsok generálása](#step-13-generate-encryption-keys)
  * [14. lépés: SSL-útvonalak frissítése a konfigurációban](#step-14-update-ssl-paths-in-configuration)
  * [15. lépés: Alapvető hitelesítés beállítása](#step-15-set-up-basic-authentication)
  * [16. lépés: Telepítés a Docker Compose segítségével](#step-16-deploy-with-docker-compose)
  * [17. lépés: A telepítés ellenőrzése](#step-17-verify-installation)
* [Telepítés utáni konfiguráció](#post-installation-configuration)
  * [DNS-rekordok beállítása](#dns-records-setup)
  * [Első bejelentkezés](#first-login)
* [Biztonsági mentés konfigurációja](#backup-configuration)
  * [S3-kompatibilis biztonsági mentés beállítása](#set-up-s3-compatible-backup)
  * [Cron biztonsági mentési feladatok beállítása](#set-up-backup-cron-jobs)
* [Automatikus frissítési konfiguráció](#auto-update-configuration)
* [Debian-specifikus szempontok](#debian-specific-considerations)
  * [Csomagkezelési különbségek](#package-management-differences)
  * [Szolgáltatásmenedzsment](#service-management)
  * [Hálózati konfiguráció](#network-configuration)
* [Karbantartás és felügyelet](#maintenance-and-monitoring)
  * [Naplóhelyek](#log-locations)
  * [Rendszeres karbantartási feladatok](#regular-maintenance-tasks)
  * [Tanúsítvány megújítása](#certificate-renewal)
* [Hibaelhárítás](#troubleshooting)
  * [Debian-specifikus problémák](#debian-specific-issues)
  * [Gyakori problémák](#common-issues)
  * [Segítségkérés](#getting-help)
* [Biztonsági bevált gyakorlatok](#security-best-practices)
* [Következtetés](#conclusion)

## Áttekintés {#overview}

Ez az útmutató lépésről lépésre bemutatja a Forward Email saját tárhelyen futó megoldásának telepítését Debian rendszerekre. Ez az útmutató kifejezetten a Debian 11 (Bullseye) és a Debian 12 (Bookworm) verziókhoz készült.

## Előfeltételek {#prerequisites}

A telepítés megkezdése előtt győződjön meg arról, hogy rendelkezik:

* **Debian szerver**: 11-es verzió (Bullseye) vagy 12-es verzió (Bookworm)
* **Root hozzáférés**: Képesnek kell lenned parancsok futtatására root felhasználóként (sudo hozzáférés)
* **Domain név**: Egy olyan domain, amelyet DNS-kezelési hozzáféréssel felügyelsz
* **Tiszta szerver**: Friss Debian telepítés használata ajánlott
* **Internetkapcsolat**: Csomagok és Docker képek letöltéséhez szükséges

## Rendszerkövetelmények {#system-requirements}

* **RAM**: Minimum 2 GB (4 GB ajánlott éles környezetben)
* **Tárhely**: Minimum 20 GB szabad tárhely (50 GB+ ajánlott éles környezetben)
* **CPU**: Minimum 1 vCPU (2+ vCPU ajánlott éles környezetben)
* **Hálózat**: Nyilvános IP-cím a következő elérhető portokkal:
* 22 (SSH)
* 25 (SMTP)
* 80 (HTTP)
* 443 (HTTPS)
* 465 (SMTPS)
* 993 (IMAPS)
* 995 (POP3S)

## Lépésről lépésre telepítés {#step-by-step-installation}

### 1. lépés: Kezdeti rendszerbeállítás {#step-1-initial-system-setup}

Először is győződj meg róla, hogy a rendszered naprakész, és válts root felhasználóra:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Switch to root user (required for the installation)
sudo su -
```

### 2. lépés: DNS-feloldók konfigurálása {#step-2-configure-dns-resolvers}

Konfigurálja rendszerét úgy, hogy a Cloudflare DNS-kiszolgálóit használja a megbízható tanúsítványgeneráláshoz:

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

### 3. lépés: Rendszerfüggőségek telepítése {#step-3-install-system-dependencies}

Telepítse a Debian rendszeren futó e-mail továbbításához szükséges csomagokat:

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

### 4. lépés: A Snapd {#step-4-install-and-configure-snapd}} telepítése és konfigurálása

A Debian alapértelmezés szerint nem tartalmazza a snapd-t, ezért telepítenünk és konfigurálnunk kell:

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

### 5. lépés: Snap csomagok telepítése {#step-5-install-snap-packages}

Az AWS CLI és a Certbot telepítése snap-en keresztül:

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

### 6. lépés: Docker telepítése {#step-6-install-docker}

Docker CE és Docker Compose telepítése Debianra:

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

### 7. lépés: Docker szolgáltatás konfigurálása {#step-7-configure-docker-service}

Győződjön meg arról, hogy a Docker automatikusan elindul és fut:

```bash
# Enable and start Docker service
systemctl unmask docker
systemctl enable docker
systemctl start docker

# Verify Docker is running
docker info
```

Ha a Docker nem indul el, próbálja meg manuálisan elindítani:

```bash
# Alternative startup method if systemctl fails
nohup dockerd >/dev/null 2>/dev/null &
sleep 5
docker info
```

### 8. lépés: Az UFW tűzfal telepítése és konfigurálása {#step-8-install-and-configure-ufw-firewall}

A Debian minimális telepítései esetleg nem tartalmazzák az UFW-t, ezért először azt telepítsd:

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

### 9. lépés: Továbbított e-mail-tárház klónozása {#step-9-clone-forward-email-repository}

Töltsd le az Email továbbítása forráskódját:

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

### 10. lépés: Környezeti konfiguráció beállítása {#step-10-set-up-environment-configuration}

A környezet konfigurációjának előkészítése:

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

### 11. lépés: A domain konfigurálása {#step-11-configure-your-domain}

Állítsa be a domainnevet és frissítse a környezeti változókat:

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

### 12. lépés: SSL-tanúsítványok generálása {#step-12-generate-ssl-certificates}

#### A lehetőség: Manuális DNS-lekérdezés (A legtöbb felhasználó számára ajánlott) {#option-a-manual-dns-challenge-recommended-for-most-users}

```bash
# Generate certificates using manual DNS challenge
certbot certonly \
  --manual \
  --agree-tos \
  --preferred-challenges dns \
  -d "*.$DOMAIN" \
  -d "$DOMAIN"
```

**Fontos**: Amikor a rendszer kéri, létre kell hoznod TXT rekordokat a DNS-edben. Előfordulhat, hogy több kihívással is találkozol ugyanahhoz a domainhez – **hozd létre az összeset**. Ne távolítsd el az első TXT rekordot a második hozzáadásakor.

#### B. lehetőség: Cloudflare DNS (Ha Cloudflare-t használ) {#option-b-cloudflare-dns-if-you-use-cloudflare}

Ha a domained Cloudflare-t használ DNS-hez, automatizálhatod a tanúsítványok generálását:

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

#### Tanúsítványok másolása {#copy-certificates}

A tanúsítványok létrehozása után másolja azokat az alkalmazás könyvtárába:

```bash
# Copy certificates to application SSL directory
cp /etc/letsencrypt/live/$DOMAIN*/* "$SELF_HOST_DIR/ssl/"

# Verify certificates were copied
ls -la "$SELF_HOST_DIR/ssl/"
```

### 13. lépés: Titkosítási kulcsok generálása {#step-13-generate-encryption-keys}

Hozza létre a biztonságos működéshez szükséges különféle titkosítási kulcsokat:

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

### 14. lépés: SSL-útvonalak frissítése a {#step-14-update-ssl-paths-in-configuration}} konfigurációban

Konfigurálja az SSL tanúsítványok elérési útjait a környezeti fájlban:

```bash
# Update SSL paths to point to the correct certificate files
sed -i -E \
  -e 's|^(.*_)?SSL_KEY_PATH=.*|\1SSL_KEY_PATH=/app/ssl/privkey.pem|' \
  -e 's|^(.*_)?SSL_CERT_PATH=.*|\1SSL_CERT_PATH=/app/ssl/fullchain.pem|' \
  -e 's|^(.*_)?SSL_CA_PATH=.*|\1SSL_CA_PATH=/app/ssl/chain.pem|' \
  "$SELF_HOST_DIR/$ENV_FILE"
```

### 15. lépés: Alapvető hitelesítés beállítása {#step-15-set-up-basic-authentication}

Ideiglenes alapvető hitelesítési adatok létrehozása:

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

### 16. lépés: Telepítés a Docker Compose {#step-16-deploy-with-docker-compose} használatával

Indítsa el az összes e-mail továbbítási szolgáltatást:

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

### 17. lépés: Telepítés ellenőrzése {#step-17-verify-installation}

Ellenőrizd, hogy minden szolgáltatás megfelelően fut-e:

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

## Telepítés utáni konfiguráció {#post-installation-configuration}

### DNS-rekordok beállítása {#dns-records-setup}

A következő DNS-rekordokat kell konfigurálnia a domainjéhez:

#### MX rekord {#mx-record}}

```
@ MX 10 mx.yourdomain.com
```

#### A Rekordok {#a-records}

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

#### SPF-rekord {#spf-record}

```
@ TXT "v=spf1 mx ~all"
```

#### DKIM rekord {#dkim-record}

Szerezd meg a DKIM nyilvános kulcsodat:

```bash
# Extract DKIM public key
openssl rsa -in "$SELF_HOST_DIR/ssl/dkim.key" -pubout -outform DER | openssl base64 -A
```

DKIM DNS-rekord létrehozása:

```
default._domainkey TXT "v=DKIM1; k=rsa; p=YOUR_DKIM_PUBLIC_KEY"
```

#### DMARC rekord {#dmarc-record}

```
_dmarc TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
```

### Első bejelentkezés {#first-login}

1. Nyissa meg a webböngészőjét, és navigáljon a `https://yourdomain.com` oldalra.
2. Adja meg a korábban mentett alapvető hitelesítési adatokat.
3. Fejezze be a kezdeti beállítási varázslót.
4. Hozza létre első e-mail fiókját.

## Biztonsági mentés konfigurációja {#backup-configuration}

### S3-kompatibilis biztonsági mentés beállítása {#set-up-s3-compatible-backup}

Automatikus biztonsági mentések konfigurálása S3-kompatibilis tárolóra:

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

### Cron biztonsági mentési feladatok beállítása {#set-up-backup-cron-jobs}

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

## Automatikus frissítési konfiguráció {#auto-update-configuration}

Automatikus frissítések beállítása az e-mail továbbítási telepítéséhez:

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

## Debian-specifikus szempontok {#debian-specific-considerations}

### Csomagkezelési különbségek {#package-management-differences}

* **Snapd**: Alapértelmezés szerint nincs telepítve Debianon, manuális telepítést igényel.
* **Docker**: Debian-specifikus adattárakat és GPG-kulcsokat használ.
* **UFW**: Lehetséges, hogy nem része a minimális Debian telepítéseknek.
* **systemd**: A viselkedése kissé eltérhet az Ubuntutól.

### Szolgáltatáskezelés {#service-management}

```bash
# Check service status (Debian-specific commands)
systemctl status snapd
systemctl status docker
systemctl status ufw

# Restart services if needed
systemctl restart snapd
systemctl restart docker
```

### Hálózati konfiguráció {#network-configuration}

A Debiannak eltérő hálózati interfésznevei vagy konfigurációi lehetnek:

```bash
# Check network interfaces
ip addr show

# Check routing
ip route show

# Check DNS resolution
nslookup google.com
```

## Karbantartás és felügyelet {#maintenance-and-monitoring}

### Naplóhelyek {#log-locations}

* **Docker Compose naplók**: Használja a telepítésnek megfelelő docker compose parancsot
* **Rendszernaplók**: `/var/log/syslog`
* **Biztonsági mentési naplók**: `/var/log/mongo-backup.log`, `/var/log/redis-backup.log`
* **Automatikus frissítési naplók**: `/var/log/autoupdate.log`
* **Rögzített naplók**: `journalctl -u snapd`

### Rendszeres karbantartási feladatok {#regular-maintenance-tasks}

1. **Lemezterület figyelése**: `df -h`
2. **Szolgáltatás állapotának ellenőrzése**: Használja a megfelelő Docker compose parancsot
3. **Naplók áttekintése**: Ellenőrizze az alkalmazás- és a rendszernaplókat
4. **Rendszercsomagok frissítése**: `apt update && apt upgrade`
5. **Snapd figyelése**: `snap list` és `snap refresh`

### Tanúsítvány megújítása {#certificate-renewal}

A tanúsítványoknak automatikusan megújulniuk kellene, de szükség esetén manuálisan is megújíthatja őket:

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

## Hibaelhárítás {#troubleshooting}

### Debian-specifikus problémák {#debian-specific-issues}

#### 1. A Snapd nem működik {#1-snapd-not-working}

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

#### 2. A Docker Compose parancs nem található {#2-docker-compose-command-not-found}

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

#### 3. Csomagtelepítési problémák {#3-package-installation-issues}

```bash
# Update package cache
apt update

# Fix broken packages
apt --fix-broken install

# Check for held packages
apt-mark showhold
```

### Gyakori problémák {#common-issues}

#### 1. A Docker szolgáltatás nem indul el {#1-docker-service-wont-start}

```bash
# Check Docker status
systemctl status docker

# Check Docker logs
journalctl -u docker

# Try alternative startup
nohup dockerd >/dev/null 2>/dev/null &
```

#### 2. A tanúsítvány létrehozása sikertelen {#2-certificate-generation-fails}

* Győződjön meg arról, hogy a 80-as és 443-as portok elérhetők.* Ellenőrizze, hogy a DNS-rekordok a szerverére mutatnak-e.* Ellenőrizze a tűzfal beállításait a `ufw status` paraméterrel.

#### 3. E-mail kézbesítési problémák {#3-email-delivery-issues}

* Ellenőrizze az MX rekordok helyességét.* Ellenőrizze az SPF, DKIM és DMARC rekordokat.* Győződjön meg arról, hogy a tárhelyszolgáltatója nem blokkolja a 25-ös portot.

### Segítség kérése {#getting-help}

* **Dokumentáció**: <https://forwardemail.net/self-hosted>
* **GitHub problémák**: <https://github.com/forwardemail/forwardemail.net/issues>
* **Debian dokumentáció**: <https://www.debian.org/doc/>

## Biztonsági bevált gyakorlatok {#security-best-practices}

1. **A rendszer naprakészen tartása**: A Debian és a csomagok rendszeres frissítése
2. **Naplók figyelése**: Naplófigyelés és riasztások beállítása
3. **Rendszeres biztonsági mentés**: A biztonsági mentési és visszaállítási eljárások tesztelése
4. **Erős jelszavak használata**: Erős jelszavak generálása minden fiókhoz
5. **Fail2Ban engedélyezése**: A fokozott biztonság érdekében érdemes megfontolni a fail2ban telepítését
6. **Rendszeres biztonsági auditok**: A konfiguráció rendszeres ellenőrzése
7. **Snapd figyelése**: A snap csomagok naprakészen tartása a `snap refresh` paraméterrel

## Következtetés {#conclusion}

A Forward Email önállóan üzemeltetett telepítésének most már be kell fejeződnie és futnia kell Debianon. Ne feledd:

1. Konfigurálja megfelelően a DNS-rekordjait.
2. Tesztelje az e-mail küldését és fogadását.
3. Állítson be rendszeres biztonsági mentéseket.
4. Rendszeresen figyelje a rendszerét.
5. Tartsa naprakészen a telepítését.
6. Figyelje a snapd és a snap csomagokat.

A fő különbségek az Ubuntuhoz képest a snapd telepítése és a Docker adattár konfigurációja. Ha ezek megfelelően be vannak állítva, a Forward Email alkalmazás mindkét rendszeren azonosan fog viselkedni.

További konfigurációs lehetőségekért és speciális funkciókért tekintse meg a hivatalos e-mail-továbbítási dokumentációt a <https://forwardemail.net/self-hosted#configuration>. címen.