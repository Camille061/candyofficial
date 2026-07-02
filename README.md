# 🍬 Candy Bot — Live Viewer Counter

ระบบนับผู้เข้าชมแบบ realtime ด้วย WebSocket

---

## ไฟล์ที่มี

| ไฟล์ | คืออะไร |
|------|---------|
| `server.js` | Backend Node.js + WebSocket server |
| `package.json` | Dependencies |
| `widget.html` | โค้ด HTML/JS ที่นำไปวางในเว็บ |

---

## ติดตั้ง

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. รัน server
npm start

# dev mode (auto-restart เมื่อแก้ไฟล์)
npm run dev
```

server จะรันที่ `http://localhost:3001`

---

## นำ Widget ไปใส่เว็บ

เปิดไฟล์ `widget.html` แล้วคัดลอกทุกอย่างไปวางในหน้าเว็บ Candy Bot

**จุดที่ต้องแก้ก่อน:**

```js
// บรรทัดนี้ใน widget.html
const WS_URL = "ws://localhost:3001";

// เปลี่ยนเป็น URL server จริงของคุณ เช่น
const WS_URL = "wss://candy-viewer.onrender.com";
```

> ⚠️ ถ้าเว็บใช้ `https://` ต้องใช้ `wss://` (ไม่ใช่ `ws://`)

---

## Deploy บน Render.com (ฟรี)

1. สร้าง repo ใหม่บน GitHub แล้ว push ไฟล์ทั้งหมด
2. ไปที่ [render.com](https://render.com) → New → Web Service
3. ตั้งค่า:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. หลัง deploy เสร็จ จะได้ URL เช่น `https://candy-viewer.onrender.com`
5. แก้ `WS_URL` ใน widget เป็น `wss://candy-viewer.onrender.com`

---

## REST API (สำรอง)

ถ้าไม่อยากใช้ WebSocket ก็ดึงข้อมูลแบบ polling ได้:

```
GET http://localhost:3001/viewers
```

Response:
```json
{
  "count": 5,
  "history": [3, 4, 5, ...],
  "updatedAt": 1716789123456
}
```

---

## วางตำแหน่ง Widget ในเว็บ

แนะนำให้วางใน **header** ของ Candy Bot:

```html
<!-- ใน .nav-links -->
<nav class="nav-links">
  <a href="#features">ฟีเจอร์</a>
  <a href="#commands">คำสั่ง</a>

  <!-- วาง widget ตรงนี้ -->
  <div id="viewer-widget">...</div>

  <button id="invite-btn" class="btn-invite">...</button>
</nav>
```
