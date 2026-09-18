import React, { useState } from "react";
import { raw } from "./store.js";
export default function History({ grid, gas }) {
  const [history, setHistory] = useState(() => { try { return JSON.parse(localStorage.getItem("campusHistory")) || {}; } catch { return {}; } });
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7));
  const [compare, setCompare] = useState("");
  const [message, setMessage] = useState("");
  const total = rows => rows.reduce((s,r)=>s+r[2]*grid+r[3]*gas,0)/1000;
  const save = () => {
    if (!month || !raw.length) return setMessage("请选择月份并先录入楼宇数据。");
    if (history[month] && !window.confirm("该月份已有记录，是否替换？")) return;
    const next = {...history,[month]:{rows:JSON.parse(JSON.stringify(raw)),grid,gas}};
    try { localStorage.setItem("campusHistory",JSON.stringify(next));setHistory(next);setMessage("月度快照已保存。"); } catch {setMessage("保存失败，请备份数据。");}
  };
  const old = history[compare];
  return <section className="feature"><article className="panel params"><h2>月度历史与对比</h2><p>保存实际录入的月度快照，不生成虚构历史。对比统一采用当前排放因子。</p><label>归档月份 <input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label> <button className="primary" onClick={save}>保存当前月度快照</button><p role="status">{message}</p><label>对比月份 <select value={compare} onChange={e=>setCompare(e.target.value)}><option value="">选择历史月份</option>{Object.keys(history).sort().map(m=><option key={m}>{m}</option>)}</select></label><h3>当前排放：{total(raw).toFixed(2)} tCO₂</h3>{old && <p>历史排放：{total(old.rows).toFixed(2)} tCO₂；差额：{(total(raw)-total(old.rows)).toFixed(2)} tCO₂。建筑数量：当前 {raw.length} / 历史 {old.rows.length}。核算边界变化时不能直接解释为减排。</p>}<p>记录仅保存在当前浏览器，不自动跨设备同步。</p></article></section>;
}
