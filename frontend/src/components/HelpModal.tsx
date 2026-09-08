import React from "react";
import { HelpCircle, ClipboardList, QrCode, Package } from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "./ui/Modal";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Modal size="md" onClose={onClose}>
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-ink tracking-[-0.02em]">
            วิธีใช้งานระบบ MT Center
          </h3>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-3 text-xs text-ink-muted leading-relaxed">
          <div className="p-3 bg-divider rounded-[11px] border-0 space-y-1.5">
            <div className="font-semibold text-ink flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-primary" />
              <span>ขั้นตอนของใบงานซ่อม</span>
            </div>
            <p>
              ใบงานทุกใบเดินตามลำดับเดียวกัน: <span className="font-semibold">รอดำเนินการ</span>{" "}
              เมื่อเปิดใบงานใหม่ → <span className="font-semibold">กำลังซ่อม</span>{" "}
              เมื่อช่างรับงานและเริ่มปฏิบัติงาน → <span className="font-semibold">รอตรวจสอบ</span>{" "}
              เมื่อช่างบันทึกผลการซ่อมครบแล้ว → วิศวกรตรวจสอบและ{" "}
              <span className="font-semibold">อนุมัติปิดงาน</span>
            </p>
            <p>
              ช่างดูงานที่รับผิดชอบได้ที่เมนู "ใบงานของฉัน" ส่วนวิศวกรตรวจงานที่รอการอนุมัติได้ที่เมนู
              "รอตรวจสอบ"
            </p>
          </div>

          <div className="p-3 bg-divider rounded-[11px] border-0 space-y-1.5">
            <div className="font-semibold text-ink flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>การสแกนเครื่องจักร</span>
            </div>
            <p>
              สแกนป้าย QR ที่ติดหน้าเครื่องจักร ระบบจะเปิดหน้าข้อมูลของเครื่องนั้นทันที
              ทั้งประวัติการซ่อม ค่าเซนเซอร์ล่าสุด และใบงานคงค้าง
              หรือเลือกเครื่องได้จากช่อง "เครื่องจักรที่กำลังตรวจสอบ" ด้านบนของหน้าหลักช่างซ่อมบำรุง
              (ป้ายสถานะเครื่องบนแถบด้านบนเป็นตัวบอกสถานะอย่างเดียว กดเลือกไม่ได้)
            </p>
          </div>

          <div className="p-3 bg-divider rounded-[11px] border-0 space-y-1.5">
            <div className="font-semibold text-ink flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-700" />
              <span>การเบิกอะไหล่</span>
            </div>
            <p>
              ระบุอะไหล่ที่ต้องใช้ได้ตั้งแต่ตอนเปิดใบงาน หรือเพิ่มภายหลังในหน้ารายละเอียดใบงาน
              ตรวจสอบจำนวนคงคลังและตำแหน่งจัดเก็บได้ที่เมนู "อะไหล่"
              รายการเบิกจะติดไปกับใบงานเพื่อให้วิศวกรเห็นตอนตรวจสอบ
            </p>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-xs cursor-pointer active:scale-95 transition-all"
        >
          เข้าใจแล้ว ปิดหน้าต่าง
        </button>
      </ModalFooter>
    </Modal>
  );
};
