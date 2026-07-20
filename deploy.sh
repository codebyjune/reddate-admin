#!/bin/bash

# 红枣管理系统 - 一键部署脚本
# 在服务器上运行此脚本

set -e

echo "======================================"
echo "  红枣管理系统 - 部署脚本"
echo "======================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目目录
PROJECT_DIR="/var/www/admin"
SERVER_DIR="$PROJECT_DIR/server"

# 打印带颜色的消息
print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[i]${NC} $1"
}

# 检查是否在正确的目录
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "项目目录不存在: $PROJECT_DIR"
    print_info "请先将项目上传到 /var/www/admin"
    exit 1
fi

# 创建日志目录
print_info "创建日志目录..."
mkdir -p $SERVER_DIR/logs
print_success "日志目录创建完成"

# 安装后端依赖
print_info "安装后端依赖..."
cd $SERVER_DIR
pnpm install
print_success "后端依赖安装完成"

# 构建后端
print_info "构建后端..."
pnpm run build
print_success "后端构建完成"

# 创建 .env 文件（如果不存在）
if [ ! -f "$SERVER_DIR/.env" ]; then
    cp "$SERVER_DIR/.env.example" "$SERVER_DIR/.env"
    print_info "已创建 $SERVER_DIR/.env，请填写数据库密码、JWT_SECRET 与 API Key 后重新运行本脚本"
    exit 1
fi

# 初始化数据库
print_info "生成 Prisma Client 并应用数据库迁移..."
cd $SERVER_DIR
pnpm run db:generate
pnpm run db:migrate
print_success "数据库迁移完成"

# 安装前端依赖并构建
print_info "构建前端..."
cd $PROJECT_DIR
pnpm install
pnpm run build
print_success "前端构建完成"

# 使用 PM2 启动/重启后端
print_info "启动后端服务..."
cd $SERVER_DIR
if pm2 list | grep -q "red-date-api"; then
    pm2 restart red-date-api
    print_success "后端服务重启完成"
else
    pm2 start ecosystem.config.js --env production
    pm2 save
    print_success "后端服务启动完成"
fi

# 重载 Nginx
print_info "重载 Nginx..."
if [ -f "/etc/nginx/sites-enabled/admin" ]; then
    nginx -t && systemctl reload nginx
    print_success "Nginx 重载完成"
else
    print_info "Nginx 配置文件不存在，请手动配置"
fi

echo ""
echo "======================================"
print_success "部署完成！"
echo "======================================"
echo ""
echo "访问地址: http://$(curl -s ifconfig.me)"
echo ""
echo "常用命令:"
echo "  查看后端状态: pm2 status"
echo "  查看后端日志: pm2 logs red-date-api"
echo "  重启后端:     pm2 restart red-date-api"
echo ""
