# 红枣管理系统 - 阿里云部署指南

## 目录

1. [购买阿里云服务器](#1-购买阿里云服务器)
2. [连接服务器](#2-连接服务器)
3. [安装服务器环境](#3-安装服务器环境)
4. [上传项目代码](#4-上传项目代码)
5. [配置后端服务](#5-配置后端服务)
6. [配置前端和Nginx](#6-配置前端和nginx)
7. [配置域名（可选）](#7-配置域名可选)
8. [常见问题](#8-常见问题)

---

## 1. 购买阿里云服务器

### 1.1 进入阿里云官网

1. 打开浏览器，访问 [阿里云官网](https://www.aliyun.com/)
2. 点击右上角「登录/注册」，使用支付宝或手机号登录

### 1.2 购买云服务器 ECS

1. 登录后，点击顶部菜单「产品」→「云服务器 ECS」
2. 点击「立即购买」

### 1.3 选择配置

**推荐配置（入门级，够用）：**

| 配置项 | 推荐选择 |
|--------|----------|
| 付费模式 | 按量付费（测试用）或 包年包月（长期用） |
| 地域 | 华东（杭州）或 华北（北京），选离你最近的 |
| 实例规格 | 2核2G 或 2核4G（经济型 e） |
| 镜像 | Ubuntu 22.04 64位 或 CentOS 7.9 |
| 存储 | 40GB 高效云盘 |
| 网络 | 默认专有网络 |
| 带宽 | 1-3Mbps（按使用流量付费） |

### 1.4 设置密码

在「系统配置」步骤中：
- 设置「登录凭证」为「自定义密码」
- 设置一个强密码（包含大小写字母、数字、符号）
- **记住这个密码！**

### 1.5 确认购买

1. 确认配置和价格
2. 勾选同意服务协议
3. 点击「立即购买」并付款

### 1.6 获取公网IP

购买完成后：
1. 进入「控制台」→「云服务器 ECS」→「实例」
2. 找到你刚买的服务器
3. 复制「公网IP地址」（类似 123.45.67.89）

---

## 2. 连接服务器

### 2.1 Windows 用户（使用 PowerShell）

1. 按 `Win + X`，选择「Windows PowerShell」或「终端」
2. 输入以下命令（替换为你的公网IP）：

```bash
ssh root@你的公网IP
```

例如：
```bash
ssh root@123.45.67.89
```

3. 第一次连接会提示 `Are you sure...`，输入 `yes` 回车
4. 输入你购买时设置的密码（输入时不会显示，直接输完回车）

### 2.2 连接成功标志

看到类似以下提示表示连接成功：
```
Welcome to Ubuntu 22.04 LTS
root@iZxxxxxx:~#
```

---

## 3. 安装服务器环境

### 3.1 更新系统

```bash
apt update && apt upgrade -y
```

### 3.2 安装 Node.js 20

```bash
# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 验证安装
node -v
npm -v
```

### 3.3 安装 PM2（进程管理）

```bash
npm install -g pm2
```

### 3.4 安装 Nginx（Web服务器）

```bash
apt install -y nginx

# 启动 Nginx
systemctl start nginx
systemctl enable nginx
```

### 3.5 安装 Git

```bash
apt install -y git
```

### 3.6 验证安装

```bash
# 检查各软件版本
node -v      # 应显示 v20.x.x
npm -v       # 应显示 10.x.x
nginx -v     # 应显示 nginx version: nginx/1.x.x
pm2 -v       # 应显示 5.x.x
```

---

## 4. 上传项目代码

### 方式一：使用 Git（推荐）

如果你把代码放到了 GitHub/Gitee：

```bash
# 创建项目目录
mkdir -p /var/www
cd /var/www

# 克隆代码（替换为你的仓库地址）
git clone https://gitee.com/你的用户名/你的仓库.git admin
```

### 方式二：直接上传（无 Git）

在**本地电脑**打开 PowerShell，进入项目目录：

```powershell
# 打包项目
cd c:\Users\14531\Desktop\admin
tar -czvf admin.tar.gz *

# 上传到服务器（替换IP）
scp admin.tar.gz root@你的公网IP:/var/www/
```

在**服务器**上解压：

```bash
cd /var/www
mkdir -p admin
tar -xzvf admin.tar.gz -C admin
rm admin.tar.gz
```

---

## 5. 配置后端服务

### 5.1 安装后端依赖

```bash
cd /var/www/admin/server
npm install
```

### 5.2 构建后端

```bash
npm run build
```

### 5.3 创建生产环境配置

```bash
# 创建 .env 文件
cat > /var/www/admin/server/.env << 'EOF'
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-2024
DATABASE_URL=file:./data.db
EOF
```

**重要：** 请把 `your-super-secret-jwt-key-change-this-2024` 改成一个随机字符串！

### 5.4 初始化数据库

```bash
cd /var/www/admin/server
npx prisma generate
npx prisma db push
```

### 5.5 使用 PM2 启动后端

```bash
cd /var/www/admin/server
pm2 start dist/index.js --name "red-date-api"

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

### 5.6 验证后端运行

```bash
pm2 status
```

应该看到 `red-date-api` 状态为 `online`

---

## 6. 配置前端和 Nginx

### 6.1 构建前端

```bash
cd /var/www/admin

# 安装依赖
npm install

# 构建
npm run build
```

构建完成后，静态文件在 `dist` 目录中。

### 6.2 配置 Nginx

创建 Nginx 配置文件：

```bash
cat > /etc/nginx/sites-available/admin << 'EOF'
server {
    listen 80;
    server_name _;

    # 前端静态文件
    root /var/www/admin/dist;
    index index.html;

    # 前端路由（Vue Router history 模式）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # 上传文件访问
    location /uploads {
        alias /var/www/admin/server/uploads;
    }
}
EOF
```

### 6.3 启用配置

```bash
# 删除默认配置
rm -f /etc/nginx/sites-enabled/default

# 启用新配置
ln -s /etc/nginx/sites-available/admin /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重载 Nginx
systemctl reload nginx
```

### 6.4 配置阿里云安全组

1. 登录阿里云控制台
2. 进入「云服务器 ECS」→「实例」→ 点击实例ID
3. 点击「安全组」标签
4. 点击安全组ID
5. 点击「入方向」→「手动添加」
6. 添加规则：
   - 端口范围：`80/80`
   - 授权对象：`0.0.0.0/0`
   - 描述：HTTP

---

## 7. 配置域名（可选）

如果你有域名，可以绑定域名并配置 HTTPS。

### 7.1 域名解析

1. 进入阿里云「域名控制台」
2. 点击域名后面的「解析」
3. 添加记录：
   - 记录类型：A
   - 主机记录：`@`（或 `admin` 等子域名）
   - 记录值：你的服务器公网IP

### 7.2 申请免费 SSL 证书

1. 进入阿里云「SSL证书控制台」
2. 点击「免费证书」→「创建证书」
3. 按提示验证域名
4. 下载证书（选择 Nginx 格式）

### 7.3 配置 HTTPS

上传证书到服务器后，修改 Nginx 配置：

```bash
cat > /etc/nginx/sites-available/admin << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/your-domain.com.pem;
    ssl_certificate_key /etc/nginx/ssl/your-domain.com.key;

    root /var/www/admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/admin/server/uploads;
    }
}
EOF

# 重载 Nginx
systemctl reload nginx
```

---

## 8. 常见问题

### Q: 访问网站显示 502 Bad Gateway

后端服务可能没启动，检查：
```bash
pm2 status
pm2 logs red-date-api
```

### Q: 访问网站显示空白页

检查前端是否构建成功：
```bash
ls /var/www/admin/dist
```

应该看到 `index.html` 文件。

### Q: API 接口返回 404

检查 Nginx 配置和后端路由：
```bash
nginx -t
pm2 logs red-date-api
```

### Q: 数据库连接失败

检查数据库文件权限：
```bash
ls -la /var/www/admin/server/*.db
chmod 644 /var/www/admin/server/*.db
```

### Q: 如何查看后端日志

```bash
pm2 logs red-date-api
```

### Q: 如何重启服务

```bash
# 重启后端
pm2 restart red-date-api

# 重启 Nginx
systemctl restart nginx
```

### Q: 如何更新代码

```bash
cd /var/www/admin
git pull

# 重新构建前端
npm run build

# 重新构建后端
cd server
npm run build
pm2 restart red-date-api
```

---

## 快速命令总结

```bash
# 连接服务器
ssh root@你的公网IP

# 查看后端状态
pm2 status

# 查看后端日志
pm2 logs red-date-api

# 重启后端
pm2 restart red-date-api

# 重启 Nginx
systemctl restart nginx

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
```

---

## 访问你的系统

部署完成后，在浏览器中访问：

- **无域名**: `http://你的公网IP`
- **有域名**: `http://your-domain.com` 或 `https://your-domain.com`

首次访问需要注册账号，第一个注册的用户即为管理员。
