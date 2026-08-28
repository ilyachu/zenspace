# 🚀 Руководство по развертыванию на сервере chuchuchu.ru → `zen.chuchuchu.ru`

ZenSpace разворачивается на том же сервере рядом с основным сайтом `chuchuchu.ru` и `lofi.chuchuchu.ru` в изолированном Docker-контейнере.

---

## 📊 Потребление ресурсов сервером:
- **RAM:** всего **~18–25 MB** (минимальный Nginx Alpine).
- **CPU:** **~0%** (статическая раздача с Gzip-сжатием и кэшированием аудио).
- **Диск:** **~85 MB** со всеми аудио-треками.
- **Порт:** **`8089`** (не конфликтует с основным сайтом на 80/443 и `lofi.chuchuchu.ru` на 8088).

---

## 🛠️ Пошаговая инструкция развертывания:

### 1. Настройка DNS-записи:
В панели управления доменом `chuchuchu.ru` добавьте **A-запись**:
- **Имя (Host / Name):** `zen`
- **Значение (Target / IP):** тот же IP-адрес, что и у `chuchuchu.ru`

---

### 2. Запуск контейнера на сервере:

Подключитесь к VPS по SSH:
```bash
ssh root@IP_ВАШЕГО_СЕРВЕРА
```

Склонируйте и запустите ZenSpace:
```bash
git clone https://github.com/ilyachu/zenspace.git /var/www/zenspace
cd /var/www/zenspace
cp .env.example .env          # PORT=8089
chmod +x deploy.sh
./deploy.sh
```

---

### 3. Подключение домена `zen.chuchuchu.ru` и бесплатного SSL:

#### Вариант А: Если на сервере работает Nginx
```bash
ln -sf /var/www/zenspace/deploy/nginx-zen.chuchuchu.ru.conf /etc/nginx/sites-available/zen.chuchuchu.ru
ln -sf /etc/nginx/sites-available/zen.chuchuchu.ru /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d zen.chuchuchu.ru
```

#### Вариант Б: Если на сервере работает Caddy
Добавьте в `/etc/caddy/Caddyfile`:
```caddy
zen.chuchuchu.ru {
    reverse_proxy 127.0.0.1:8089
    encode gzip zstd
}
```
И перезагрузите Caddy:
```bash
caddy reload
```

---

## 🔄 Как обновлять проект при новых коммитах:

```bash
cd /var/www/zenspace
./deploy.sh
```
Контейнер автоматически скачает свежий код с GitHub и пересоберется с нулевым простоем (Zero-Downtime).
