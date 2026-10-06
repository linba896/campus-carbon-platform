import React, { useState } from "react";
import { raw, sanitizeInternalRow } from "./store.js";
const cleanHistory = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).flatMap(([month, item]) => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || !Array.isArray(item?.rows)) return [];
    const rows = item.rows.map(sanitizeInternalRow).filter(Boolean);
    const savedGrid = Number(item.grid);
    const savedGas = Number(item.gas);
    return rows.length ? [[month, { rows, grid: Number.isFinite(savedGrid) && savedGrid >= 0 ? savedGrid : null, gas: Number.isFinite(savedGas) && savedGas >= 0 ? savedGas : null }]] : [];
  }));
};
export default function History({ grid, gas }) {
  const [history, setHistory] = useState(() => { try { return cleanHistory(JSON.parse(localStorage.getItem("campusHistory"))); } catch { return {}; } });
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7));
  const [compare, setCompare] = useState("");
  const [message, setMessage] = useState("");
  const total = (rows, factors = { grid, gas }) => rows.reduce((s,r)=>s+r[2]*(factors.grid ?? grid)+r[3]*(factors.gas ?? gas),0)/1000;
  const save = () => {
    if (!month || !raw.length) return setMessage("请选择月份并先录入楼宇数据。");
    if (history[month] && !window.confirm("该月份已有记录，是否替换？")) return;
    const next = {...history,[month]:{rows:JSON.parse(JSON.stringify(raw)),grid,gas}};
    try { localStorage.setItem("campusHistory",JSON.stringify(next));setHistory(next);setMessage("月度快照已保存。"); } catch {setMessage("保存失败，请备份数据。");}
  };
  const old = history[compare];
  const currentTotal = total(raw);
  const oldTotal = old ? total(old.rows, old) : 0;
  return <section className="feature history-page"><div className="history-head"><div><span className="eyebrow">Campus-CE · 数据留痕</span><h2>月度历史与对比</h2><p>保存真实录入快照，追踪校园碳排放变化。</p></div><div className="history-badge">{Object.keys(history).length}<small> 个历史快照</small></div></div><div className="history-grid"><article className="panel history-card action-card"><h3>保存月度快照</h3><p>将当前楼宇数据和排放因子记录为一个可回看的月份。</p><label>归档月份<input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label><button className="primary" onClick={save}>保存当前月度快照</button><p className="status" role="status">{message}</p></article><article className="panel history-card metric-card"><span>当前核算期</span><strong>{currentTotal.toFixed(2)}</strong><em>tCO₂</em><small>共 {raw.length} 栋建筑 · 当前排放因子</small></article></div><article className="panel history-card compare-card"><header><div><h3>选择历史月份进行对比</h3><p>对比前请确认两个月份的核算边界一致。</p></div><select value={compare} onChange={e=>setCompare(e.target.value)}><option value="">选择历史月份</option>{Object.keys(history).sort().map(m=><option key={m}>{m}</option>)}</select></header>{old?<div className="compare-result"><div><span>历史排放</span><b>{oldTotal.toFixed(2)} <small>tCO₂</small></b></div><div><span>当前 - 历史</span><b className={(currentTotal-oldTotal)<=0?'good':''}>{(currentTotal-oldTotal).toFixed(2)} <small>tCO₂</small></b></div><p>当前建筑 {raw.length} 栋 / 历史 {old.rows.length} 栋。历史值采用快照保存时的排放因子；建筑数量或核算边界变化时，差额不能直接解释为减排效果。</p></div>:<div className="compare-empty">选择一个已保存月份后，这里会显示排放差额和边界提示。</div>}</article><p className="history-note">数据仅保存在当前浏览器，不会自动跨设备同步；重要数据请在“数据与地图中心”下载 JSON 备份。</p></section>;
}
