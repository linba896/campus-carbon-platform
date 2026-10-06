import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  Building2,
  Download,
  FlaskConical,
  Gauge,
  Leaf,
  Map,
  Menu,
  RefreshCw,
  Settings2,
  SlidersHorizontal,
  UploadCloud,
  Wind,
  X,
  Zap,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import "./style.css";
import DataCenter from "./DataCenter.jsx";
import History from "./History.jsx";
import { raw, sanitizeInternalRow } from "./store.js";
const fmt = (v) =>
  new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 1 }).format(v);
function Side({ open, setOpen, view, setView }) {
  let nav = [
    ["总览驾驶舱", Gauge],
    ["空间能碳地图", Map],
    ["楼宇能碳分析", Building2],
    ["节能方案仿真", FlaskConical],
    ["算法参数中心", Settings2],
    ["数据与地图中心", UploadCloud],
    ["AI辅助分析", Sparkles],
    ["月度历史与对比", Activity],
  ];
  return (
    <aside className={open ? "open" : ""}>
      <div className="brand">
        <span>
          <Leaf />
        </span>
        <div>
          <b>源碳智算</b>
          <small>校园能碳管控平台</small>
        </div>
        <button onClick={() => setOpen(false)}>
          <X />
        </button>
      </div>
      <nav>
        {nav.map(([t, I], i) => (
          <button
            key={t}
            className={view === i ? "active" : ""}
            onClick={() => {
              setView(i);
              setOpen(false);
            }}
          >
            <I />
            {t}
          </button>
        ))}
      </nav>
      <footer>
        <small>算法状态</small>
        <p>
          <i />
          能碳耦合模型运行中
        </p>
        <small>Campus-CE v1.0</small>
      </footer>
    </aside>
  );
}
function Metric({ I, label, value, unit, delta, warn }) {
  return (
    <article className={"metric " + (warn ? "warn" : "")}>
      <header>
        <span>
          <I />
        </span>
        {label}
      </header>
      <div>
        <b>{value}</b>
        <small>{unit}</small>
      </div>
      {delta && (
        <p>
          <ArrowDownRight />
          {delta} <em>较上月</em>
        </p>
      )}
    </article>
  );
}
function Dashboard({ grid, gas }) {
  const [sel, setSel] = useState(0);
  const data = useMemo(
    () =>
      raw.map((x, i) => ({
        id: i,
        name: x[0],
        type: x[1],
        kwh: x[2],
        gas: x[3],
        area: x[4],
        trend: x[5],
        level: x[6],
        x: x[7],
        y: x[8],
        carbon: x[2] * grid + x[3] * gas,
      })),
    [grid, gas],
  );
  let total = data.reduce((s, x) => s + x.carbon, 0),
    b = data[sel];
  const totalPower = data.reduce((s, x) => s + x.kwh, 0);
  const totalArea = data.reduce((s, x) => s + Math.max(x.area, 0), 0);
  const avgIntensity = data.reduce((s, x) => s + x.carbon / Math.max(x.area, 1), 0) / Math.max(data.length, 1);
  const aiInsights = data
    .map((x) => ({ ...x, intensity: x.carbon / Math.max(x.area, 1) }))
    .filter((x) => x.intensity > avgIntensity * 1.2 || x.trend > 5)
    .sort((a, b) => (b.intensity - avgIntensity) - (a.intensity - avgIntensity));
  return (
    <>
      {!data.length ? <section className="panel empty-state"><h2>暂无楼宇数据</h2><p>请前往“数据与地图中心”新增建筑或导入数据。</p></section> : null}
      <section className="metrics">
        <Metric
          I={Zap}
          label="本月综合能耗"
          value={fmt(totalPower / 1000)}
          unit="MWh"
          delta="4.2%"
        />
        <Metric
          I={Leaf}
          label="本月碳排放"
          value={fmt(total / 1000)}
          unit="tCO₂"
          delta="2.8%"
        />
        <Metric
          I={Activity}
          label="单位面积碳强度"
          value={totalArea > 0 ? fmt(total / totalArea) : "—"}
          unit="kgCO₂/m²"
          delta="6.1%"
        />
        <Metric I={AlertTriangle} label="高碳预警" value={aiInsights.length} unit="处" warn />
      </section>
      <section className="main-grid">
        <article className="panel map-panel">
          <header>
            <div>
              <h2>校园能碳空间分布</h2>
              <p>点击楼宇查看能耗与碳排放详情</p>
            </div>
            <button>
              <SlidersHorizontal />
              图层筛选
            </button>
          </header>
          <div className="campus">
            <div className="legend">
              实时能碳分布　
              <span />低 <span />中 <span />高
            </div>
            <i className="road r1" />
            <i className="road r2" />
            {data.map((x) => (
              <button
                key={x.id}
                className={
                  "building " + x.level + (sel === x.id ? " selected" : "")
                }
                style={{ left: x.x + "%", top: x.y + "%" }}
                onClick={() => setSel(x.id)}
              >
                <b>{x.name}</b>
                <small>{fmt(x.carbon / 1000)} tCO₂</small>
              </button>
            ))}
          </div>
          {b && <div className="detail">
            <div>
              <b>{b.name}</b>
              <small>
                {b.type} · {fmt(b.area)} m²
              </small>
            </div>
            {[
              ["本月用电", fmt(b.kwh / 1000) + " MWh"],
              ["碳排放", fmt(b.carbon / 1000) + " tCO₂"],
              ["碳强度", b.area > 0 ? fmt(b.carbon / b.area) + " kg/m²" : "—"],
              ["环比变化", (b.trend > 0 ? "+" : "") + b.trend + "%"],
            ].map((x) => (
              <dl key={x[0]}>
                <dt>{x[0]}</dt>
                <dd>{x[1]}</dd>
              </dl>
            ))}
          </div>}
        </article>
        <section className="stack">
          <article className="panel trend">
            <header>
              <div>
                <h2>碳排放趋势</h2>
                <p>近 6 个月校园运营排放</p>
              </div>
            </header>
            <div className="bars">
              {[
                ["3月", 52],
                ["4月", 49],
                ["5月", 51],
                ["6月", 57],
                ["7月", 64],
                ["8月", 59],
              ].map((x, i) => (
                <div key={x[0]}>
                  <i style={{ height: x[1] * 1.6 }} />
                  <small>{x[0]}</small>
                </div>
              ))}
            </div>
          </article>
          <article className="panel source">
            <header>
              <div>
                <h2>排放来源结构</h2>
                <p>按核算边界分类</p>
              </div>
            </header>
            <div className="sourcebody">
              <div className="donut">
                <b>{fmt(total / 1000)}</b>
                <small>tCO₂</small>
              </div>
              <ul>
                <li>
                  建筑用电 <b>78.4%</b>
                </li>
                <li>
                  食堂燃气 <b>12.6%</b>
                </li>
                <li>
                  校园通勤 <b>6.2%</b>
                </li>
                <li>
                  废弃物 <b>2.8%</b>
                </li>
              </ul>
            </div>
          </article>
        </section>
      </section>
      <section className="bottom">
        <article className="panel ranking">
          <header>
            <div>
              <h2>楼宇能碳排行</h2>
              <p>按本月碳排放量排序</p>
            </div>
          </header>
          {[...data]
            .sort((a, b) => b.carbon - a.carbon)
            .map((x, i) => (
              <div key={x.id} className="rank">
                <span>0{i + 1}</span>
                <div>
                  <b>{x.name}</b>
                  <small>{x.type}</small>
                </div>
                <i>
                  <em
                    style={{ width: (x.carbon / Math.max(...data.map((d) => d.carbon), 1)) * 100 + "%" }}
                  />
                </i>
                <strong>{fmt(x.carbon / 1000)} t</strong>
              </div>
            ))}
        </article>
        <article className="panel alerts">
          <header>
            <div>
              <h2>智能预警与建议</h2>
              <p>算法自动识别异常点位</p>
            </div>
            <mark>{aiInsights.length} 条待处理</mark>
          </header>
          {aiInsights.slice(0,2).map((x)=><div className="alert" key={x.id}><AlertTriangle/><div><b>{x.name}需重点关注</b><p>{x.intensity > avgIntensity * 1.2 ? `碳强度为校园均值的 ${fmt(x.intensity / Math.max(avgIntensity, 0.001))} 倍` : `环比上升 ${x.trend}%`}</p><small>建议核查设备运行时段，并通过仿真评估优化方案</small></div></div>)}
          {!aiInsights.length && <div className="ai-empty">当前数据未触发预警规则。</div>}
        </article>
      </section>
      <section className="panel ai-panel">
        <header><div><h2><Sparkles /> AI辅助分析</h2><p>基于当前楼宇数据的可解释规则分析，不调用外部模型，结果可复核。</p></div><mark>{aiInsights.length} 个重点对象</mark></header>
        <div className="ai-grid">
          {aiInsights.length ? aiInsights.slice(0, 3).map((x) => <div className="ai-card" key={x.id}><b>{x.name}</b><span>{x.intensity > avgIntensity * 1.2 ? "碳强度高于校园均值" : "环比上升"}</span><p>建议优先核查空调、照明及实验设备运行时段，并在仿真页评估改造收益。</p></div>) : <div className="ai-empty">当前未发现超过阈值的重点对象，可继续导入更完整的月度数据。</div>}
        </div>
      </section>
    </>
  );
}
function Sim({ grid }) {
  let [a, setA] = useState(1.5),
    [l, setL] = useState(30),
    [lab, setLab] = useState(18),
    save = a * 14800 + l * 620 + lab * 980;
  return (
    <section className="feature sim">
      <article className="panel form">
        <h2>节能降碳方案仿真</h2>
        <p>调整策略参数，实时量化预计节能量与碳减排收益。</p>
        {[
          ["空调设定温度上调", a, setA, 3, 0.5, "℃"],
          ["照明节能改造覆盖率", l, setL, 100, 1, "%"],
          ["实验室错峰运行比例", lab, setLab, 50, 1, "%"],
        ].map((x) => (
          <label key={x[0]}>
            {x[0]}{" "}
            <b>
              {x[1]}
              {x[5]}
            </b>
            <input
              type="range"
              min="0"
              max={x[3]}
              step={x[4]}
              value={x[1]}
              onChange={(e) => x[2](+e.target.value)}
            />
          </label>
        ))}
        <button className="primary">
          <RefreshCw />
          重新测算
        </button>
      </article>
      <article className="result">
        <Leaf />
        <span>预计年度减排</span>
        <strong>{fmt((save * grid) / 1000)}</strong>
        <em>tCO₂ / 年</em>
        <hr />
        <p>
          预计节电 <b>{fmt(save / 1000)} MWh</b>
        </p>
        <p>
          综合降幅 <b>{fmt((save / 419700) * 100)}%</b>
        </p>
        <p>
          预计节省 <b>¥ {fmt((save * 0.72) / 10000)} 万</b>
        </p>
        <small>基于 Campus-CE v1.0 参数化模型模拟；结果为情景估算，不等同于实测减排。</small>
      </article>
    </section>
  );
}
function Params({ grid, setGrid, gas, setGas }) {
  return (
    <section className="feature">
      <article className="panel params">
        <header>
          <div>
            <h2>算法参数中心</h2>
            <p>参数修改会实时影响驾驶舱全部核算结果</p>
          </div>
        </header>
        {[
          ["电力排放因子", "中国区域电网基准线", grid, setGrid, "kgCO₂/kWh"],
          [
            "天然气排放因子",
            "IPCC 国家温室气体清单指南",
            gas,
            setGas,
            "kgCO₂/m³",
          ],
        ].map((x, i) => (
          <div key={x[0]} className="param">
            <span>
              {i ? <Wind /> : <Zap />}
              <span>
                <b>{x[0]}</b>
                <small>{x[1]}</small>
              </span>
            </span>
            <label>
              <input
                type="number"
                step=".0001"
                value={x[2]}
                onChange={(e) => x[3](+e.target.value)}
              />
              {x[4]}
            </label>
          </div>
        ))}
        <div className="formula">
          <small>校园能碳耦合公式</small>
          <b>
            E<sub>total</sub> = Σ (AD<sub>i</sub> × EF<sub>i</sub>)
          </b>
          <p>活动数据 × 对应排放因子，并按建筑面积计算碳排放强度。</p>
        </div>
      </article>
    </section>
  );
}
function BuildingAnalysis({ grid, gas }) {
  const [query, setQuery] = useState("");
  const rows = raw
    .map((r) => ({
      name: r[0],
      type: r[1],
      power: r[2],
      gas: r[3],
      area: r[4],
      trend: r[5],
      carbon: r[2] * grid + r[3] * gas,
    }))
    .filter((r) => r.name.includes(query) || r.type.includes(query));
  return (
    <section className="feature building-analysis">
      <article className="panel">
        <header>
          <div>
            <h2>楼宇能碳分析</h2>
            <p>查询、比较并核对每栋建筑的核算结果</p>
          </div>
          <input
            placeholder="搜索建筑或类型"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </header>
        <div className="analysis-table">
          <table>
            <thead>
              <tr>
                <th>建筑</th>
                <th>类型</th>
                <th>用电量</th>
                <th>燃气量</th>
                <th>碳排放</th>
                <th>碳强度</th>
                <th>环比</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name}>
                  <td>
                    <b>{r.name}</b>
                  </td>
                  <td>{r.type}</td>
                  <td>{fmt(r.power)} kWh</td>
                  <td>{fmt(r.gas)} m³</td>
                  <td>
                    <strong>{fmt(r.carbon / 1000)} tCO₂</strong>
                  </td>
                  <td>{r.area > 0 ? fmt(r.carbon / r.area) : "—"} kg/m²</td>
                  <td className={r.trend > 0 ? "bad" : "good"}>
                    {r.trend > 0 ? "+" : ""}
                    {r.trend}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
function AIAssist({ grid, gas }) {
  const data = raw.map((r,i)=>({id:i,name:r[0],type:r[1],carbon:r[2]*grid+r[3]*gas,area:r[4],trend:r[5]}));
  const avg=data.reduce((s,x)=>s+x.carbon/Math.max(x.area,1),0)/Math.max(data.length,1);
  const items=data.filter(x=>x.carbon/Math.max(x.area,1)>avg*1.2||x.trend>5);
  return <section className="feature ai-page"><article className="panel ai-hero"><div><h2><Sparkles/> AI辅助分析</h2><p>基于当前数据自动识别重点对象并生成可解释建议。</p></div><strong>{items.length}<small> 个重点对象</small></strong></article><div className="ai-page-grid">{items.length?items.map(x=><article className="panel ai-detail" key={x.id}><header><h3>{x.name}</h3><mark>{x.trend>5?'环比上升':'碳强度偏高'}</mark></header><p>触发原因：碳强度高于校园均值或环比上升超过5%。</p><h4>针对性节能建议</h4><ul><li>核查空调、照明和实验设备运行时段</li><li>在节能方案仿真中比较改造收益</li><li>连续录入下月数据跟踪变化</li></ul></article>):<article className="panel ai-normal"><CheckCircle2/><h3>当前未发现超过阈值的重点对象</h3><p>现有数据未触发碳强度或环比规则。</p></article>}</div></section>;
}
function App() {
  let [open, setOpen] = useState(false),
    [view, setView] = useState(0),
    [grid, setGrid] = useState(0.5703),
    [gas, setGas] = useState(2.1622),
    [version, setVersion] = useState(0),
    titles = [
      "总览驾驶舱",
      "空间能碳地图",
      "楼宇能碳分析",
      "节能方案仿真",
      "算法参数中心",
      "数据与地图中心", "AI辅助分析", "月度历史与对比",
    ];
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("campusCarbonData"));
      if (Array.isArray(saved) && saved.length) {
        const clean = saved.map(sanitizeInternalRow).filter(Boolean);
        if (!clean.length) throw new Error("本地楼宇数据无有效记录");
        raw.splice(0, raw.length, ...clean);
        setVersion((v) => v + 1);
      }
      const map = localStorage.getItem("campusMapImage");
      if (map)
        document.documentElement.style.setProperty(
          "--campus-map",
          `url(${map})`,
        );
      const factors = JSON.parse(localStorage.getItem("campusCarbonFactors"));
      if (factors) {
        if (Number.isFinite(factors.grid) && factors.grid >= 0) setGrid(factors.grid);
        if (Number.isFinite(factors.gas) && factors.gas >= 0) setGas(factors.gas);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("campusCarbonFactors", JSON.stringify({ grid, gas })); } catch {}
  }, [grid, gas]);
  return (
    <div className="app">
      <Side {...{ open, setOpen, view, setView }} />
      <main>
        <header className="top">
          <button onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <div>
            <h1>{titles[view]}</h1>
            <p>数据更新于 {new Date().toLocaleString()} · 运营阶段核算边界</p>
          </div>
          <button onClick={() => setView(5)}>
            <Download />
            导入/导出
          </button>
          <span>校园管理中心</span>
        </header>
        <div className="content">
          {view < 2 ? (
            <Dashboard key={version} {...{ grid, gas }} />
          ) : view === 2 ? (
            <BuildingAnalysis key={version} {...{ grid, gas }} />
          ) : view === 3 ? (
            <Sim grid={grid} />
          ) : view === 4 ? (
            <Params grid={grid} gas={gas} setGrid={(v) => Number.isFinite(v) && v >= 0 && setGrid(v)} setGas={(v) => Number.isFinite(v) && v >= 0 && setGas(v)} />
          ) : view === 7 ? (<History grid={grid} gas={gas}/>) : view === 6 ? (<AIAssist grid={grid} gas={gas} />) : (
            <DataCenter
              gridFactor={grid}
              gasFactor={gas}
              onChange={() => setVersion((v) => v + 1)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
