// 从路由参数中解析 ID
export const parseId = (idParam: string | string[] | undefined): number => {
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!id) throw new Error("无效的 ID");
  return parseInt(id, 10);
};
