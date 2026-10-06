export const raw = [
  ["理工实验楼", "实验楼", 128400, 0, 18200, 8.4, "high", 57, 23],
  ["学生宿舍 A 区", "宿舍", 98600, 0, 24600, -3.2, "mid", 16, 19],
  ["第一教学楼", "教学楼", 72300, 0, 16300, -7.8, "low", 29, 53],
  ["学生食堂", "食堂", 65800, 8600, 8200, 4.6, "high", 63, 58],
  ["图书馆", "公共建筑", 54600, 0, 22100, -5.1, "low", 8, 69],
];

export const types = ["教学楼", "实验楼", "宿舍", "食堂", "公共建筑", "体育馆", "其他"];
export const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
export const clamp = (value, min, max) => Math.min(max, Math.max(min, finite(value)));
export const sanitizeInternalRow = (r) => {
  if (!Array.isArray(r) || r.length < 6) return null;
  const power = Math.max(0, finite(r[2]));
  const internal = ["low", "mid", "high"].includes(r[6]);
  return [String(r[0] || "未命名建筑").slice(0, 80), types.includes(r[1]) ? r[1] : "其他", power, Math.max(0, finite(r[3])), Math.max(0, finite(r[4])), finite(r[5]), power > 100000 ? "high" : power > 70000 ? "mid" : "low", clamp(r[internal ? 7 : 6] ?? 50, 0, 100), clamp(r[internal ? 8 : 7] ?? 50, 0, 100)];
};
