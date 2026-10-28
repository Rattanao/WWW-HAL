// ปุ่มสลับภาษา ไทย / English บนหน้าคู่มือ (ใส่ท้าย <body> ของทุก guide-*.html)
// คู่มือภาษาไทยคือ guide-<tool>.html (ดึงจาก repo ต้นทาง), ภาษาอังกฤษคือ guide-<tool>-en.html
// เว็บรวมเปิดคู่มือภาษาอังกฤษเป็นค่าเริ่มต้น (ลิงก์ใน index.html ชี้ไป -en) กด ไทย เพื่อดูฉบับภาษาไทย
(function () {
  var m = (location.pathname.split("/").pop() || "").match(/^guide-(.+?)(-en)?\.html$/);
  if (!m) return;
  var id = m[1], isEn = !!m[2];

  var thUrl = "guide-" + id + ".html", enUrl = "guide-" + id + "-en.html";

  var css = document.createElement("style");
  css.textContent =
    ".lang-switch{position:fixed;top:12px;right:12px;z-index:50;display:flex;border:1px solid var(--navy,#1f4e78);border-radius:999px;overflow:hidden;background:var(--paper,#fff);box-shadow:0 2px 8px rgba(0,0,0,.12);font:600 14px/1 var(--body,system-ui,sans-serif)}" +
    ".lang-switch a{padding:8px 14px;text-decoration:none;color:var(--navy,#1f4e78)}" +
    ".lang-switch a[aria-current]{background:var(--navy,#1f4e78);color:var(--navy-ink,#fff)}" +
    ".lang-switch a:focus-visible{outline:3px solid var(--accent,#1f4e78);outline-offset:-3px}" +
    "@media print{.lang-switch{display:none}}";
  document.head.appendChild(css);

  var bar = document.createElement("nav");
  bar.className = "lang-switch";
  bar.setAttribute("aria-label", "ภาษา / Language");
  [["th", "ไทย", thUrl, !isEn], ["en", "English", enUrl, isEn]].forEach(function (o) {
    var a = document.createElement("a");
    a.href = o[2];
    a.lang = o[0];
    a.textContent = o[1];
    if (o[3]) a.setAttribute("aria-current", "page");
    bar.appendChild(a);
  });
  document.body.appendChild(bar);
})();
