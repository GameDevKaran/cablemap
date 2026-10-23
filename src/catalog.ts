import type { Port, Profile, Project } from './model.js';

const port = (id: string, label: string, direction: Port['direction'], connector: Port['connector'], signal: Port['signal']): Port => ({ id, label, direction, connector, signal });

/** Generic authored profiles, not specifications for commercial products. */
export const CATALOG: Profile[] = [
  {
    type: 'laptop', label: 'Presenter laptop', description: 'Declared HDMI video, USB audio host, and stereo line sources.',
    ports: [port('hdmi-out', 'HDMI AV out', 'output', 'hdmi', 'hdmi-av'), port('usb-out', 'USB-A audio host out', 'output', 'usb-a', 'usb-audio'), port('line-out', '3.5 mm stereo line out', 'output', 'line-3.5', 'stereo-line')],
    routes: [], sourcePorts: ['hdmi-out', 'usb-out', 'line-out'], sinkPorts: [],
  },
  {
    type: 'projector', label: 'Projector', description: 'A video destination with one declared HDMI input.',
    ports: [port('hdmi-in', 'HDMI AV in', 'input', 'hdmi', 'hdmi-av')],
    routes: [], sourcePorts: [], sinkPorts: ['hdmi-in'],
  },
  {
    type: 'interface', label: 'USB audio interface', description: 'Declared USB audio input converted to stereo line output.',
    ports: [port('usb-in', 'USB-B audio device in', 'input', 'usb-b', 'usb-audio'), port('line-out', '3.5 mm stereo line out', 'output', 'line-3.5', 'stereo-line')],
    routes: [{ from: 'usb-in', to: 'line-out' }], sourcePorts: [], sinkPorts: [],
  },
  {
    type: 'mixer', label: 'Line mixer', description: 'Either declared stereo line input can supply its output.',
    ports: [port('line-in-1', 'Stereo line input 1', 'input', 'line-3.5', 'stereo-line'), port('line-in-2', 'Stereo line input 2', 'input', 'line-3.5', 'stereo-line'), port('line-out', '3.5 mm stereo line out', 'output', 'line-3.5', 'stereo-line')],
    routes: [{ from: 'line-in-1', to: 'line-out' }, { from: 'line-in-2', to: 'line-out' }], sourcePorts: [], sinkPorts: [],
  },
  {
    type: 'speaker', label: 'Powered speaker', description: 'An audio destination with a declared stereo line input.',
    ports: [port('line-in', '3.5 mm stereo line in', 'input', 'line-3.5', 'stereo-line')],
    routes: [], sourcePorts: [], sinkPorts: ['line-in'],
  },
  {
    type: 'extractor', label: 'HDMI audio extractor', description: 'Declared HDMI passthrough and stereo audio extraction.',
    ports: [port('hdmi-in', 'HDMI AV in', 'input', 'hdmi', 'hdmi-av'), port('hdmi-out', 'HDMI AV out', 'output', 'hdmi', 'hdmi-av'), port('line-out', '3.5 mm stereo line out', 'output', 'line-3.5', 'stereo-line')],
    routes: [{ from: 'hdmi-in', to: 'hdmi-out' }, { from: 'hdmi-in', to: 'line-out' }], sourcePorts: [], sinkPorts: [],
  },
];

export function getProfile(type: string): Profile | undefined {
  return CATALOG.find((profile) => profile.type === type);
}

export function emptyProject(): Project {
  return { schemaVersion: 1, catalogVersion: 1, title: 'My AV setup', devices: [], cables: [] };
}

export function exampleProject(): Project {
  return {
    schemaVersion: 1, catalogVersion: 1, title: 'Example: community presentation',
    devices: [
      { id: 'laptop-1', type: 'laptop', label: 'Presenter laptop' },
      { id: 'projector-1', type: 'projector', label: 'Projector' },
      { id: 'interface-1', type: 'interface', label: 'USB audio interface' },
      { id: 'mixer-1', type: 'mixer', label: 'Line mixer' },
      { id: 'speaker-1', type: 'speaker', label: 'Powered speaker' },
    ],
    cables: [
      { id: 'C01', fromDevice: 'laptop-1', fromPort: 'hdmi-out', toDevice: 'projector-1', toPort: 'hdmi-in' },
      { id: 'C02', fromDevice: 'laptop-1', fromPort: 'usb-out', toDevice: 'interface-1', toPort: 'usb-in' },
      { id: 'C03', fromDevice: 'interface-1', fromPort: 'line-out', toDevice: 'mixer-1', toPort: 'line-in-1' },
      { id: 'C04', fromDevice: 'mixer-1', fromPort: 'line-out', toDevice: 'speaker-1', toPort: 'line-in' },
    ],
  };
}
