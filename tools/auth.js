// ระบบ User ID / Password ของเว็บรวม (โหลดใน index.html และในทุกเครื่องมือผ่าน embed.js)
//
// locked: false = ยังไม่ล็อค ทุกคนเข้าได้ (ทดสอบหน้าเข้าสู่ระบบได้ที่ ...WWW-HAL/?login)
//         true  = ต้องเข้าสู่ระบบก่อนใช้งาน
//
// เพิ่มผู้ใช้: เปิด tools/add-user.html กรอก User ID + Password แล้วคัดลอกบรรทัดที่ได้มาวางใน users ด้านล่าง
// ลบผู้ใช้: ลบบรรทัดของคนนั้นออก
// รหัสผ่านเก็บเป็นค่า SHA-256 ของ "USERID:password" (User ID ตัวพิมพ์ใหญ่, Password ต้องพิมพ์ให้ตรงตัวพิมพ์)
window.HAL_AUTH = {
  locked: false,
  users: {
    "KAN": "f9ea86f0166304782f090754ae37d87f685f0e7f2c95ab33b18165a3200094b5",
    "AOR": "fa1055e62c937c34a4646844c4edd2f33a0f611f537b22ec3eba81b968b63c34",
    "YAH": "2982c106d3a50922ec39c8a153877fa8339cdc5057f002f5dfa04cc21cf72979",
    "FAH": "2e561c2bcb4f44c50636ad7085ca55276be3759e2c29f3eaf935ead9ed6b5b41",
    "BEN": "c1fa68fc129ab3a71e9ce7964317dd68220a863fd3e67be54e346d1bf6ac9164",
    "BEE": "ba8ff32a405a61ecdb35cc8b4f6a31bbe86c78778dc045c2819673a491a51cc8",
  },

  // ผู้ใช้ที่เข้าสู่ระบบอยู่ (จำไว้จนปิดเบราว์เซอร์)
  user() {
    try { return sessionStorage.getItem("hal-user"); } catch (e) { return null; }
  },
  async signIn(id, password) {
    id = id.trim().toUpperCase();
    const want = this.users[id];
    if (!want) return false;
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(id + ":" + password));
    const hex = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
    if (hex !== want) return false;
    try { sessionStorage.setItem("hal-user", id); } catch (e) {}
    return true;
  },
  signOut() {
    try { sessionStorage.removeItem("hal-user"); } catch (e) {}
  },
  // หน้าเครื่องมือที่เปิดตรง ๆ โดยยังไม่เข้าสู่ระบบ: ส่งไปหน้าเข้าสู่ระบบของเว็บรวม
  guard() {
    if (!this.locked || this.user()) return;
    document.documentElement.style.visibility = "hidden";
    const page = (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
    window.top.location.replace(new URL("../#" + page, location.href).href);
  }
};
