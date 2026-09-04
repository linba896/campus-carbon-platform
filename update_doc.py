from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
p='校园能碳平台建设思路与落地方案.docx'; d=Document(p)
# replace cover title/subtitle
for para in d.paragraphs[:3]:
 if '校园能碳平台' in para.text and '建设思路' not in para.text:
  para.clear(); r=para.add_run('校园能碳算法驱动的高校能耗—碳排放耦合可视化管控平台开发'); r.bold=True; r.font.size=Pt(26); r.font.color.rgb=RGBColor(11,93,88); para.alignment=WD_ALIGN_PARAGRAPH.CENTER
 if '建设思路与落地方案' in para.text:
  para.clear(); r=para.add_run('参赛方向适配与项目实施方案'); r.font.size=Pt(18); r.font.color.rgb=RGBColor(22,139,130); para.alignment=WD_ALIGN_PARAGRAPH.CENTER
# append explicit competition alignment
h=d.add_heading('八、参赛方向适配说明',1)
d.add_paragraph('本项目完全匹配赛道一开放赛道方向 2“智能控碳——数字化与工艺优化赋能精准降碳”。项目以校园能碳算法为核心技术，以能耗—碳排放耦合模型为智能控碳核心，以可视化管控平台为成果形态，重点验证模型设计、数据意识、方案可解释性与数字化精准降碳能力。')
d.add_paragraph('场景边界聚焦高校建成后日常运营，覆盖教学楼、实验室、宿舍、食堂、体育馆及公共区域；数据采用校园实地调研、公开统计与模拟数据，不要求大规模新增硬件部署。平台通过“数据统计—高碳预警—节能方案仿真—效果反馈”形成闭环。')
d.add_heading('报名表可直接使用的项目简介（140字以内）',2)
d.add_paragraph('本项目面向高校校园运营场景，研发基于校园能碳算法的能耗—碳排放耦合可视化管控平台。依托校园调研及模拟数据构建校园专属核算模型，实现楼宇级能耗碳排放测算、高碳点位预警、节能方案减排效益仿真。平台轻量化、无需大规模硬件部署，解决高校能耗与碳排放数据割裂、难以定位高排放区域、缺少量化降碳决策依据等痛点，为高校后勤提供数字化智能控碳工具。')
d.save(p)
print('updated')
