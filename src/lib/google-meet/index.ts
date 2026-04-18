import { google } from "googleapis";

export interface MeetDetails {
  title: string;
  startTime: Date;
  endTime: Date;
  patientEmail?: string;
  doctorEmail?: string;
  /** Stable idempotency key — use appointmentId to prevent duplicate events */
  requestId?: string;
}

export async function createGoogleMeetLink(details: MeetDetails): Promise<string | null> {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}"),
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    const event = {
      summary: details.title,
      description: "Online Medical Consultation via Smart Clinic",
      start: { dateTime: details.startTime.toISOString(), timeZone: "Africa/Cairo" },
      end:   { dateTime: details.endTime.toISOString(),   timeZone: "Africa/Cairo" },
      conferenceData: {
        createRequest: {
          requestId: details.requestId ?? Math.random().toString(36).substring(7),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      attendees: [
        ...(details.patientEmail ? [{ email: details.patientEmail }] : []),
        ...(details.doctorEmail  ? [{ email: details.doctorEmail  }] : []),
      ],
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,
    });

    return response.data.hangoutLink || null;
  } catch (error) {
    console.error("Error creating Google Meet link:", error);
    return null;
  }
}

/**
 * High-level helper: create a Meet event for a confirmed online appointment.
 * Call this from the approval API route after writing the approved status to Firestore.
 */
export async function createMeetForAppointment(opts: {
  appointmentId: string;
  title: string;
  appointmentDate: Date;
  sessionDurationMinutes?: number;
  patientEmail?: string;
  doctorEmail?: string;
}): Promise<string | null> {
  const endTime = new Date(opts.appointmentDate);
  endTime.setMinutes(endTime.getMinutes() + (opts.sessionDurationMinutes ?? 30));

  return createGoogleMeetLink({
    title: opts.title,
    startTime: opts.appointmentDate,
    endTime,
    patientEmail: opts.patientEmail,
    doctorEmail:  opts.doctorEmail,
    requestId:    opts.appointmentId, // idempotent — same appt always gets same event
  });
}
