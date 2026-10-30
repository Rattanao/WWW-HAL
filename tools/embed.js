// โหลดในทุกเครื่องมือ (ใส่ไว้ใน <head>) เพื่อเพิ่มของที่เว็บรวมต้องการโดยไม่แก้โค้ดต้นฉบับ:
//  1. แสดงในเว็บรวม: ซ่อนหัว/ท้ายของเครื่องมือ ใช้ธีมสว่าง
//  2. ปุ่ม "ลบไฟล์" ข้างปุ่มประมวลผล สำหรับเครื่องมือที่ยังไม่มี
//  3. ตรวจการเข้าสู่ระบบ (auth.js) เมื่อเว็บถูกล็อค

// โหลดแบบ synchronous ระหว่างอ่าน <head> เพื่อให้ตรวจก่อนหน้าเครื่องมือแสดง
document.write('<script src="auth.js"><\/script><script>HAL_AUTH.guard()<\/script>');

(function () {
  const root = document.documentElement;
  if (window.self !== window.top) {
    root.classList.add("embedded");
    root.setAttribute("data-theme", "light");
  }

  const style = document.createElement("style");
  style.textContent = `
    html.embedded body>header, html.embedded body>footer { display: none !important; }
    html.embedded body { background: #fff !important; }
    html.embedded main { max-width: none !important; padding: 18px 20px 28px !important; }
    html.embedded .wrap { max-width: none !important; }
    .x-btns { display: flex; gap: 10px; align-items: stretch; }
    button.x-clear { font: inherit; font-weight: 600; font-size: 15px; padding: 10px 18px; border-radius: 6px; cursor: pointer;
      background: #fff !important; color: var(--navy, #1f3f94) !important; border: 1px solid var(--navy, #1f3f94) !important; white-space: nowrap; }
    button.x-clear:hover { background: #eef2fb !important; }

    /* ตัวหนังสือเล็กลง ให้ดูไม่รก (ทุกเครื่องมือในเว็บรวม) */
    html.compact body { font-size: 14px; }
    html.compact .card { padding: 14px 16px; }
    html.compact label.t { font-size: 14px; margin-bottom: 4px; }
    html.compact label.t small { font-size: 12.5px; }
    html.compact .drop { font-size: 14px; padding: 8px 12px; min-height: 42px; }
    html.compact input[type=text], html.compact select { font-size: 14px; padding: 6px 9px; }
    html.compact button { font-size: 14px; padding: 8px 16px; }
    html.compact button.small { font-size: 12.5px; padding: 5px 10px; }
    html.compact .inputs, html.compact .staff { gap: 10px; }
    html.compact .staff { margin-top: 10px; }
    html.compact .rules { font-size: 12.5px; line-height: 1.5; }
    html.compact .hint, html.compact .msg { font-size: 13.5px; }
    html.compact .info div { padding: 6px 12px; font-size: 13.5px; }
    html.compact table { font-size: 13.5px; }
    html.compact th { padding: 7px 8px; }
    html.compact td { padding: 5px 8px; }
    html.compact tr.bls td { font-size: 12px; }
  `;
  if (root.classList.contains("embedded")) root.classList.add("compact");
  document.head.appendChild(style);

  // ---- สีของเว็บรวม: ตัวหนังสือสีน้ำเงิน -> ส้ม, เส้นประ -> เขียวเข้ม, ตัวหนังสือใหญ่ -> เล็กลง ----
  // อ่าน CSS ของเครื่องมือแล้วแก้ค่าในกฎเดิม จึงใช้ได้กับทุกเครื่องมือโดยไม่แก้โค้ดต้นฉบับ
  const ORANGE = "#e2501f", GREEN = "#1b5e20";
  function restyle() {
    if (!root.classList.contains("embedded")) return;
    const rootStyle = getComputedStyle(root);
    const resolve = v => v.replace(/var\((--[\w-]+)\)/g, (m, n) => rootStyle.getPropertyValue(n).trim() || m);
    const probe = document.createElement("span");
    document.body.appendChild(probe);
    const rgb = v => { probe.style.color = ""; probe.style.color = resolve(v); return (getComputedStyle(probe).color.match(/\d+/g) || []).map(Number); };
    const isBlue = v => { const [r, g, b] = rgb(v); return b !== undefined && b > r + 30 && b >= g && r < 110; };
    const walk = rules => [...rules].forEach(r => {
      if (r.cssRules && !r.selectorText) return walk(r.cssRules);
      if (!r.style || !r.selectorText) return;
      const sel = r.selectorText, st = r.style;
      if (/prefers-color-scheme|data-theme="dark"/.test(sel)) return;
      // ปุ่มและหัวตารางเป็นตัวหนังสือบนพื้นสี ไม่เปลี่ยน
      if (st.color && !/button|\bth\b|\.btn|header|footer|\.over/.test(sel) && isBlue(st.color)) st.setProperty("color", ORANGE, "important");
      if (/dashed/.test(st.borderStyle || st.border) && !/\.over/.test(sel)) st.setProperty("border-color", GREEN, "important");
      const px = parseFloat(st.fontSize);
      if (/px$/.test(st.fontSize) && px >= 16 && !/header|footer|\.topbar/.test(sel)) st.setProperty("font-size", Math.round(px * 0.875 * 2) / 2 + "px");
    });
    for (const sheet of document.styleSheets) {
      if (sheet.ownerNode === style) continue;
      try { walk(sheet.cssRules); } catch (e) { /* stylesheet ของเว็บอื่น (Google Fonts) อ่านไม่ได้ */ }
    }
    probe.remove();
  }
  document.addEventListener("DOMContentLoaded", restyle);

  // ---- ปุ่มลบไฟล์ ----
  document.addEventListener("DOMContentLoaded", () => {
    // เครื่องมือมีปุ่มของตัวเองแล้ว (DO: #clear, Change Status: #clearAll)
    if (document.querySelector("#clear, #clearAll") || [...document.querySelectorAll("button")].some(b => ["ลบไฟล์", "Clear files"].includes(b.textContent.trim()))) return;
    const run = document.querySelector("#run, #go");
    if (!run) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "x-clear";
    b.textContent = "Clear files";
    b.title = "Clear all files and results and start over";
    // โหลดหน้าใหม่ด้วย URL ใหม่ เพื่อไม่ให้เบราว์เซอร์คืนค่าที่กรอกไว้
    b.addEventListener("click", () => location.replace(location.pathname + "?clear=" + Date.now()));
    if (run.parentElement.classList.contains("row")) {
      run.after(b);
    } else {
      const wrap = document.createElement("div");
      wrap.className = "x-btns";
      run.replaceWith(wrap);
      wrap.append(run, b);
    }
  });
})();
