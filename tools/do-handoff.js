// CHECK DEM -> DO: loaded at the end of check-dem.html and do-checkdem.html (build/sync.js adds it).
// Every finished CHECK DEM is stored in localStorage "doCheckDem"; the DO page reads it when it opens,
// or at once if it is already open (storage event). Uses the Check-dem page's report, OUTPUT_NAME and
// buildXlsx() (sync.js splits download() into buildXlsx() + download()).
// data-step="1": DO's step ① page (step bar, links inside the DO tool); otherwise the Check DEM tool.
(function () {
  const doStep = document.currentScript.dataset.step === "1";
  const $ = id => document.getElementById(id);

  if (doStep) {
    const css = document.createElement("style");
    css.textContent =
      ".stepnav{background:#fff;border-bottom:1px solid var(--line)}" +
      ".stepnav .wrap{display:flex;gap:6px;align-items:center;padding:8px 16px;flex-wrap:wrap}" +
      ".stepnav a{text-decoration:none;color:var(--navy);font-weight:600;padding:6px 14px;border-radius:999px;border:1px solid var(--line)}" +
      ".stepnav a.on{background:var(--navy);color:#fff!important;border-color:var(--navy)}" +
      ".stepnav span{color:var(--muted)}";
    document.head.appendChild(css);
    const nav = document.createElement("nav");
    nav.className = "stepnav";
    nav.innerHTML = '<div class="wrap"><a href="do-checkdem.html" class="on">① CHECK DEM</a><span>→</span><a href="do.html">② DO</a>' +
                    '<span style="margin-left:auto"></span><a href="guide-do.html">Guide</a></div>';
    const main = document.querySelector("main");
    main.parentNode.insertBefore(nav, main);
    document.querySelectorAll('a[href^="guide-check-dem"]').forEach(a => a.href = "guide-do.html");
  }

  const dl = $("download");
  const go = document.createElement("button");
  go.id = "toDo"; go.type = "button"; go.textContent = "Go to DO →";
  dl.after(go);
  new MutationObserver(() => { go.disabled = dl.disabled; }).observe(dl, { attributes: true, attributeFilter: ["disabled"] });
  go.disabled = dl.disabled;

  async function sendToDo() {
    if (typeof report === "undefined" || !report || !report.data) return false;
    const buf = new Uint8Array(await buildXlsx());
    let b64 = "";
    for (let i = 0; i < buf.length; i += 0x8000) b64 += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    try {
      localStorage.setItem("doCheckDem", JSON.stringify({ name: OUTPUT_NAME, b64: btoa(b64), at: Date.now(), bls: report.data.length }));
      $("msg").innerHTML = '<span style="color:#006100">✓ CHECK DEM (' + report.data.length + " B/L) sent to DO — open DO, or press Go to DO →</span>";
      return true;
    } catch (e) {
      $("msg").textContent = "This browser cannot pass it on — download CHECK DEM.xlsx and drop it on the DO page";
      return false;
    }
  }

  const compute = $("run").onclick;
  $("run").onclick = async () => { await compute(); await sendToDo(); };
  go.onclick = async () => {
    if (!(await sendToDo())) return;
    if (doStep) location.href = "do.html";
    else if (window.top !== window.self) window.top.location.hash = "do";   // the combined site's DO tab
    else location.href = "do.html";
  };
})();
