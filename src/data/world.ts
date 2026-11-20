export type Vec2 = [number, number]

export interface LocationDef {
  id: string
  name: string
  ml: string
  pos: Vec2
  radius: number
  icon: 'train' | 'auto' | 'coffee' | 'market' | 'bus' | 'food' | 'hospital' | 'home'
}

export const LOCATIONS: LocationDef[] = [
  { id: 'station', name: 'Ernakulam Railway Station', ml: 'റെയിൽവേ സ്റ്റേഷൻ', pos: [0, -50], radius: 12, icon: 'train' },
  { id: 'autostand', name: 'Kochi Auto Stand', ml: 'ഓട്ടോ സ്റ്റാൻഡ്', pos: [11, -13], radius: 8, icon: 'auto' },
  { id: 'teashop', name: 'Ammini’s Tea Shop', ml: 'ചായക്കട', pos: [-13, 13], radius: 7, icon: 'coffee' },
  { id: 'market', name: 'Broadway Market', ml: 'ചന്ത', pos: [-28, -20], radius: 10, icon: 'market' },
  { id: 'busstand', name: 'KSRTC Bus Stand', ml: 'ബസ് സ്റ്റാൻഡ്', pos: [26, 28], radius: 8, icon: 'bus' },
  { id: 'restaurant', name: 'Hotel Malabar', ml: 'ഹോട്ടൽ', pos: [22, -28], radius: 8, icon: 'food' },
  { id: 'hospital', name: 'General Hospital', ml: 'ആശുപത്രി', pos: [-21, 23], radius: 9, icon: 'hospital' },
  { id: 'residential', name: 'Panampilly Lane', ml: 'പാർപ്പിട മേഖല', pos: [10, 48], radius: 12, icon: 'home' },
]

export interface RoadDef {
  x: number
  z: number
  w: number
  d: number
}

export const ROADS: RoadDef[] = [
  { x: 0, z: 10, w: 8, d: 120 },
  { x: 0, z: 0, w: 140, d: 8 },
  { x: 0, z: 36, w: 100, d: 7 },
  { x: 40, z: 6, w: 7, d: 66 },
  { x: -40, z: 6, w: 7, d: 66 },
]

export type RoofType = 'flat' | 'tile' | 'none'

export interface BuildingDef {
  x: number
  z: number
  w: number
  d: number
  h: number
  color: string
  roof: RoofType
  roofColor?: string
  sign?: string
  signColor?: string
  /** rotation in quarter turns, controls which side the sign faces (0 = +z) */
  face?: 0 | 1 | 2 | 3
  windows?: boolean
}

const T = '#b5482e' // terracotta tile
const T2 = '#9c3b26'

export const BUILDINGS: BuildingDef[] = [
  // Railway station
  { x: 0, z: -62, w: 40, d: 12, h: 8, color: '#e9d7b0', roof: 'tile', roofColor: T2, sign: 'ERNAKULAM JN.  എറണാകുളം', signColor: '#1d4a2b', windows: true },
  // Auto stand kiosk
  { x: 16, z: -17, w: 4, d: 3, h: 3, color: '#f0c94a', roof: 'flat', sign: 'AUTO', signColor: '#14361f', face: 3 },
  // Tea shop
  { x: -17, z: 13, w: 7, d: 7, h: 4.2, color: '#d9a066', roof: 'tile', roofColor: T, sign: 'ചായക്കട  TEA', signColor: '#7a2e12', face: 1 },
  // Restaurant
  { x: 24, z: -35, w: 13, d: 9, h: 6.5, color: '#f2e2b6', roof: 'tile', roofColor: T2, sign: 'HOTEL MALABAR', signColor: '#7a2e12', windows: true },
  // Hospital
  { x: -29, z: 24, w: 12, d: 13, h: 10, color: '#f4f4ef', roof: 'flat', sign: '+ HOSPITAL', signColor: '#c0392b', face: 1, windows: true },
  // Bus stand shelter backing
  { x: 28, z: 28.6, w: 8, d: 0.8, h: 3.2, color: '#d14b3c', roof: 'none' },
  // Residential homes
  { x: -4, z: 50, w: 8, d: 7, h: 4.5, color: '#f5d7a1', roof: 'tile', roofColor: T, windows: true },
  { x: 10, z: 54, w: 8, d: 7, h: 5, color: '#cfe3c8', roof: 'tile', roofColor: T2, windows: true },
  { x: 24, z: 50, w: 8, d: 7, h: 4.5, color: '#f2b8a2', roof: 'tile', roofColor: T, windows: true },
  { x: -18, z: 52, w: 8, d: 7, h: 5, color: '#bfd8e8', roof: 'tile', roofColor: T, windows: true },
  // Filler — downtown blocks
  { x: -14, z: -14, w: 10, d: 10, h: 12, color: '#e8c9a0', roof: 'flat', windows: true },
  { x: -14, z: -30, w: 10, d: 12, h: 16, color: '#cfd9c4', roof: 'flat', windows: true },
  { x: 12, z: -28, w: 6, d: 8, h: 9, color: '#f3d48a', roof: 'flat', windows: true, sign: 'SILKS', signColor: '#7a1f4d', face: 3 },
  { x: 16, z: 14, w: 10, d: 10, h: 10, color: '#d5c2e0', roof: 'flat', windows: true, sign: 'JEWELLERY', signColor: '#7a5a12', face: 3 },
  { x: -15, z: 26, w: 8, d: 6, h: 6, color: '#f0b98c', roof: 'tile', roofColor: T, windows: true },
  { x: 14, z: 26, w: 8, d: 6, h: 7, color: '#b8d8c0', roof: 'flat', windows: true },
  { x: 30, z: -12, w: 9, d: 10, h: 14, color: '#e6e0cf', roof: 'flat', windows: true },
  { x: 30, z: 14, w: 8, d: 10, h: 8, color: '#f6c6a6', roof: 'tile', roofColor: T2, windows: true },
  { x: -30, z: 8, w: 9, d: 8, h: 7, color: '#efe1b0', roof: 'tile', roofColor: T, windows: true },
  { x: -52, z: -14, w: 10, d: 14, h: 11, color: '#d8cfb8', roof: 'flat', windows: true },
  { x: -52, z: 22, w: 10, d: 12, h: 6, color: '#f1caa0', roof: 'tile', roofColor: T2, windows: true },
  { x: 52, z: -16, w: 10, d: 12, h: 13, color: '#cde0e4', roof: 'flat', windows: true },
  { x: 52, z: 18, w: 10, d: 12, h: 7, color: '#f4d9a8', roof: 'tile', roofColor: T, windows: true },
  { x: -26, z: -48, w: 12, d: 10, h: 9, color: '#e0d2b2', roof: 'tile', roofColor: T2, windows: true },
  { x: 26, z: -50, w: 12, d: 10, h: 10, color: '#d8e3c8', roof: 'flat', windows: true },
  { x: 40, z: 52, w: 8, d: 7, h: 4.5, color: '#f7e3b5', roof: 'tile', roofColor: T, windows: true },
  { x: -34, z: 50, w: 8, d: 7, h: 4.5, color: '#e8c2c8', roof: 'tile', roofColor: T2, windows: true },
]

/** Market stalls (colliders + awnings) */
export const STALLS: { x: number; z: number; color: string; goods: string }[] = [
  { x: -24, z: -24, color: '#e8553d', goods: '#f2c33b' },
  { x: -30, z: -24, color: '#2f9e6b', goods: '#e8553d' },
  { x: -36, z: -24, color: '#f2a93b', goods: '#7cc41f' },
  { x: -24, z: -14, color: '#3b7be8', goods: '#f2c33b' },
  { x: -32, z: -14, color: '#d84a8f', goods: '#f6e27a' },
]

export const PALMS: Vec2[] = [
  [6.5, 20], [-6.5, 28], [6.5, 42], [-7, -22], [6.5, -36], [-6.5, -42], [22, 6.5], [-22, -6.5], [34, -6.5], [-34, 6.5],
  [48, 6.5], [-48, -6.5], [-8, 44], [32, 42], [-28, 42], [18, 60], [-14, 60], [2, 62], [36, 60], [-40, 60], [44, -30],
  [-44, -32], [10, -44], [-10, -50], [58, 40], [-58, 40], [58, -40], [-58, -40], [-20, 34], [46, 30], [-46, 30],
  [62, 0], [-62, 0], [30, -42], [-36, -8], [44, 40],
]

export const PARKED_AUTOS: Vec2[] = [
  [10.8, -9],
  [10.8, -12.5],
  [10.8, -16],
]
/** Parked KSRTC bus, oriented along x */
export const PARKED_BUS: Vec2 = [30, 34.5]

export interface Collider {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export const WORLD_HALF = 74

export const COLLIDERS: Collider[] = [
  ...BUILDINGS.map((b) => ({ minX: b.x - b.w / 2, maxX: b.x + b.w / 2, minZ: b.z - b.d / 2, maxZ: b.z + b.d / 2 })),
  ...STALLS.map((s) => ({ minX: s.x - 2, maxX: s.x + 2, minZ: s.z - 1.2, maxZ: s.z + 1.2 })),
  ...PARKED_AUTOS.map(([x, z]) => ({ minX: x - 0.8, maxX: x + 0.8, minZ: z - 1.4, maxZ: z + 1.4 })),
  { minX: PARKED_BUS[0] - 5, maxX: PARKED_BUS[0] + 5, minZ: PARKED_BUS[1] - 1.4, maxZ: PARKED_BUS[1] + 1.4 },
  ...PALMS.map(([x, z]) => ({ minX: x - 0.35, maxX: x + 0.35, minZ: z - 0.35, maxZ: z + 0.35 })),
]

export interface NpcDef {
  id: string
  name: string
  role: string
  pos: Vec2
  rot: number
  missionId: string
  skin: string
  shirt: string
  mundu: string
  hair: string
  mustache?: boolean
  female?: boolean
}

export const NPCS: NpcDef[] = [
  { id: 'raju', name: 'Raju Bhai', role: 'Auto driver', pos: [7.8, -12.5], rot: -Math.PI / 2, missionId: 'auto', skin: '#8d5a3b', shirt: '#e9d9a8', mundu: '#f7f3e6', hair: '#1b1410', mustache: true },
  { id: 'ammini', name: 'Ammini Chechi', role: 'Tea shop owner', pos: [-12.6, 12.2], rot: Math.PI / 2, missionId: 'tea', skin: '#9a6142', shirt: '#2f8a5f', mundu: '#e8b84a', hair: '#130d0a', female: true },
  { id: 'kunjappan', name: 'Kunjappan', role: 'Fruit vendor', pos: [-27, -18.6], rot: 0, missionId: 'market', skin: '#7c4e33', shirt: '#4a7dc9', mundu: '#f2ecd8', hair: '#d9d4c8', mustache: true },
  { id: 'rafeeq', name: 'Rafeeq', role: 'Bus conductor', pos: [21.5, 30.5], rot: Math.PI / 2, missionId: 'bus', skin: '#93603f', shirt: '#7a8fa8', mundu: '#3c4a5e', hair: '#1b1410', mustache: true },
  { id: 'thomas', name: 'Thomas Sir', role: 'Station master', pos: [5, -53], rot: 0, missionId: 'chat-station', skin: '#a06a48', shirt: '#f4f4f4', mundu: '#24324a', hair: '#8a8a8a', mustache: true },
  { id: 'shaji', name: 'Shaji', role: 'Hotel owner', pos: [20, -29.5], rot: 0, missionId: 'chat-restaurant', skin: '#87553a', shirt: '#c94f3a', mundu: '#f7f3e6', hair: '#1b1410' },
  { id: 'mary', name: 'Sister Mary', role: 'Nurse', pos: [-21.6, 21], rot: Math.PI / 2, missionId: 'chat-hospital', skin: '#a47050', shirt: '#eaf4f6', mundu: '#eaf4f6', hair: '#1b1410', female: true },
  { id: 'ammachi', name: 'Ammachi', role: 'Neighbour', pos: [16, 45], rot: Math.PI, missionId: 'chat-home', skin: '#8a5a3e', shirt: '#f6f1e2', mundu: '#f6f1e2', hair: '#e8e4dc', female: true },
]

export const npcById = (id: string) => NPCS.find((n) => n.id === id)

export const PLAYER_SPAWN: Vec2 = [6.5, 8]
