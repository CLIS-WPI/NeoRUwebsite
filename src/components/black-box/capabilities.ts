export interface CapabilityItem {
  id: string;
  index: number;
  side: 'left' | 'right';
  title: string;
  microLine: string;
  accent: string;
  icon: 'isac' | 'security' | 'edge-ai' | 'beamforming' | 'power' | '6g';
}

export const CAPABILITIES: CapabilityItem[] = [
  {
    id: 'isac',
    index: 0,
    side: 'left',
    title: 'ISAC & RF Sensing',
    microLine: 'Turn radios into real-time radar.',
    accent: '#0066cc',
    icon: 'isac',
  },
  {
    id: 'security',
    index: 1,
    side: 'left',
    title: 'Raw I/Q & PHY Security',
    microLine: 'Instant jamming & spoof detection.',
    accent: '#0284c7',
    icon: 'security',
  },
  {
    id: 'edge-ai',
    index: 2,
    side: 'left',
    title: 'Sub-ms Edge AI (dApps)',
    microLine: 'Run neural DSP directly on-chip.',
    accent: '#4f46e5',
    icon: 'edge-ai',
  },
  {
    id: 'beamforming',
    index: 3,
    side: 'right',
    title: 'Agile Beamforming',
    microLine: 'Custom precoding & null-steering.',
    accent: '#0066cc',
    icon: 'beamforming',
  },
  {
    id: 'power',
    index: 4,
    side: 'right',
    title: 'Micro-Sleep & PA Control',
    microLine: 'Symbol-level energy optimization.',
    accent: '#15803d',
    icon: 'power',
  },
  {
    id: '6g',
    index: 5,
    side: 'right',
    title: '6G Waveforms & FR3',
    microLine: 'Custom waveforms & flexible splits.',
    accent: '#0369a1',
    icon: '6g',
  },
];
