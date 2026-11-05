// CHECK DEM -> DO: loaded at the end of check-dem.html (build/sync.js adds it), so the Check DEM tool sends
// its result to DO like DO's own step ① page (do-checkdem.html, from the DO repo).
// Every finished CHECK DEM is stored in localStorage "doCheckDem"; the DO page reads it when it opens,
// or at once if it is already open (storage event). Uses the Check-dem page's report, OUTPUT_NAME and
// buildXlsx() (sync.js splits download() into buildXlsx() + download()).
(function () {
  const $ = id => document.getElementById(id);

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
    if (window.top === window.self) { location.href = "do.html"; return; }
    // the combined site's DO tab; if it was left on its step ① page, bring it to ② DO
    const f = window.top.document.querySelector('iframe[data-id="do"]');
    try { if (f && !/\/do\.html$/.test(f.contentWindow.location.pathname)) f.contentWindow.location.href = "do.html"; } catch (e) { }
    window.top.location.hash = "do";
  };
})();
