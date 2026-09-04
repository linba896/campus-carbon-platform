import React, { useRef, useState } from "react";
import mammoth from "mammoth/mammoth.browser";
import {
  FileText,
  MapPinned,
  Plus,
  Save,
  Trash2,
  Upload,
  CheckCircle2,
  Download,
} from "lucide-react";
import { raw } from "./main.jsx";
import "./data.css";
import "./map.css";

const types = [
  "教学楼",
  "实验楼",
  "宿舍",
  "食堂",
  "公共建筑",
  "体育馆",
  "其他",
];
const headers = [
  "建筑名称",
  "建筑类型",
  "用电量(kWh)",
  "燃气量(m³)",
  "面积(m²)",
  "环比(%)",
  "横坐标(%)",
  "纵坐标(%)",
];
const normalize = (r) => [
  r[0] || "未命名建筑",
  r[1] || "其他",
  +r[2] || 0,
  +r[3] || 0,
  +r[4] || 1,
  +r[5] || 0,
  (+r[2] || 0) > 100000 ? "high" : (+r[2] || 0) > 70000 ? "mid" : "low",
  +r[6] || 50,
  +r[7] || 50,
];

function parseDelimited(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const sep = lines[0].includes("\t") ? "\t" : ",";
  return lines
    .slice(1)
    .map((line) =>
      normalize(line.split(sep).map((v) => v.trim().replace(/^"|"$/g, ""))),
    );
}
function parseDocText(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const hit = line.match(
      /(.{2,20}?(?:楼|宿舍|食堂|馆|中心))[^\d]*(\d{3,})[^\d]+(\d{3,})/,
    );
    if (hit)
      rows.push(
        normalize([
          hit[1],
          hit[1].includes("实验")
            ? "实验楼"
            : hit[1].includes("宿舍")
              ? "宿舍"
              : hit[1].includes("食堂")
                ? "食堂"
                : "教学楼",
          hit[2],
          0,
          hit[3],
          0,
          40 + rows.length * 8,
          25 + rows.length * 10,
        ]),
      );
  }
  return rows;
}

export default function DataCenter({ onChange, gridFactor, gasFactor }) {
  try {
    const saved = JSON.parse(localStorage.getItem("campusCarbonData"));
    if (saved?.length && !raw._restored) {
      raw.splice(0, raw.length, ...saved);
      raw._restored = true;
    }
  } catch {}
  const [fileName, setFileName] = useState(""),
    [message, setMessage] = useState(""),
    [preview, setPreview] = useState(""),
    [period, setPeriod] = useState(localStorage.getItem("campusCarbonPeriod") || "2026-08"),
    [quality, setQuality] = useState(localStorage.getItem("campusCarbonQuality") || "模拟数据"),
    [tick, setTick] = useState(0),
    mapRef = useRef();
  const refresh = () => {
    localStorage.setItem("campusCarbonData", JSON.stringify(raw));
    localStorage.setItem("campusCarbonPeriod", period);
    localStorage.setItem("campusCarbonQuality", quality);
    setTick((x) => x + 1);
    onChange?.();
  };
  const importRows = (rows) => {
    if (!rows.length) {
      setMessage("没有识别到结构化楼宇数据，请使用下方表格手工补充。");
      return;
    }
    raw.splice(0, raw.length, ...rows);
    refresh();
    setMessage(`已导入 ${rows.length} 栋建筑，能碳结果已重新计算。`);
  };
  const readFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    try {
      if (f.name.endsWith(".docx")) {
        const result = await mammoth.extractRawText({
          arrayBuffer: await f.arrayBuffer(),
        });
        setPreview(result.value.slice(0, 1200));
        const tableRows = parseDelimited(result.value);
        importRows(tableRows.length ? tableRows : parseDocText(result.value));
      } else {
        const text = await f.text();
        setPreview(text.slice(0, 1200));
        importRows(
          f.name.endsWith(".json")
            ? JSON.parse(text).map(normalize)
            : parseDelimited(text),
        );
      }
    } catch (err) {
      setMessage("读取失败：请检查文件格式或数据字段。");
    }
    e.target.value = "";
  };
  const update = (i, j, v) => {
    raw[i][j >= 6 ? j + 1 : j] = j === 0 || j === 1 ? v : +v;
    raw[i][6] = raw[i][2] > 100000 ? "high" : raw[i][2] > 70000 ? "mid" : "low";
    refresh();
  };
  const add = () => {
    raw.push(["新建筑", "教学楼", 0, 0, 1000, 0, "low", 50, 50]);
    refresh();
  };
  const remove = (i) => {
    raw.splice(i, 1);
    refresh();
  };
  const download = (name, text, type = "text/csv;charset=utf-8") => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + text], { type }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const template = () =>
    download(
      "校园楼宇能耗导入模板.csv",
      headers.join(",") + "\n示例教学楼,教学楼,50000,0,12000,0,50,50",
    );
  const backup = () =>
    download(
      "校园能碳数据备份.json",
      JSON.stringify(raw, null, 2),
      "application/json",
    );
  const qualityStats = {
    buildings: raw.length,
    empty: raw.reduce((n, r) => n + r.slice(0, 5).filter((v) => v === "" || v == null).length, 0),
    negative: raw.reduce((n, r) => n + r.slice(2, 5).filter((v) => Number(v) < 0).length, 0),
    zeroArea: raw.filter((r) => Number(r[4]) <= 0).length,
  };
  const movePin = (e, i) => {
    e.preventDefault();
    const box = e.currentTarget.getBoundingClientRect(),
      x = Math.max(
        0,
        Math.min(100, ((e.clientX - box.left) / box.width) * 100),
      ),
      y = Math.max(
        0,
        Math.min(100, ((e.clientY - box.top) / box.height) * 100),
      );
    raw[i][7] = +x.toFixed(1);
    raw[i][8] = +y.toFixed(1);
    refresh();
  };
  const uploadMap = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      document.documentElement.style.setProperty(
        "--campus-map",
        `url(${reader.result})`,
      );
      mapRef.current.style.setProperty("--campus-map", `url(${reader.result})`);
      try {
        localStorage.setItem("campusMapImage", reader.result);
      } catch {
        setMessage("地图已载入，但图片较大，无法在浏览器中长期保存。");
      }
      setMessage(
        "校园底图已载入，并已同步到总览空间分布图。可继续调整每栋建筑的坐标。",
      );
    };
    reader.readAsDataURL(f);
    localStorage.setItem("campusMapName", f.name);
  };
  const report = () => {
    const total = raw.reduce(
      (s, r) => s + r[2] * gridFactor + r[3] * gasFactor,
      0,
    );
    const rows = raw
      .map(
        (r) =>
          `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${((r[2] * gridFactor + r[3] * gasFactor) / 1000).toFixed(2)}</td></tr>`,
      )
      .join("");
    const w = window.open("", "_blank");
    w.document.write(
      `<meta charset="utf-8"><title>校园能碳分析报告</title><style>body{font-family:Arial,"Microsoft YaHei";padding:48px;color:#17342e}h1{color:#126b58}table{width:100%;border-collapse:collapse;margin:24px 0}th,td{border:1px solid #dce8e3;padding:10px;text-align:left}th{background:#eaf5f1}.hero{background:#126b58;color:white;padding:24px}.hero b{font-size:32px}.meta{background:#f2f8f5;padding:14px;border-radius:8px}</style><h1>校园能碳分析报告</h1><p>生成时间：${new Date().toLocaleString()}</p><div class="meta"><b>核算月份：</b>${period}　<b>数据性质：</b>${quality}　<b>模型版本：</b>Campus-CE v1.0</div><div class="hero">核算期总碳排放<br><b>${(total / 1000).toFixed(2)} tCO₂</b></div><h2>楼宇能碳明细</h2><table><thead><tr><th>建筑</th><th>类型</th><th>用电量(kWh)</th><th>燃气量(m³)</th><th>碳排放(tCO₂)</th></tr></thead><tbody>${rows}</tbody></table><h2>数据校验摘要</h2><p>建筑数量：${qualityStats.buildings}；空值：${qualityStats.empty}；负值：${qualityStats.negative}；面积为0：${qualityStats.zeroArea}。</p><h2>核算说明</h2><p>采用能耗—碳排放耦合公式 E = Σ(AD × EF)。电力排放因子 ${gridFactor} kgCO₂/kWh，天然气排放因子 ${gasFactor} kgCO₂/m³。本报告结果用于平台演示与方案比较，不能替代审计结论。</p><script>setTimeout(()=>window.print(),300)</script>`,
    );
    w.document.close();
  };
  return (
    <section className="data-page">
      <div className="data-meta panel"><label>核算月份<input type="month" value={period} onChange={e=>{setPeriod(e.target.value);setTimeout(refresh,0)}}/></label><label>数据性质<select value={quality} onChange={e=>{setQuality(e.target.value);setTimeout(refresh,0)}}><option>真实数据</option><option>调研数据</option><option>模拟数据</option><option>估算数据</option></select></label><span>数据质量会随报告一起记录，避免把模拟结果误认为实测结果。</span></div>
      <div className="import-grid">
        <article className="panel import-card">
          <Upload />
          <h2>导入能耗数据或调研报告</h2>
          <p>
            支持 Word（.docx）、CSV、TSV 和
            JSON。系统会尝试识别建筑名称、用电量和面积。
          </p>
          <label className="upload-btn">
            <input
              type="file"
              accept=".docx,.csv,.tsv,.json"
              onChange={readFile}
            />
            <FileText />
            选择文件
          </label>
          <button className="report-btn" onClick={template}>
            <Download /> 下载模板
          </button>
          <button className="report-btn" onClick={backup}>
            <Save /> 备份数据
          </button>
          {fileName && <small>{fileName}</small>}
          {message && (
            <div className="success">
              <CheckCircle2 />
              {message}
            </div>
          )}
        </article>
        <article className="panel import-card">
          <MapPinned />
          <h2>导入学校地图底图</h2>
          <p>
            支持 PNG/JPG
            校园总平面图。导入后使用坐标字段调整各建筑在地图中的位置。
          </p>
          <label className="upload-btn secondary">
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={uploadMap}
            />
            <MapPinned />
            选择校园地图
          </label>
          <button className="report-btn" onClick={report}>
            <Download />
            导出能碳报告
          </button>
        </article>
      </div>
      <article className="panel editor">
        <header>
          <div>
            <h2>楼宇能耗与地图坐标编辑</h2>
            <p>所有修改将直接参与算法核算和空间分布展示</p>
          </div>
          <button onClick={add}>
            <Plus />
            新增建筑
          </button>
        </header>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {headers.map((h) => (
                  <th key={h}>{h}</th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {raw.map((r, i) => (
                <tr key={i}>
                  {[r[0], r[1], r[2], r[3], r[4], r[5], r[7], r[8]].map(
                    (v, j) => (
                      <td key={j}>
                        {j === 1 ? (
                          <select
                            value={v}
                            onChange={(e) => update(i, j, e.target.value)}
                          >
                            {types.map((t) => (
                              <option key={t}>{t}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={v}
                            type={j > 1 ? "number" : "text"}
                            onChange={(e) => update(i, j, e.target.value)}
                          />
                        )}
                      </td>
                    ),
                  )}
                  <td>
                    <button className="delete" onClick={() => remove(i)}>
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
      <article className="panel quality-card"><header><div><h2>数据校验摘要</h2><p>导入或编辑后自动检查基础字段，便于在申报材料中留痕。</p></div><CheckCircle2 /></header><div className="quality-grid"><b>建筑数量 <strong>{qualityStats.buildings}</strong></b><b>空值 <strong>{qualityStats.empty}</strong></b><b>负值 <strong>{qualityStats.negative}</strong></b><b>面积为 0 <strong>{qualityStats.zeroArea}</strong></b></div></article>
      <article className="panel map-preview">
        <header>
          <div>
            <h2>学校地图配置预览</h2>
            <p>横纵坐标对应建筑在底图中的百分比位置</p>
          </div>
          <span>
            <Save />
            自动保存
          </span>
        </header>
        <div
          className="editable-map"
          ref={mapRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => movePin(e, +e.dataTransfer.getData("pin"))}
        >
          {raw.map((r, i) => (
            <button
              draggable
              onDragStart={(e) => e.dataTransfer.setData("pin", i)}
              key={i}
              className={"map-pin " + r[6]}
              style={{ left: r[7] + "%", top: r[8] + "%" }}
              title="拖动以调整建筑位置"
            >
              {r[0]}
            </button>
          ))}
        </div>
      </article>
      {preview && (
        <details className="raw-preview">
          <summary>查看文档识别文本</summary>
          <pre>{preview}</pre>
        </details>
      )}
    </section>
  );
}
