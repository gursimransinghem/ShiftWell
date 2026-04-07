// Spanish translations — healthcare professional register
// Target: trabajadores de salud por turnos (healthcare shift workers)
// Locale: es-US and es-MX (US Spanish + Mexican Spanish)

export const es = {
  // Incorporación (Onboarding)
  onboarding: {
    welcome: "Bienvenido a ShiftWell",
    subtitle: "Ciencia del sueño diseñada para trabajadores por turnos",
    getStarted: "Comenzar",
    whatIsYourRole: "¿Cuál es tu función?",
    roles: {
      nurse: "Enfermero/a / CNA",
      physician: "Médico/a / PA",
      ems: "Técnico en Emergencias / Paramédico",
      police: "Policía / Bombero",
      other: "Otro trabajador por turnos",
    },
  },
  // Pantalla de hoy (Today screen)
  today: {
    title: "Hoy",
    recoveryScore: "Puntuación de Recuperación",
    nextShift: "Próximo Turno",
    sleepWindow: "Ventana de Sueño",
    napWindow: "Ventana de Siesta",
    noShifts: "Sin turnos próximos",
    syncCalendar: "Sincronizar Calendario",
    sleepDebt: "Deuda de Sueño",
    countdown: "Hora de dormir en",
  },
  // Cerebro Adaptativo (Adaptive Brain)
  adaptive: {
    planChanged: "Tu plan fue actualizado",
    whyChanged: "¿Por qué cambió mi plan?",
    undo: "Deshacer Cambio",
    debtHigh: "La deuda de sueño es alta",
    debtLow: "La deuda de sueño es baja",
    shiftTransition: "Cambio de turno próximo",
  },
  // Tarjeta de Deuda de Sueño (Sleep Debt Card)
  debtCard: {
    title: "Deuda de Sueño",
    unit: "horas",
    daysTracked: "{{days}} noches registradas",
    paying: "Estás reduciendo tu deuda de sueño",
    accruing: "Estás acumulando deuda de sueño",
  },
  // Configuración (Settings)
  settings: {
    title: "Configuración",
    premium: "ShiftWell Pro",
    notifications: "Notificaciones",
    deleteAccount: "Eliminar Cuenta",
    deleteConfirm: "Esto eliminará permanentemente tu cuenta y todos los datos.",
    medicalDisclaimer: "Aviso Médico",
    privacyPolicy: "Política de Privacidad",
    weeklyBrief: "Resumen Semanal de Sueño",
    autopilot: "Modo Piloto Automático",
  },
  // Pantalla de pago (Paywall)
  paywall: {
    title: "Actualiza a ShiftWell Pro",
    trial: "Comenzar Prueba Gratuita de 7 Días",
    perYear: "por año",
    features: {
      adaptiveBrain: "Cerebro Adaptativo",
      realTimeAlerts: "Alertas en Tiempo Real",
      recoveryScore: "Puntuación de Recuperación",
      napTiming: "Temporización de Siesta",
      mealTiming: "Horario de Comidas y Cafeína",
      calendarExport: "Exportar al Calendario",
    },
  },
  // Común (Common)
  common: {
    appName: "ShiftWell",
    tagline: "Duerme en piloto automático",
    loading: "Cargando...",
    error: "Algo salió mal",
    retry: "Intentar de Nuevo",
    cancel: "Cancelar",
    confirm: "Confirmar",
    save: "Guardar",
    delete: "Eliminar",
    done: "Listo",
    next: "Siguiente",
    back: "Atrás",
    skip: "Omitir",
    settings: "Configuración",
    premium: "Premium",
  },
} as const;

// Key terminology reference (turno nocturno = night shift, turno rotativo = rotating shift)
// Ventana de sueño = sleep window, deuda de sueño = sleep debt
// Puntuación de recuperación = recovery score, cerebro adaptativo = adaptive brain
// Ritmo circadiano = circadian rhythm, trabajador por turnos = shift worker
