#!/bin/bash
# ==============================================================================
# One-Click Deployment Script for Ubuntu / Debian VPS
# Project: ZenSpace // Mindfulness & Guided Studio Audio
# Author: Il Chu (https://t.me/chu_il)
# ==============================================================================

set -e

echo "🧘 [ZenSpace] Starting VPS Deployment..."

# 1. Check for Git
if ! command -v git &> /dev/null; then
    echo "📦 Installing Git..."
    sudo apt-get update && sudo apt-get install -y git
fi

# 2. Check for Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 Docker not found. Installing Docker Engine..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed successfully."
fi

# 3. Check for Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo apt-get update && sudo apt-get install -y docker-compose-plugin
fi

# 4. Pull latest git changes
echo "🔄 Fetching latest master branch..."
git fetch origin master
git reset --hard origin/master

# 5. Build and run containers
echo "🚀 Building and starting container..."
if docker compose version &> /dev/null; then
    docker compose down --remove-orphans || true
    docker compose build --no-cache
    docker compose up -d
else
    docker-compose down --remove-orphans || true
    docker-compose build --no-cache
    docker-compose up -d
fi

echo "========================================================"
echo "✨ ZenSpace successfully deployed to your VPS!"
echo "🌐 Local Port: 8089 (Proxy via zen.chuchuchu.ru)"
echo "========================================================"
