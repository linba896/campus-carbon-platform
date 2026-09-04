import fs from "node:fs/promises";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const OUT = "C:/Users/Dsx88/Desktop/534班丁奕辰-港澳假期见闻.pptx";
const TMP = "C:/Users/Dsx88/Documents/New project/tmp/ppt_dingyichen/rendered-6p";
const ASSETS = {
  hku: "C:/Users/Dsx88/Documents/xwechat_files/wxid_0o5lvhwviat722_7abb/temp/RWTemp/2026-08/f533c3a39d34333ab249f4376ab4b3da/f5efdd62871917644e3da7860bbe5228.jpg",
  disney: "C:/Users/Dsx88/Documents/xwechat_files/wxid_0o5lvhwviat722_7abb/temp/RWTemp/2026-08/f533c3a39d34333ab249f4376ab4b3da/4addd81da706f953fb601d22e8554067.jpg",
  hkuPortrait: "C:/Users/Dsx88/Documents/xwechat_files/wxid_0o5lvhwviat722_7abb/temp/RWTemp/2026-08/f533c3a39d34333ab249f4376ab4b3da/ac2eafa3f1e625e284e938bf9a5bdede.jpg",
  um: "C:/Users/Dsx88/Documents/xwechat_files/wxid_0o5lvhwviat722_7abb/temp/RWTemp/2026-08/f533c3a39d34333ab249f4376ab4b3da/8d1ac1de9abbdeae6bdb41084c45fb9c.jpg",
};

const W = 960;
const H = 1358;
const FONT = "Microsoft YaHei";
const INK = "#1E2A32";
const BODY = "#38464D";
const RED = "#A14F35";
const BLUE = "#2A6877";
const PAPER = "#FCFCFA";

async function bytes(path) {
  const data = await fs.readFile(path);
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}

function text(slide, { name, value, left, top, width, height, size, color = BODY, bold = false, align = "left", lineSpacing = 1.45 }) {
  const box = slide.shapes.add({ geometry: "textbox", name, position: { left, top, width, height }, fill: "none", line: { style: "solid", fill: "none", width: 0 } });
  box.text = value;
  box.text.style = { fontFamily: FONT, fontSize: size, color, bold, alignment: align, verticalAlignment: "middle", lineSpacing };
  return box;
}

function rule(slide, color) {
  slide.shapes.add({ geometry: "rect", name: "accent-rule", position: { left: 70, top: 150, width: 150, height: 5 }, fill: color, line: { style: "solid", fill: color, width: 0 } });
}

function heading(slide, title, color = RED) {
  text(slide, { name: "title", value: title, left: 70, top: 64, width: 820, height: 70, size: 38, color: INK, bold: true });
  rule(slide, color);
}

async function photo(slide, path, position, alt, fit = "cover") {
  slide.images.add({ blob: await bytes(path), contentType: "image/jpeg", alt, fit, position });
}

async function main() {
  const deck = Presentation.create({ slideSize: { width: W, height: H } });

  {
    const slide = deck.slides.add();
    slide.background.fill = PAPER;
    text(slide, { name: "title", value: "假期里的港澳见闻", left: 90, top: 62, width: 780, height: 86, size: 46, color: INK, bold: true, align: "center" });
    text(slide, { name: "identity", value: "534班  丁奕辰", left: 90, top: 151, width: 780, height: 40, size: 21, color: RED, align: "center" });
    slide.shapes.add({ geometry: "rect", position: { left: 410, top: 210, width: 140, height: 5 }, fill: RED, line: { style: "solid", fill: RED, width: 0 } });
    text(slide, { name: "opening", value: "这个假期，我走进香港与澳门。短短的旅程中，既有大学校园里的安静与思考，也有主题乐园里的欢笑与惊喜。不同的城市气质、校园建筑和文化氛围，让我对外面的世界有了更具体的认识。", left: 105, top: 245, width: 750, height: 250, size: 24, color: "#343434", align: "center", lineSpacing: 1.55 });
    await photo(slide, ASSETS.hku, { left: 90, top: 535, width: 780, height: 585 }, "香港大学校景");
    text(slide, { name: "route", value: "香港大学  ·  香港迪士尼  ·  澳门大学", left: 90, top: 1145, width: 780, height: 52, size: 22, color: BLUE, bold: true, align: "center" });
    text(slide, { name: "lead", value: "一次出发，让假期有了故事；一次观察，让成长有了新的方向。", left: 105, top: 1210, width: 750, height: 82, size: 21, color: "#5F6A70", align: "center" });
  }

  {
    const slide = deck.slides.add();
    slide.background.fill = PAPER;
    heading(slide, "走进香港大学，感受开放的校园", RED);
    await photo(slide, ASSETS.hkuPortrait, { left: 70, top: 195, width: 430, height: 1010 }, "香港大学留影");
    text(slide, { name: "section", value: "红砖与绿意之间", left: 540, top: 220, width: 350, height: 55, size: 27, color: RED, bold: true });
    text(slide, { name: "body1", value: "走进香港大学，最先吸引我的是校园里的红砖建筑。它们与玻璃幕墙、绿树和水景相互映衬，既保留了历史感，又充满现代气息。", left: 540, top: 295, width: 350, height: 250, size: 22 });
    text(slide, { name: "body2", value: "站在校园中，我能感受到一种安静而开放的学习氛围。来往的师生步伐匆匆，不同语言和文化在这里交汇，让我对大学生活产生了更多向往。", left: 540, top: 570, width: 350, height: 285, size: 22 });
    text(slide, { name: "body3", value: "这次参观让我明白，一所大学不仅有漂亮的建筑，更重要的是它能够给人提供思考、交流和探索的空间。", left: 540, top: 885, width: 350, height: 230, size: 22 });
    text(slide, { name: "takeaway", value: "看见校园，也看见未来的可能。", left: 540, top: 1160, width: 350, height: 86, size: 23, color: RED, bold: true, align: "center" });
  }

  {
    const slide = deck.slides.add();
    slide.background.fill = "#F9FBFB";
    heading(slide, "在香港迪士尼，收藏快乐的瞬间", BLUE);
    text(slide, { name: "intro", value: "离开安静的校园，我来到了充满童话色彩的香港迪士尼。高高的城堡、精心布置的街道和欢快的音乐，让人一走进园区就感受到轻松与期待。", left: 80, top: 185, width: 800, height: 160, size: 23, align: "center" });
    await photo(slide, ASSETS.disney, { left: 170, top: 375, width: 620, height: 760 }, "香港迪士尼城堡留影");
    text(slide, { name: "reflection", value: "旅行并不只有参观和学习，也需要放松和体验。站在城堡前留影的那一刻，我感受到假期里的自在，也体会到和家人一起分享快乐的珍贵。照片会定格画面，而共同经历的欢笑会留在记忆里。", left: 100, top: 1160, width: 760, height: 145, size: 21, color: "#445158", align: "center" });
  }

  {
    const slide = deck.slides.add();
    slide.background.fill = "#F8FAFA";
    heading(slide, "澳门大学让我看到更开阔的学习空间", BLUE);
    await photo(slide, ASSETS.um, { left: 70, top: 195, width: 820, height: 850 }, "澳门大学留影");
    text(slide, { name: "body1", value: "来到澳门大学，宏大的建筑、宽阔的广场和整洁的校园环境给我留下了深刻印象。站在大学标志前，我不只是完成了一次留影，也开始认真想象自己未来的学习生活。", left: 90, top: 1070, width: 780, height: 125, size: 22, align: "center" });
    text(slide, { name: "body2", value: "香港大学与澳门大学各有特色，但都让我感受到知识带来的吸引力。参观大学不是简单地看建筑，而是在心里种下一颗目标的种子。", left: 90, top: 1200, width: 780, height: 105, size: 21, color: BLUE, bold: true, align: "center" });
  }

  {
    const slide = deck.slides.add();
    slide.background.fill = PAPER;
    heading(slide, "旅途中的观察，让我收获更多", RED);
    text(slide, { name: "lead", value: "这次港澳之行虽然时间有限，却让我从不同角度理解了旅行的意义。", left: 90, top: 185, width: 780, height: 95, size: 25, color: INK, bold: true, align: "center" });
    text(slide, { name: "part1Title", value: "看见不同", left: 100, top: 330, width: 260, height: 50, size: 27, color: RED, bold: true });
    text(slide, { name: "part1", value: "香港与澳门都拥有独特的城市风貌。现代建筑、历史文化和多元语言同时出现在日常生活中，让我意识到世界可以如此丰富。", left: 100, top: 390, width: 760, height: 165, size: 23 });
    text(slide, { name: "part2Title", value: "学会观察", left: 100, top: 600, width: 260, height: 50, size: 27, color: BLUE, bold: true });
    text(slide, { name: "part2", value: "旅途中，我会留意校园的建筑、道路的秩序和人们的生活节奏。只有认真观察，照片背后的风景才会变成真正属于自己的体验。", left: 100, top: 660, width: 760, height: 165, size: 23 });
    text(slide, { name: "part3Title", value: "确定方向", left: 100, top: 870, width: 260, height: 50, size: 27, color: RED, bold: true });
    text(slide, { name: "part3", value: "两所大学带给我的最大启发，是让我对未来有了更清晰的期待。想要走进更广阔的校园，需要从现在开始积累知识、培养习惯，并保持好奇心。", left: 100, top: 930, width: 760, height: 185, size: 23 });
    text(slide, { name: "closing", value: "旅行拓宽眼界，目标推动成长。", left: 100, top: 1195, width: 760, height: 70, size: 28, color: BLUE, bold: true, align: "center" });
  }

  {
    const slide = deck.slides.add();
    slide.background.fill = "#F4F7F6";
    text(slide, { name: "eyebrow", value: "假期感悟", left: 90, top: 105, width: 780, height: 42, size: 22, color: RED, bold: true, align: "center" });
    text(slide, { name: "title", value: "带着好奇出发，带着目标归来", left: 90, top: 175, width: 780, height: 110, size: 43, color: INK, bold: true, align: "center" });
    slide.shapes.add({ geometry: "rect", position: { left: 395, top: 315, width: 170, height: 5 }, fill: BLUE, line: { style: "solid", fill: BLUE, width: 0 } });
    text(slide, { name: "body", value: "港澳之行给我的，不只是四张照片和几处景点的回忆。它让我亲眼看到不同的校园，感受到多元文化，也让我更加珍惜与家人一起旅行的时光。\n\n回到熟悉的学习生活后，这些见闻仍会提醒我：外面的世界很大，值得去了解；未来的道路很长，需要一步一步认真走。\n\n我会把旅行中的新鲜感转化为学习中的动力，保持观察、思考和探索，在成长的路上遇见更好的自己。", left: 130, top: 390, width: 700, height: 545, size: 25, align: "center", lineSpacing: 1.6 });
    text(slide, { name: "quote", value: "愿每一次出发，都成为下一次成长的起点。", left: 105, top: 1010, width: 750, height: 90, size: 29, color: RED, bold: true, align: "center" });
    text(slide, { name: "identity", value: "534班  丁奕辰", left: 105, top: 1165, width: 750, height: 50, size: 22, color: "#68747A", align: "center" });
  }

  await fs.mkdir(TMP, { recursive: true });
  for (const [i, slide] of deck.slides.items.entries()) {
    const png = await deck.export({ slide, format: "png", scale: 1 });
    await fs.writeFile(`${TMP}/slide-${i + 1}.png`, new Uint8Array(await png.arrayBuffer()));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(`${TMP}/slide-${i + 1}.layout.json`, await layout.text());
  }
  const montage = await deck.export({ format: "webp", montage: true, scale: 1 });
  await fs.writeFile(`${TMP}/montage.webp`, new Uint8Array(await montage.arrayBuffer()));
  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(OUT);
  console.log(OUT);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
