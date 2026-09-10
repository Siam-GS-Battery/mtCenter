import * as THREE from "three";

/**
 * ===========================================================================
 * CONTACT SHADOW TEXTURE — วงเบลอเทาใต้ฐานเครื่องจักร
 * ===========================================================================
 *
 * ทำไมไม่ใช้ drei `<ContactShadows>`
 * ----------------------------------
 * `ContactShadows` เรนเดอร์ฉากจากด้านล่างลงเท็กซ์เจอร์เดียวแล้วฉายทับพื้น —
 * ใช้ได้ดีกับฉากขนาดห้อง/โต๊ะที่มีของไม่กี่ชิ้น แต่ไซต์นี้มีเครื่องจักร ~931
 * ตัวกระจายทั่วพื้นที่ 655x1,224 ม. เท็กซ์เจอร์เดียวที่ครอบทั้งไซต์จะแบ่งความ
 * ละเอียดต่อเครื่องเหลือแค่ไม่กี่พิกเซล (แม้ freeze ด้วย `frames={1}` แล้ว
 * เงาที่ได้ก็เบลอจนไม่เห็นรูปทรงเป็นก้อนเดียวกระจายทั้งไซต์ ไม่ใช่เงาติดฐาน
 * รายเครื่อง) ใช้ไม่ได้กับสเกลนี้
 *
 * ทำไมเลือก instanced quad แทน
 * -----------------------------
 * วง gradient โปร่งแสงหนึ่งก้อนต่อ archetype ทำเป็น `InstancedMesh` ได้เหมือน
 * ตัวเครื่องเอง (ดู `ArchetypeInstances` ใน `MachineInstances.tsx`) จึงได้เงา
 * ติดฐานราย "เครื่อง" จริง ๆ (ไม่ใช่เบลอรวมทั้งไซต์) ที่ ~10 draw call เพิ่ม
 * (จำนวน archetype) ไม่ว่าจะมีเครื่อง 931 หรือ 9,310 ตัว — สเกลแบบเดียวกับ
 * ตัวเครื่อง ไม่ใช่ O(จำนวนเครื่อง)
 *
 * เท็กซ์เจอร์นี้สร้างจาก canvas ล้วนตอน mount ครั้งเดียว (ไม่ใช่ไฟล์ภาพ —
 * ข้อจำกัดเดิมของฉากทั้งชุดคือห้ามใช้ asset ภายนอก) แชร์ใช้ร่วมกันทุก
 * archetype ผ่าน material เดียว
 */
export function createContactShadowTexture(size = 64): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const center = size / 2;
    // ไล่จางจากกลางออกขอบ — เข้มสุดตรงกลาง (ใต้ฐานเครื่องพอดี) จางเป็นศูนย์
    // ก่อนถึงขอบเท็กซ์เจอร์ ให้ขอบวงไม่มีรอยตัดคม
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, "rgba(0,0,0,0.55)");
    gradient.addColorStop(0.55, "rgba(0,0,0,0.28)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
