import type { Concept } from './missions'

export interface Word {
  text: string
  roman: string
  meaning: string
  example?: string
}

export interface PracticeSentence {
  text: string
  roman: string
  meaning: string
  concepts: Concept[]
  grammar: string
}

export interface Unit {
  id: string
  title: string
  subtitle: string
  missionId: string
  words: Word[]
  sentences: PracticeSentence[]
}

const c = (label: string, target: string, variants: string[], required = true): Concept => ({ label, target, variants: [target, ...variants], required })

export const UNITS: Unit[] = [
  {
    id: 'u1',
    title: 'Getting Around',
    subtitle: 'Hail an auto and agree a fare',
    missionId: 'auto',
    words: [
      { text: 'എവിടെ', roman: 'evide', meaning: 'where' },
      { text: 'സ്റ്റേഷൻ', roman: 'station', meaning: 'station' },
      { text: 'രൂപ', roman: 'roopa', meaning: 'rupees' },
      { text: 'കൂടുതൽ', roman: 'kooduthal', meaning: 'too much / more' },
      { text: 'ശരി', roman: 'shari', meaning: 'okay' },
    ],
    sentences: [
      { text: 'എനിക്ക് റെയിൽവേ സ്റ്റേഷനിലേക്ക് പോകണം.', roman: 'Enikku railway stationilekku pokanam.', meaning: 'I want to go to the railway station.', concepts: [c('station', 'സ്റ്റേഷൻ', ['സ്റ്റേഷനിലേക്ക്', 'റെയിൽവേ', 'station', 'railway']), c('need to go', 'പോകണം', ['പോണം', 'pokanam', 'ponam'])], grammar: 'Destination + -ലേക്ക് (towards) + പോകണം (need to go).' },
      { text: 'അത് കൂടുതലാണ്.', roman: 'Athu kooduthalaanu.', meaning: 'That is too much.', concepts: [c('too much', 'കൂടുതൽ', ['കൂടുതലാണ്', 'kooduthal', 'kooduthalaanu', 'kuduthal'])], grammar: 'അത് (that) + കൂടുതൽ (more) + ആണ് (is).' },
      { text: 'നൂറ് രൂപ മതിയോ?', roman: 'Nooru roopa mathiyo?', meaning: 'Is one hundred rupees enough?', concepts: [c('one hundred', 'നൂറ്', ['nooru', '100']), c('enough?', 'മതിയോ', ['മതി', 'mathiyo', 'mathi'])], grammar: 'Add -ഓ to make a question: മതി → മതിയോ.' },
      { text: 'ശരി, പോകാം.', roman: 'Shari, pokaam.', meaning: 'Okay, let’s go.', concepts: [c("let's go", 'പോകാം', ['pokaam', 'pokam', 'povaam'])], grammar: '-ആം = “let’s”.' },
      { text: 'വളരെ നന്ദി!', roman: 'Valare nanni!', meaning: 'Thank you very much!', concepts: [c('thank you', 'നന്ദി', ['nanni', 'nandi']), c('very', 'വളരെ', ['valare'], false)], grammar: 'വളരെ (very) intensifies anything after it.' },
    ],
  },
  {
    id: 'u2',
    title: 'Tea Time',
    subtitle: 'Order chai like a local',
    missionId: 'tea',
    words: [
      { text: 'ചായ', roman: 'chaaya', meaning: 'tea' },
      { text: 'വേണം', roman: 'venam', meaning: 'want / need' },
      { text: 'പഞ്ചസാര', roman: 'panchasaara', meaning: 'sugar' },
      { text: 'കുറച്ച്', roman: 'kurachu', meaning: 'a little' },
      { text: 'നന്ദി', roman: 'nanni', meaning: 'thank you' },
    ],
    sentences: [
      { text: 'ഒരു ചായ വേണം.', roman: 'Oru chaaya venam.', meaning: 'I want one tea.', concepts: [c('tea', 'ചായ', ['chaaya', 'chaya', 'chai']), c('want', 'വേണം', ['venam'])], grammar: 'Object first, വേണം last.' },
      { text: 'പഞ്ചസാര വേണ്ട.', roman: 'Panchasaara venda.', meaning: 'No sugar, please.', concepts: [c('sugar', 'പഞ്ചസാര', ['panchasaara', 'panchasara']), c("don't want", 'വേണ്ട', ['venda'])], grammar: 'വേണ്ട (venda) is the negative of വേണം.' },
      { text: 'കുറച്ച് മതി.', roman: 'Kurachu mathi.', meaning: 'A little is enough.', concepts: [c('a little', 'കുറച്ച്', ['kurachu', 'kurach'])], grammar: 'മതി = enough.' },
      { text: 'എത്ര രൂപ?', roman: 'Ethra roopa?', meaning: 'How many rupees?', concepts: [c('how much', 'എത്ര', ['ethra'])], grammar: 'എത്ര asks for a quantity.' },
      { text: 'നന്ദി ചേച്ചി!', roman: 'Nanni chechi!', meaning: 'Thank you, sister!', concepts: [c('thank you', 'നന്ദി', ['nanni', 'nandi'])], grammar: 'Add a kinship term to sound warm.' },
    ],
  },
  {
    id: 'u3',
    title: 'Market Day',
    subtitle: 'Ask prices and bargain',
    missionId: 'market',
    words: [
      { text: 'പഴം', roman: 'pazham', meaning: 'banana / fruit' },
      { text: 'എത്ര', roman: 'ethra', meaning: 'how much' },
      { text: 'കിലോ', roman: 'kilo', meaning: 'kilogram' },
      { text: 'അമ്പത്', roman: 'ambathu', meaning: 'fifty' },
      { text: 'തരൂ', roman: 'tharoo', meaning: 'please give' },
    ],
    sentences: [
      { text: 'ഇതിന് എത്രയാണ്?', roman: 'Ithinu ethrayaanu?', meaning: 'How much is this?', concepts: [c('how much', 'എത്ര', ['എത്രയാണ്', 'ethra', 'ethrayaanu'])], grammar: '-ഇന് (for) + എത്ര + ആണ്.' },
      { text: 'വില കൂടുതലാണ്.', roman: 'Vila kooduthalaanu.', meaning: 'The price is too high.', concepts: [c('price', 'വില', ['vila']), c('too much', 'കൂടുതൽ', ['കൂടുതലാണ്', 'kooduthal'])], grammar: 'വില = price.' },
      { text: 'അമ്പത് രൂപയ്ക്ക് തരുമോ?', roman: 'Ambathu roopaykku tharumo?', meaning: 'Will you give it for fifty?', concepts: [c('fifty', 'അമ്പത്', ['ambathu', '50']), c('will you give', 'തരുമോ', ['tharumo'], false)], grammar: '-യ്ക്ക് = for.' },
      { text: 'ഒരു കിലോ തരൂ.', roman: 'Oru kilo tharoo.', meaning: 'Give me one kilo.', concepts: [c('kilo', 'കിലോ', ['kilo']), c('give', 'തരൂ', ['tharoo', 'tharu'])], grammar: 'തരൂ = please give.' },
      { text: 'നല്ല പഴം!', roman: 'Nalla pazham!', meaning: 'Good bananas!', concepts: [c('good', 'നല്ല', ['nalla']), c('banana', 'പഴം', ['pazham'], false)], grammar: 'നല്ല (good) comes before the noun.' },
    ],
  },
  {
    id: 'u4',
    title: 'On the Move',
    subtitle: 'Take the KSRTC bus',
    missionId: 'bus',
    words: [
      { text: 'ബസ്', roman: 'bus', meaning: 'bus' },
      { text: 'ടിക്കറ്റ്', roman: 'ticket', meaning: 'ticket' },
      { text: 'പോകുമോ', roman: 'pokumo', meaning: 'will it go?' },
      { text: 'എത്തുമ്പോൾ', roman: 'ethumbol', meaning: 'when (we) reach' },
      { text: 'പറയണേ', roman: 'parayane', meaning: 'please tell' },
    ],
    sentences: [
      { text: 'ഈ ബസ് കൊച്ചിക്ക് പോകുമോ?', roman: 'Ee bus Kochikku pokumo?', meaning: 'Does this bus go to Kochi?', concepts: [c('Kochi', 'കൊച്ചി', ['കൊച്ചിക്ക്', 'kochi', 'kochikku']), c('will it go', 'പോകുമോ', ['pokumo'])], grammar: '-ക്ക് marks direction.' },
      { text: 'ഒരു ടിക്കറ്റ് തരൂ.', roman: 'Oru ticket tharoo.', meaning: 'One ticket, please.', concepts: [c('ticket', 'ടിക്കറ്റ്', ['ticket'])], grammar: 'ഒരു = one / a.' },
      { text: 'എത്ര സമയം എടുക്കും?', roman: 'Ethra samayam edukkum?', meaning: 'How long will it take?', concepts: [c('how much', 'എത്ര', ['ethra']), c('time', 'സമയം', ['samayam'])], grammar: 'സമയം = time.' },
      { text: 'സ്റ്റോപ്പ് എത്തുമ്പോൾ പറയണേ.', roman: 'Stop ethumbol parayane.', meaning: 'Please tell me when we reach the stop.', concepts: [c('please tell', 'പറയണേ', ['parayane', 'പറയാമോ'])], grammar: '-ഉമ്പോൾ = when.' },
      { text: 'ഇവിടെ നിർത്തണേ.', roman: 'Ivide nirthane.', meaning: 'Please stop here.', concepts: [c('here', 'ഇവിടെ', ['ivide']), c('stop', 'നിർത്തണേ', ['nirthane', 'നിർത്തൂ', 'nirthu'], false)], grammar: 'ഇവിടെ (here) vs അവിടെ (there).' },
    ],
  },
]

export const unitById = (id: string) => UNITS.find((u) => u.id === id)

export type ActivityType = 'words' | 'sentences' | 'conversation' | 'challenge'

export const ACTIVITY_REWARDS: Record<ActivityType, { coins: number; xp: number }> = {
  words: { coins: 20, xp: 30 },
  sentences: { coins: 30, xp: 50 },
  conversation: { coins: 50, xp: 120 },
  challenge: { coins: 100, xp: 80 },
}

export interface ShopItem {
  id: string
  name: string
  desc: string
  price: number
  kind: 'hint' | 'outfit' | 'minu' | 'bonus'
  color?: string
}

export const SHOP: ShopItem[] = [
  { id: 'hint-pack', name: 'Hint pack ×3', desc: 'Reveal the suggested reply in Immersive mode.', price: 40, kind: 'hint' },
  { id: 'outfit-lime', name: 'Lime kurta', desc: 'Bright lime outfit for your explorer.', price: 60, kind: 'outfit', color: '#9bdc3a' },
  { id: 'outfit-sunset', name: 'Sunset shirt', desc: 'Warm coral shirt, made for golden hour.', price: 60, kind: 'outfit', color: '#f97362' },
  { id: 'outfit-royal', name: 'Royal blue shirt', desc: 'A crisp blue for city adventures.', price: 80, kind: 'outfit', color: '#3b6fd8' },
  { id: 'minu-scarf-yellow', name: 'Minu’s sunny scarf', desc: 'A soft yellow scarf for your fox.', price: 50, kind: 'minu', color: '#fcd34d' },
  { id: 'minu-scarf-coral', name: 'Minu’s coral scarf', desc: 'A cosy coral scarf for your fox.', price: 50, kind: 'minu', color: '#f97362' },
  { id: 'minu-scarf-kasavu', name: 'Kasavu scarf', desc: 'Cream with a gold border, Onam style.', price: 120, kind: 'minu', color: '#f7f0d8' },
]
