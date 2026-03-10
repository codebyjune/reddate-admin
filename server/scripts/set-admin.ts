// 设置管理员脚本
// 运行方式: npx tsx scripts/set-admin.ts <用户名>

import prisma from "../src/lib/prisma";

async function setAdmin() {
  const username = process.argv[2];

  if (!username) {
    console.log("用法: npx tsx scripts/set-admin.ts <用户名>");
    console.log("示例: npx tsx scripts/set-admin.ts admin");
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { username },
      data: { role: "admin" },
    });

    console.log(`✅ 用户 "${user.username}" 已设置为管理员`);
    console.log("用户信息:", { id: user.id, username: user.username, role: user.role });
  } catch (error) {
    console.error("❌ 设置失败，用户名可能不存在");
  } finally {
    await prisma.$disconnect();
  }
}

setAdmin();
