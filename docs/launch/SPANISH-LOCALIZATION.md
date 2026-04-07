# ShiftWell — Spanish Localization Strategy

> **Version:** 1.0 | **Date:** April 2026
> **Purpose:** App Store Spanish metadata and in-app i18n implementation strategy
> **Audience:** Founder, App Store Connect submission, future localization team

---

## Why Spanish First

- **18% of US shift workers are Hispanic** (Bureau of Labor Statistics data)
- Healthcare is the most Spanish-speaking shift work sector — nurses, CNAs, medical assistants, lab techs
- **No competing app has Spanish localization** — Timeshifter, Rise, Sleep Cycle all English-only
- US Spanish speakers: 42M native + 12M bilingual = 54M potential users
- es-MX and es-US are the same locale in App Store Connect — one submission covers both

**Strategic value:** First-mover advantage in an underserved demographic that is also ShiftWell's primary audience.

---

## App Store Connect — Spanish Metadata

Submit under both **es-US** (United States Spanish) and **es-MX** (Mexico Spanish) in App Store Connect. The content is identical.

### App Name (30 char limit)

```
ShiftWell: Turnos y Sueño
```

*(25 characters — includes primary Spanish keywords)*

**Keyword notes:** "Turnos" (shifts) + "Sueño" (sleep) are the two highest-intent Spanish healthcare search terms. Together they create a phrase naturally searched by bilingual nurses and healthcare workers.

---

### Subtitle (30 char limit)

```
Sueño Circadiano para Turnos
```

*(28 characters)*

**Keyword notes:** "Circadiano" differentiates from generic sleep apps; "Turnos" is the primary occupational identifier.

---

### Description (4000 char limit)

```
Creado por un médico de urgencias que trabaja turnos nocturnos. Porque "simplemente duerme más" no es un plan.

Si trabajas turnos nocturnos, turnos rotativos o horarios irregulares, ya lo sabes: la mayoría de los consejos para dormir no aplican para ti. ShiftWell es la primera aplicación de sueño diseñada para trabajadores de salud por turnos — enfermeras, paramédicos y médicos de guardia.

Importa tus turnos. Obtén un plan respaldado por ciencia. Expórtalo a tu calendario. Listo.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CÓMO FUNCIONA

1. Importa tu horario — Sube tu calendario de turnos en formato ICS, o ingresa los turnos manualmente. ShiftWell lee tus horas reales de trabajo y construye el plan alrededor de ellas.

2. Obtén tu plan personalizado — Basado en tus turnos, cronotipo y ciencia circadiana, ShiftWell genera ventanas de sueño optimizadas, estrategias de siesta y protocolos de transición.

3. Exporta a tu calendario — Tu plan completo de sueño aparece junto a tus turnos en Apple Calendar o Google Calendar. Con un toque.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CARACTERÍSTICAS

• Importación de horario — Sube archivos ICS de cualquier sistema de programación laboral.
• Planes de sueño personalizados — Horarios de sueño y vigilia para cada tipo de turno.
• Quiz de cronotipo — Descubre tu tendencia natural de sueño.
• Siestas estratégicas — Cronometradas para el máximo beneficio antes y entre turnos.
• Alertas de corte de cafeína — Sabe exactamente cuándo dejar la cafeína.
• Guía de horarios de comidas — Ventanas de alimentación alineadas circadianamente.
• Exportación al calendario — Exporta tu plan completo en un toque.
• Modo oscuro predeterminado — Diseñado para las 3am. Fácil para los ojos.
• Funciona sin conexión — Todos los datos permanecen en tu dispositivo. Sin cuenta requerida.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HECHO PARA TRABAJADORES POR TURNOS

ShiftWell fue creado para las personas que mantienen el mundo funcionando mientras todos duermen:

• Enfermeras y médicos
• Paramédicos y técnicos en emergencias
• Policías y bomberos
• Trabajadores de fábricas y almacenes
• Choferes de camión y pilotos
• Personal de seguridad
• Cualquier persona con horarios rotativos, irregulares o nocturnos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LA CIENCIA

El algoritmo de ShiftWell está fundamentado en 15+ estudios revisados por pares en biología circadiana y medicina del sueño, incluyendo investigaciones de Harvard, la Universidad de Monash y los CDC. Cada recomendación — desde el horario de sueño ancla hasta las siestas estratégicas — está respaldada por evidencia publicada.

Creado por un médico de medicina de urgencias que rota entre días, noches y todo lo intermedio.
```

*(Approximately 2,800 characters — within 4,000 char limit)*

---

### Keywords (100 char limit)

```
turno nocturno,turno rotativo,sueño,enfermera,circadiano,horario turnos,descanso,paramédico
```

*(90 characters)*

**Keyword rationale:**

| Keyword | Why It Matters |
|---------|----------------|
| turno nocturno | "Night shift" in Spanish — highest volume shift-work query |
| turno rotativo | "Rotating shift" — second most searched; very low competition |
| sueño | "Sleep" — broad anchor keyword for Spanish sleep category |
| enfermera | "Nurse" — 4.3M nurses in US, large Spanish-speaking segment |
| circadiano | "Circadian" — differentiator from generic sleep apps |
| horario turnos | "Shift schedule" — intent-heavy search phrase |
| descanso | "Rest/recovery" — captures broader wellness searches |
| paramédico | "Paramedic" — second-largest target profession |

---

## In-App Spanish i18n Implementation

### File Structure

```
src/i18n/
├── en.ts          # English baseline (all strings, as const export)
├── es.ts          # Spanish translations (matches en.ts structure)
└── index.ts       # i18n provider with locale detection
```

### Key Terminology Standards

| English | Spanish | Notes |
|---------|---------|-------|
| shift worker | trabajador por turnos | Formal; preferred over "empleado por turnos" |
| night shift | turno nocturno | Standard medical Spanish |
| rotating shift | turno rotativo | Industry standard |
| sleep debt | deuda de sueño | Direct translation; widely understood |
| recovery score | puntuación de recuperación | Medical register |
| circadian rhythm | ritmo circadiano | Standard scientific term |
| adaptive brain | cerebro adaptativo | Feature branding — translated not transliterated |
| sleep window | ventana de sueño | Accepted in sleep medicine literature |
| nap window | ventana de siesta | "Siesta" is culturally resonant and clinically used |
| caffeine cutoff | corte de cafeína | Direct translation works |
| chronotype | cronotipo | Scientific term, same in Spanish |

### Register

All Spanish strings use **professional/medical register** — not casual. This matches the audience (healthcare workers) and builds credibility. Avoid:
- "tú" casual contractions where formal form is available
- Colloquialisms that don't translate across Latin American regions
- Anglicisms where a standard Spanish medical term exists

### Locale Detection

`src/i18n/index.ts` detects Spanish via:

```typescript
const deviceLocale = getLocales()[0]?.languageCode ?? 'en';
return deviceLocale.startsWith('es') ? 'es' : 'en';
```

This correctly handles: es, es-US, es-MX, es-419, es-AR, es-CO — any Spanish variant maps to ShiftWell's Spanish strings.

### Fallback Strategy

If a key exists in English but not Spanish (e.g., during a partial migration), the `t()` function in `index.ts` automatically falls back to English. This prevents blank UI elements during incremental localization work.

---

## Submission Checklist

### App Store Connect

- [ ] Create es-US locale in App Store Connect
- [ ] Create es-MX locale in App Store Connect
- [ ] Paste Spanish App Name (25 chars)
- [ ] Paste Spanish Subtitle (28 chars)
- [ ] Paste Spanish Description (~2,800 chars)
- [ ] Paste Spanish Keywords (90 chars)
- [ ] Upload Screenshot 5 (Spanish hero screenshot — "Tu sueño, optimizado para tus turnos")
- [ ] Review Spanish promotional text at launch

### In-App

- [ ] Verify `src/i18n/es.ts` covers all user-facing strings
- [ ] Test Spanish locale on iOS Simulator (Settings > General > Language & Region)
- [ ] Confirm fallback to English works for any untranslated keys
- [ ] Medical disclaimer text verified for accuracy with a native Spanish speaker

---

## Future Localization Roadmap

| Language | Priority | Rationale |
|----------|----------|-----------|
| English (US) | Live | Primary market |
| Spanish | Month 2 | 18% US shift workers Hispanic; no competing app has it |
| English (UK) | Month 3 | NHS nurses — 1.3M workers, large UK App Store presence |
| English (AU) | Month 4 | FIFO mining workers; strong shift-work culture |
| German | Month 6 | Manufacturing shift work; strong labor standards culture |
| Portuguese (Brazil) | Month 6 | Largest healthcare workforce in Latin America |

---

*ShiftWell Spanish Localization Strategy v1.0 — April 2026*
*Reference: ASO-KEYWORD-STRATEGY.md for English metadata*
