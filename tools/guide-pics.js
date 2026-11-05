// คู่มือแบบภาพ: ใส่ภาพหน้าจอของเครื่องมือ (assets/guide/<tool>.png) พร้อมหมายเลขขั้นตอน ไว้ด้านบนของหน้าคู่มือ
// โหลดจาก guide-lang.js จึงอยู่รอดเมื่อดึง guide.html ใหม่จาก repo ต้นทาง
// ภาพถ่ายใหม่ได้ด้วย _test/shot/shot.js (headless Chrome) ซึ่งเขียนตำแหน่งหมายเลข (marks) ให้ด้วย
// marks: [ขั้นที่, x%, y%, กว้าง%, สูง%] ของช่องในภาพ
(function () {
  var m = (location.pathname.split("/").pop() || "").match(/^guide-(.+?)(-en)?\.html$/);
  if (!m) return;
  var id = m[1], en = !!m[2];
  // 2-language page (own .langs switch, html[data-lang] hides .th / .en): write both languages
  var both = !!document.querySelector(".langs [data-lang]");
  function t(th, eng) { return both ? "<span class=\"th\">" + th + "</span><span class=\"en\">" + eng + "</span>" : en ? eng : th; }

  var PICS = {
    "check-cntrs": { w: 982, h: 255, marks: [[1,4.99,26.27,70.71,16.47],[2,77.12,33.33,7.12,14.12],[4,85.26,33.33,9.75,14.12]] },
    "change-status": { w: 982, h: 643, marks: [[1,4.89,11.66,26.68,4.35],[2,4.89,26.2,26.68,4.35],[3,4.89,40.74,44.6,6.37],[4,4.89,63.59,90.22,5.29],[5,4.89,49.91,44.5,6.06],[7,50.41,49.91,44.7,6.06]] },
    "cut-bl": { w: 982, h: 670, marks: [[1,4.89,11.19,26.68,4.18],[2,4.89,25.13,90.22,5.07],[3,4.89,58.4,90.22,9.96],[4,4.89,45.27,44.5,5.82],[6,50.41,45.27,44.7,5.82]] },
    "bayplan": { w: 982, h: 595, marks: [[1,4.89,12.78,90.22,7.06],[2,4.89,32.95,90.22,7.06],[3,22.91,42.7,22.81,5.72],[4,4.89,74.68,8.59,6.22],[5,85.32,74.51,9.79,6.56]] },
    "sum-edi": { w: 982, h: 569, marks: [[1,4.99,14.94,43.33,7.38],[2,49.34,12.48,21.66,9.84],[3,4.99,32.34,29.33,5.98],[4,4.99,43.94,29.33,6.33],[5,72.02,8.61,22.99,5.98],[7,85.26,15.99,9.75,6.33]] },
    "do": { w: 982, h: 439, marks: [[1,4.99,26.42,56.03,9.57],[2,62.04,26.42,32.97,9.57],[3,4.99,43.51,27.5,9.57],[4,62.04,43.28,13.24,9.79],[5,76.29,44.87,8.16,8.2],[7,85.26,44.87,9.75,8.2]] }
  };

  // ขั้นตอน [ไทย, English] — ลำดับตรงกับหมายเลขในภาพ (ขั้นที่ไม่มีหมายเลขในภาพ = ทำหลังกดประมวลผล)
  var STEPS = {
    "check-cntrs": [
      ["ลากไฟล์ <b>MANIFEST</b> และ <b>CNTRS</b> (.xls / .xlsx / .pdf) มาวางพร้อมกัน", "Drop the <b>MANIFEST</b> and <b>CNTRS</b> files (.xls / .xlsx / .pdf) here together"],
      ["กด <b>Check</b>", "Click <b>Check</b>"],
      ["ดูผลในตาราง (ช่องที่ไม่ตรงขึ้นสี) แล้วกด <b>Download CNTRS_EDI.xlsx</b>", "Read the results table (mismatches are coloured), then click <b>Download CNTRS_EDI.xlsx</b>"],
      ["กด <b>Clear files</b> เพื่อเริ่มงานใหม่", "Click <b>Clear files</b> to start a new job"]
    ],
    "change-status": [
      ["เลือกไฟล์ <b>MMAN (.txt)</b>", "Choose the <b>MMAN (.txt)</b> file"],
      ["เลือกไฟล์ <b>STATUS</b> (.xls / .xlsx / .csv) — คอลัมน์ A–C: B/L No., Status, POL", "Choose the <b>STATUS</b> file (.xls / .xlsx / .csv) — columns A–C: B/L No., Status, POL"],
      ["<b>SHED NO.</b> ช่องซ้าย = B/L ที่มี Status (0145) · ช่องขวา = B/L ที่เหลือ (0122) · ลบช่องขวาให้ว่าง = ใช้ช่องซ้ายทุก B/L", "<b>SHED NO.</b> left box = B/Ls with a Status (0145) · right box = the rest (0122) · empty right box = left box for every B/L"],
      ["<b>Start B/L / End B/L</b> (ไม่ใส่ก็ได้) — ตัดเก็บเฉพาะช่วง B/L · ว่างทั้งสองช่อง = ใช้ทั้งไฟล์", "<b>Start B/L / End B/L</b> (optional) — keep only this B/L range · both empty = whole file"],
      ["กด <b>Change</b>", "Click <b>Change</b>"],
      ["ตรวจตัวอย่างบรรทัดที่แก้ แล้วกด <b>Download MMAN_EDI.txt</b>", "Check the sample changed lines, then click <b>Download MMAN_EDI.txt</b>"],
      ["กด <b>Clear files</b> เพื่อเริ่มงานใหม่", "Click <b>Clear files</b> to start a new job"]
    ],
    "cut-bl": [
      ["เลือกไฟล์ <b>HMAN (.txt)</b>", "Choose the <b>HMAN (.txt)</b> file"],
      ["<b>แบบที่ 1 ตัดช่วง</b>: ใส่ <b>Cut from B/L</b> และ <b>To B/L</b> (ช่องถัดลงมา) — ว่างช่องแรก = ตั้งแต่ H02 แรก · ว่างช่องหลัง = ถึงบรรทัดสุดท้าย", "<b>Mode 1, cut a range</b>: fill in <b>Cut from B/L</b> and <b>To B/L</b> (the box below it) — first empty = from the first H02 · second empty = to the last line"],
      ["<b>หรือ แบบที่ 2</b>: ใส่ B/L ที่ต้องการเก็บใน <b>Or keep only these B/Ls</b> คั่นด้วย , หรือขึ้นบรรทัดใหม่ (ใช้ได้ทีละแบบ)", "<b>Or mode 2</b>: list the B/Ls to keep in <b>Or keep only these B/Ls</b>, separated by , or new lines (one mode at a time)"],
      ["กด <b>Cut B/L</b>", "Click <b>Cut B/L</b>"],
      ["ตรวจตาราง B/L ที่ตัด / ที่เหลือ แล้วกด <b>Download …_PORTAL.txt</b>", "Check the table of cut / kept B/Ls, then click <b>Download …_PORTAL.txt</b>"],
      ["กด <b>Clear files</b> เพื่อเริ่มงานใหม่", "Click <b>Clear files</b> to start a new job"]
    ],
    "bayplan": [
      ["ลากไฟล์ Bayplan (.asc) มาวาง หรือคลิกเพื่อเลือกไฟล์", "Drop the Bayplan file (.asc) here, or click to choose it"],
      ["ติ๊กท่าที่จะเก็บ (LCH / BKK) — ตัวเลขข้างท่า = จำนวนตู้ HUL ของท่านั้น", "Tick the ports to keep (LCH / BKK) — the number next to a port = its HUL containers"],
      ["<b>Agents changed to HUL</b> ปกติ HAL,HAC,HAS,HUL ไม่ต้องแก้", "<b>Agents changed to HUL</b>: normally HAL,HAC,HAS,HUL, no need to change"],
      ["ตรวจตัวเลขและส่วนไฮไลต์ แล้วกด <b>Save file</b> (ได้ไฟล์ …_HUL_BKK-LCH.asc ในโฟลเดอร์ Downloads) หรือ <b>Copy text</b>", "Check the numbers and the highlights, then click <b>Save file</b> (…_HUL_BKK-LCH.asc in your Downloads folder) or <b>Copy text</b>"],
      ["กด <b>Clear files</b> เพื่อเริ่มงานใหม่", "Click <b>Clear files</b> to start a new job"]
    ],
    "sum-edi": [
      ["ลากไฟล์ <b>MF</b> + <b>CNTRS</b> (+ เอกสารแนบ ATTACHED) มาวางพร้อมกัน — Excel / PDF / รูป", "Drop the <b>MF</b> + <b>CNTRS</b> files (+ ATTACHED sheets) here together — Excel / PDF / images"],
      ["เลือกรูป<b>ลายเซ็น</b> (.png / .jpg) ครั้งเดียว เบราว์เซอร์จำไว้", "Choose your <b>signature</b> image (.png / .jpg) once; the browser remembers it"],
      ["ใส่ <b>ชื่อผู้จัดทำ / ตำแหน่ง / เบอร์โทร</b> ท้าย SUM-EDI (จำไว้ในเบราว์เซอร์)", "Fill in <b>Prepared by / Position / Phone</b> for the end of SUM-EDI (remembered in this browser)"],
      ["เลือก <b>LATKRABANG GATE</b> (2 หรือ 8) สำหรับหน้า THLKR", "Choose the <b>LATKRABANG GATE</b> (2 or 8) for the THLKR pages"],
      ["กด <b>Process</b>", "Click <b>Process</b>"],
      ["ตรวจตารางและกล่องแจ้งเตือน ดูภาพเอกสารด้วย <b>Full view</b> แล้วกด <b>Download all</b> (SUM-EDI.pdf, SUMMARY.pdf, MF-….pdf, CNTRS.pdf)", "Check the table and the warning box, view pages with <b>Full view</b>, then click <b>Download all</b> (SUM-EDI.pdf, SUMMARY.pdf, MF-….pdf, CNTRS.pdf)"],
      ["กด <b>Clear files</b> เพื่อเริ่มงานใหม่", "Click <b>Clear files</b> to start a new job"]
    ],
    "do": [
      ["ลากไฟล์ <b>DO / ATTACHED / ใบเปิดตู้</b> (.pdf) มาวาง ลำดับไหนก็ได้", "Drop the <b>DO / ATTACHED / ใบเปิดตู้</b> files (.pdf) here, in any order"],
      ["ลากไฟล์ <b>CHECK DEM.xlsx</b> (จาก Check DEM) มาวาง — ไม่ใส่ก็ได้", "Drop <b>CHECK DEM.xlsx</b> (from Check DEM) here — optional"],
      ["ไม่มี CHECK DEM: ใส่ <b>DEM. date</b> และ/หรือ <b>Power charge date</b> เอง", "Without CHECK DEM: fill in <b>DEM. date</b> and/or <b>Power charge date</b> yourself"],
      ["<b>Font size</b> ขนาดตัวอักษรที่พิมพ์ลง D/O", "<b>Font size</b> of the text printed on the D/O"],
      ["กด <b>Process</b>", "Click <b>Process</b>"],
      ["ตรวจตาราง (ช่องวันที่สีแดง = ยังไม่มีวันที่) · ใบเปิดตู้ที่ไม่ตรงแก้ได้ในตาราง · กด <b>Download DO-DEM.pdf (x1 + x2)</b> หรือ <b>Print x2</b>", "Check the table (red date cell = no date yet) · fix a mismatched ใบเปิดตู้ in its table · click <b>Download DO-DEM.pdf (x1 + x2)</b> or <b>Print x2</b>"],
      ["กด <b>Clear files</b> เพื่อเริ่มงานใหม่", "Click <b>Clear files</b> to start a new job"]
    ]
  };

  var pic = PICS[id], steps = STEPS[id];
  if (!pic || !steps) return;

  var css = document.createElement("style");
  css.textContent =
    ".pics{--o:#e2501f}" +
    ".pics .shot{position:relative;margin:14px 0 18px;border:1px solid #d5dae3;border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.06)}" +
    ".pics .shot img{display:block;width:100%;height:auto}" +
    ".pics .mk{position:absolute;border:2.5px solid var(--o);border-radius:6px;pointer-events:none}" +
    ".pics .mk b{position:absolute;left:-13px;top:-13px;width:26px;height:26px;border-radius:50%;background:var(--o);color:#fff;font:700 14px/26px system-ui,sans-serif;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.25)}" +
    ".pics ol{list-style:none;margin:0;padding:0;display:grid;gap:8px}" +
    ".pics li{display:flex;gap:10px;align-items:flex-start;line-height:1.55}" +
    ".pics li i{flex:0 0 26px;height:26px;border-radius:50%;background:var(--o);color:#fff;font:700 14px/26px system-ui,sans-serif;font-style:normal;text-align:center}" +
    ".pics li.after i{background:#fff;color:var(--o);border:2px solid var(--o);line-height:22px;box-sizing:border-box}" +
    "@media (max-width:640px){.pics .mk b{width:20px;height:20px;font-size:12px;line-height:20px;left:-10px;top:-10px}}";
  document.head.appendChild(css);

  var marked = {};
  pic.marks.forEach(function (k) { marked[k[0]] = true; });
  var sec = document.createElement("section");
  sec.className = "panel pics";
  sec.id = "pictures";
  sec.innerHTML =
    "<h2>" + t("คู่มือแบบภาพ", "Picture guide") + "</h2>" +
    "<p class=\"sub\">" + t("ทำตามหมายเลขในภาพ หมายเลขวงกลมเส้นขอบ = ทำหลังกดประมวลผล (ปุ่มจะขึ้นใต้ฟอร์ม)",
                                 "Follow the numbers on the picture. A number in an outlined circle is done after processing (it appears under the form).") + "</p>" +
    "<div class=\"shot\"><img src=\"assets/guide/" + id + ".png\" width=\"" + pic.w + "\" height=\"" + pic.h + "\" alt=\"" +
      (en || both ? "Screen of the tool with numbered steps" : "หน้าจอเครื่องมือพร้อมหมายเลขขั้นตอน") + "\" loading=\"lazy\">" +
      pic.marks.map(function (k) {
        return "<span class=\"mk\" style=\"left:" + k[1] + "%;top:" + k[2] + "%;width:" + k[3] + "%;height:" + k[4] + "%\"><b>" + k[0] + "</b></span>";
      }).join("") + "</div>" +
    "<ol>" + steps.map(function (s, i) {
      return "<li" + (marked[i + 1] ? "" : " class=\"after\"") + "><i>" + (i + 1) + "</i><span>" + t(s[0], s[1]) + "</span></li>";
    }).join("") + "</ol>";

  var first = document.querySelector("section.panel, main section, section");
  if (first) first.parentNode.insertBefore(sec, first);
  else document.body.appendChild(sec);
})();
