export type BreathingPhaseType = 'inhale' | 'hold_in' | 'exhale' | 'hold_out';

export interface BreathingPhase {
  type: BreathingPhaseType;
  label: string;
  durationSeconds: number;
}

export interface BreathingPattern {
  id: string;
  name: string;
  subtitle: string;
  phases: BreathingPhase[];
}

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    subtitle: 'Equal balance: 4s inhale, 4s hold, 4s exhale, 4s hold',
    phases: [
      { type: 'inhale', label: 'Inhale', durationSeconds: 4 },
      { type: 'hold_in', label: 'Hold', durationSeconds: 4 },
      { type: 'exhale', label: 'Exhale', durationSeconds: 4 },
      { type: 'hold_out', label: 'Hold', durationSeconds: 4 },
    ],
  },
  {
    id: '4-7-8',
    name: '4-7-8 Relaxing Breath',
    subtitle: 'Gentle rhythm: 4s inhale, 7s hold, 8s slow exhale',
    phases: [
      { type: 'inhale', label: 'Inhale', durationSeconds: 4 },
      { type: 'hold_in', label: 'Hold', durationSeconds: 7 },
      { type: 'exhale', label: 'Exhale', durationSeconds: 8 },
    ],
  },
  {
    id: '4-6',
    name: '4-6 Steady Breath',
    subtitle: 'Soothing release: 4s inhale, 6s exhale',
    phases: [
      { type: 'inhale', label: 'Inhale', durationSeconds: 4 },
      { type: 'exhale', label: 'Exhale', durationSeconds: 6 },
    ],
  },
];

export const BREATHING_DURATIONS_MINUTES = [1, 3, 5];

