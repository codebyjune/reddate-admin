/**
 * 格式化数字：有小数保留指定位数，无小数则不显示小数点
 * @param num 数字
 * @param decimals 小数位数，默认2
 */
export const formatNumber = (num: number | undefined | null, decimals = 2): string => {
  if (num == null) return '';
  const fixed = num.toFixed(decimals);
  return fixed.replace(/\.?0+$/, '');
};

/**
 * 格式化重量（kg）
 */
export const formatWeight = (weight: number | undefined | null): string => {
  if (weight == null) return '';
  const fixed = weight.toFixed(2);
  return fixed.replace(/\.?0+$/, '');
};

/**
 * 格式化吨数（kg → 吨）
 * 将千克转换为吨，保留指定小数位，去掉尾部的 0
 */
export const formatTon = (weightKg: number | undefined | null, decimals = 2): string => {
  if (weightKg == null) return '';
  const tons = weightKg / 1000;
  const fixed = tons.toFixed(decimals);
  return fixed.replace(/\.?0+$/, '');
};

/**
 * 格式化金额（元）
 */
export const formatMoney = (amount: number | undefined | null): string => {
  if (amount == null) return '';
  const fixed = amount.toFixed(2);
  return fixed.replace(/\.?0+$/, '');
};

/**
 * 根据日期字段生成趋势数据，没有数据的日期补 0
 * @param data    原始数据数组
 * @param target  要赋值的 ref 变量
 * @param dateField 日期字段名（如 "deliveryDate"、"date"）
 * @param days    统计最近几天，默认 7 天
 */
export const generateTrend = (
  data: Record<string, any>[],
  target: { value: { date: string; count: number }[] },
  dateField: string,
  days: number = 7,
) => {
  // 1. 生成最近 N 天的日期，全部初始化为 0
  const trendMap: Record<string, number> = {};
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    trendMap[date.toISOString().split("T")[0] as string] = 0;
  }
  // 2. 遍历实际数据，按日期累加计数
  data.forEach((d) => {
    let dateVal = d[dateField] as string | undefined;
    if (dateVal) {
      // 统一日期格式：把 2026.3.9 或 2026-3-9 转成 2026-03-09
      dateVal = dateVal.replace(/\./g, "-");
      const parts = dateVal.split("-");
      if (parts.length === 3 && parts[1] && parts[2]) {
        dateVal = `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
      }
      if (dateVal in trendMap) trendMap[dateVal] = (trendMap[dateVal] ?? 0) + 1;
    }
  });
  // 3. 转成图表需要的数组格式
  target.value = Object.entries(trendMap).map(([date, count]) => ({
    date: date.slice(5),
    count,
  }));
};
