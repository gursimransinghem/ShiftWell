export const en = {
  // Onboarding
  onboarding: {
    welcome: "Welcome to ShiftWell",
    subtitle: "Sleep science built for shift workers",
    getStarted: "Get Started",
    whatIsYourRole: "What best describes your role?",
    roles: {
      nurse: "Nurse / CNA",
      physician: "Physician / PA",
      ems: "EMS / Paramedic",
      police: "Police / Fire",
      other: "Other shift worker",
    },
  },
  // Today screen
  today: {
    title: "Today",
    recoveryScore: "Recovery Score",
    nextShift: "Next Shift",
    sleepWindow: "Sleep Window",
    napWindow: "Nap Window",
    noShifts: "No upcoming shifts",
    syncCalendar: "Sync Calendar",
    sleepDebt: "Sleep Debt",
    countdown: "Bedtime in",
  },
  // Adaptive Brain
  adaptive: {
    planChanged: "Your plan was updated",
    whyChanged: "Why did my plan change?",
    undo: "Undo Change",
    debtHigh: "Sleep debt is high",
    debtLow: "Sleep debt is low",
    shiftTransition: "Shift transition ahead",
  },
  // Sleep Debt Card
  debtCard: {
    title: "Sleep Debt",
    unit: "hours",
    daysTracked: "{{days}} nights tracked",
    paying: "You're paying down debt",
    accruing: "You're accumulating debt",
  },
  // Settings
  settings: {
    title: "Settings",
    premium: "ShiftWell Pro",
    notifications: "Notifications",
    deleteAccount: "Delete Account",
    deleteConfirm: "This will permanently delete your account and all data.",
    medicalDisclaimer: "Medical Disclaimer",
    privacyPolicy: "Privacy Policy",
    weeklyBrief: "Weekly Sleep Brief",
    autopilot: "Autopilot Mode",
  },
  // Paywall
  paywall: {
    title: "Upgrade to ShiftWell Pro",
    trial: "Start 7-Day Free Trial",
    perYear: "per year",
    features: {
      adaptiveBrain: "Adaptive Brain",
      realTimeAlerts: "Real-Time Alerts",
      recoveryScore: "Recovery Score",
      napTiming: "Nap Timing",
      mealTiming: "Meal & Caffeine Timing",
      calendarExport: "Calendar Export",
    },
  },
  // Common
  common: {
    appName: "ShiftWell",
    tagline: "Sleep on autopilot",
    loading: "Loading...",
    error: "Something went wrong",
    retry: "Try Again",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    delete: "Delete",
    done: "Done",
    next: "Next",
    back: "Back",
    skip: "Skip",
    settings: "Settings",
    premium: "Premium",
  },
} as const;

export type TranslationKeys = typeof en;
