export interface Device {
  id: string;
  type: string;
  label: string;
}

export interface Cable {
  id: string;
  fromDevice: string;
  fromPort: string;
  toDevice: string;
  toPort: string;
}

export interface Project {
  schemaVersion: 1;
  catalogVersion: 1;
  title: string;
  devices: Device[];
  cables: Cable[];
}

export interface Port {
  id: string;
  label: string;
  direction: 'input' | 'output';
  connector: 'hdmi' | 'usb-a' | 'usb-b' | 'line-3.5';
  signal: 'hdmi-av' | 'usb-audio' | 'stereo-line';
}

export interface Profile {
  type: string;
  label: string;
  description: string;
  ports: Port[];
  routes: { from: string; to: string }[];
  sourcePorts: string[];
  sinkPorts: string[];
}

export const LIMITS = Object.freeze({ devices: 30, cables: 60, label: 80, id: 64, storedBytes: 100_000 });
