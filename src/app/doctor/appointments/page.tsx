import { DoctorAppointmentList } from "@/components/appointments/DoctorAppointmentList";

export default function DoctorAppointmentsPage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-12 animate-fade-in-up">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">My <span className="text-primary">Appointments</span></h1>
        <p className="text-gray-500 font-medium max-w-2xl">
          Complete history and upcoming schedule. Select an appointment to view details or manage medical records.
        </p>
      </div>

      <div className="animate-fade-in-up animate-delay-100">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
           <h2 className="text-xl font-extrabold text-gray-900">Historical & Upcoming</h2>
           <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all">Filter By Date</button>
              <button className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/10 transition-all">Today</button>
           </div>
        </div>
        
        <DoctorAppointmentList />
      </div>
    </div>
  );
}
