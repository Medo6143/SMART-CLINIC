"use client";

import { Prescription, Medication } from "@/domain/entities/Prescription";
import { useRef } from "react";
import { IoPrintOutline, IoInformationCircleOutline } from "react-icons/io5";

interface PrescriptionCardProps {
  prescription: Prescription;
  doctorName?: string;
  patientName?: string;
  clinicName?: string;
}

export function PrescriptionCard({
  prescription,
  doctorName,
  patientName,
  clinicName,
}: PrescriptionCardProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription - ${prescription.id.slice(0, 8)}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; background: #fff; color: #111; padding: 48px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 3px solid #111; margin-bottom: 32px; }
            .clinic-name { font-size: 22px; font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase; }
            .rx-symbol { font-size: 64px; font-weight: 900; opacity: 0.08; position: absolute; right: 48px; top: 32px; }
            .meta { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-bottom: 4px; }
            .value { font-size: 15px; font-weight: 700; color: #111; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-bottom: 40px; }
            .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 900; color: #999; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 16px; }
            .med-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 16px; border: 1px solid #eee; border-radius: 12px; margin-bottom: 10px; }
            .med-name { font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.03em; }
            .med-detail { font-size: 12px; color: #666; margin-top: 4px; }
            .med-freq { font-size: 12px; font-weight: 900; text-transform: uppercase; color: #007AFF; text-align: right; }
            .med-dur { font-size: 11px; color: #999; text-align: right; }
            .notes-box { background: #f9f9f9; border-radius: 12px; padding: 20px; margin-top: 24px; }
            .signature-line { margin-top: 64px; display: flex; justify-content: flex-end; }
            .sig { border-top: 2px solid #111; padding-top: 12px; width: 200px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #666; }
            .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #eee; font-size: 10px; color: #bbb; text-align: center; text-transform: uppercase; letter-spacing: 0.1em; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all">
      {/* Card Header */}
      <div className="relative bg-gray-900 text-white px-6 py-5 overflow-hidden">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[80px] font-bold opacity-5 select-none leading-none">℞</div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="inline-block px-2.5 py-1 bg-primary/20 text-primary rounded-md text-[11px] font-semibold mb-2">
              #{prescription.id.slice(0, 8).toUpperCase()}
            </span>
            <p className="text-lg font-bold">
              {clinicName || "Smart Clinic"}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              {prescription.createdAt.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-all active:scale-95 border border-white/10"
          >
            <IoPrintOutline className="text-sm" />
            Print
          </button>
        </div>
      </div>

      {/* Printable Content (hidden on page but captured by print) */}
      <div ref={printRef} style={{ display: "none" }}>
        <div className="header">
          <div>
            <div className="clinic-name">{clinicName || "Smart Clinic"}</div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              Digital Medical Prescription
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="meta">Date</div>
            <div className="value">
              {prescription.createdAt.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            <div className="meta" style={{ marginTop: "8px" }}>Prescription ID</div>
            <div className="value">#{prescription.id.slice(0, 8).toUpperCase()}</div>
          </div>
        </div>

        <div className="info-grid">
          <div>
            <div className="meta">Patient Name</div>
            <div className="value">{patientName || "Patient"}</div>
          </div>
          <div>
            <div className="meta">Attending Physician</div>
            <div className="value">Dr. {doctorName || prescription.doctorId.slice(0, 8)}</div>
          </div>
          <div>
            <div className="meta">Total Medications</div>
            <div className="value">{prescription.medications.length} Items</div>
          </div>
        </div>

        <div className="section-title">Prescribed Medications</div>
        {prescription.medications.map((med: Medication, i: number) => (
          <div key={i} className="med-row">
            <div>
              <div className="med-name">{med.name}</div>
              <div className="med-detail">Dosage: {med.dosage} {med.route ? `(${med.route})` : ""}</div>
            </div>
            <div>
              <div className="med-freq">{med.frequency}</div>
              <div className="med-dur">{med.duration}</div>
            </div>
          </div>
        ))}

        {prescription.notes && (
          <div className="notes-box">
            <div className="section-title">Special Instructions</div>
            <p style={{ fontSize: "13px", color: "#444", fontStyle: "italic" }}>"{prescription.notes}"</p>
          </div>
        )}

        <div className="signature-line">
          <div className="sig">Physician Signature</div>
        </div>

        <div className="footer">
          This prescription is digitally generated by Smart Clinic. Valid for 30 days from issue date.
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        {/* Info row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 pb-5 border-b border-gray-50">
          <div>
            <p className="text-[11px] font-medium text-gray-400 mb-0.5">المريض</p>
            <p className="font-semibold text-gray-900">{patientName || "مريض"}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-400 mb-0.5">الطبيب المعالج</p>
            <p className="font-semibold text-gray-900">
              د. {doctorName || prescription.doctorId.slice(0, 8)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-400 mb-0.5">تاريخ الكشف</p>
            <p className="font-semibold text-gray-900">
              {prescription.createdAt.toLocaleDateString("ar-EG", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Diagnosis */}
        {prescription.diagnosis && (
          <div className="mb-5 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-[11px] font-bold text-blue-500 mb-1 uppercase tracking-wide">التشخيص</p>
            <p className="text-sm font-semibold text-blue-900">{prescription.diagnosis}</p>
            {prescription.diagnosisCodes && prescription.diagnosisCodes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {prescription.diagnosisCodes.map((c, i) => (
                  <span key={i} className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">{c.code} {c.label}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vital Signs */}
        {prescription.vitalSigns && Object.values(prescription.vitalSigns).some(Boolean) && (
          <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-wide">العلامات الحيوية</p>
            <div className="grid grid-cols-3 gap-2">
              {prescription.vitalSigns.bloodPressure && (
                <div className="text-center"><p className="text-xs text-gray-400">ضغط الدم</p><p className="font-bold text-sm">{prescription.vitalSigns.bloodPressure}</p></div>
              )}
              {prescription.vitalSigns.heartRate && (
                <div className="text-center"><p className="text-xs text-gray-400">النبض</p><p className="font-bold text-sm">{prescription.vitalSigns.heartRate} bpm</p></div>
              )}
              {prescription.vitalSigns.temperature && (
                <div className="text-center"><p className="text-xs text-gray-400">درجة الحرارة</p><p className="font-bold text-sm">{prescription.vitalSigns.temperature}°C</p></div>
              )}
              {prescription.vitalSigns.oxygenSaturation && (
                <div className="text-center"><p className="text-xs text-gray-400">الأكسجين</p><p className="font-bold text-sm">{prescription.vitalSigns.oxygenSaturation}%</p></div>
              )}
              {prescription.vitalSigns.weight && (
                <div className="text-center"><p className="text-xs text-gray-400">الوزن</p><p className="font-bold text-sm">{prescription.vitalSigns.weight} كج</p></div>
              )}
            </div>
          </div>
        )}

        {/* Medications */}
        <div className="space-y-3 mb-5">
          <p className="text-[11px] font-semibold text-gray-400">
            الأدوية الموصوفة ({prescription.medications.length})
          </p>
          {prescription.medications.map((med: Medication, i: number) => (
            <div
              key={i}
              className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100/70 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-0.5">{med.name}</h4>
                  <p className="text-xs text-gray-500">
                    Dosage: <span className="text-gray-700 font-medium">{med.dosage}</span>
                    {med.route && <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] uppercase font-bold text-gray-500">{med.route}</span>}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold text-primary mb-0.5">{med.frequency}</p>
                <p className="text-[11px] text-gray-400">{med.duration}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Patient Instructions */}
        {prescription.patientInstructions && (
          <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4 flex items-start gap-2.5">
            <IoInformationCircleOutline className="text-green-500 text-base shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-green-600 mb-1">تعليمات للمريض</p>
              <p className="text-sm text-green-900 leading-relaxed">{prescription.patientInstructions}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        {prescription.notes && (
          <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-2.5">
            <IoInformationCircleOutline className="text-amber-500 text-base shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-amber-600 mb-1">ملاحظات إضافية</p>
              <p className="text-sm text-amber-900 leading-relaxed">{prescription.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
