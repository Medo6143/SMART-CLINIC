# Smart Clinic - Web Patient/Doctor Portal

The public-facing portal for the Smart Clinic platform, built with **Next.js 16**. This application allows patients to browse clinics and for both patients and doctors to access their medical records securely.

---

## 🚀 Key Features

- **Clinic Discovery**: Search and view clinic details via a responsive web interface.
- **WhatsApp Integration**: "Book via WhatsApp" flow for seamless patient onboarding.
- **Patient Dashboard**: Real-time access to upcoming appointments, prescriptions, and medical history.
- **Doctor Portal**: Lightweight dashboard for practitioners to check their daily schedules and patient history.
- **Bilingual Interface**: Seamless support for Arabic (RTL) and English (LTR).

---

## 🛠️ Getting Started

### 1. Prerequisites
Ensure you have **Node.js 18+** installed.

### 2. Configure Firebase
Create a `.env.local` file in this directory and add your Firebase project credentials. See [.env.example](.env.example) for reference.

### 3. Installation
```bash
npm install
```

### 4. Development Server
```bash
npm run dev
```

---

## 📚 Full Documentation

For detailed information on architecture, the WhatsApp-first flow, and feature implementation, please refer to the main documentation directory:

- [Web Portal Guide (Recommended)](../documentation/WEB_PORTAL_GUIDE.md)
- [Project Implementation Plan](../documentation/REVISED_IMPLEMENTATION_PLAN.md)
- [Design System Specs](../documentation/DESIGN_SYSTEM.md)

---

**Built with**: Next.js 16 + React 19 + TypeScript + Tailwind CSS
