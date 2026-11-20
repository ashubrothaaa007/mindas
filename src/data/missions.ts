export interface Line {
  text: string
  roman: string
  meaning: string
}

export interface Concept {
  /** English gloss shown when the concept is missing */
  label: string
  /** Target-language form shown to the player */
  target: string
  /** Accepted forms (native script and romanised spellings) */
  variants: string[]
  required: boolean
}

export interface Reply {
  intent: string
  text: string
  roman: string
  concepts: Concept[]
  grammar: string
  context: string
}

export interface Turn {
  npc: Line
  reply: Reply
}

export interface Mission {
  id: string
  kind: 'story' | 'chat'
  title: string
  npcId: string
  locationId: string
  brief: string
  objective: string
  rewards: { xp: number; coins: number }
  unlockAfter?: string
  unitId?: string
  badge?: string
  vocab: { text: string; roman: string; meaning: string }[]
  turns: Turn[]
  outro: Line
}

const thanks: Concept = { label: 'thank you', target: 'നന്ദി', variants: ['നന്ദി', 'nanni', 'nandi', 'nanri'], required: false }
const shari = (required = false): Concept => ({ label: 'okay', target: 'ശരി', variants: ['ശരി', 'shari', 'sari', 'seri', 'ok', 'okay', 'ഓക്കെ'], required })
const give = (required = false): Concept => ({
  label: 'please give',
  target: 'തരൂ',
  variants: ['തരൂ', 'തരു', 'തരുമോ', 'തന്നോളൂ', 'വേണം', 'tharoo', 'tharu', 'tharumo', 'thannolu', 'venam'],
  required,
})

export const MISSIONS: Mission[] = [
  {
    id: 'auto',
    kind: 'story',
    title: 'Stop the Auto',
    npcId: 'raju',
    locationId: 'autostand',
    unitId: 'u1',
    brief: "Reach Ernakulam railway station. Find an auto and negotiate a fare below ₹150.",
    objective: 'Hail Raju’s auto, name the railway station and get the fare under ₹150.',
    rewards: { xp: 120, coins: 50 },
    badge: 'Fare Negotiator',
    vocab: [
      { text: 'എവിടെ', roman: 'evide', meaning: 'where' },
      { text: 'പോകണം', roman: 'pokanam', meaning: 'need to go' },
      { text: 'കൂടുതൽ', roman: 'kooduthal', meaning: 'too much / more' },
      { text: 'മതിയോ', roman: 'mathiyo', meaning: 'is that enough?' },
      { text: 'പോകാം', roman: 'pokaam', meaning: "let's go" },
    ],
    turns: [
      {
        npc: { text: 'എവിടേക്കാണ് പോകേണ്ടത്?', roman: 'Evidekkaanu pokendathu?', meaning: 'Where do you want to go?' },
        reply: {
          intent: 'I want to go to the railway station.',
          text: 'എനിക്ക് റെയിൽവേ സ്റ്റേഷനിലേക്ക് പോകണം.',
          roman: 'Enikku railway stationilekku pokanam.',
          concepts: [
            {
              label: 'railway station',
              target: 'റെയിൽവേ സ്റ്റേഷൻ',
              variants: ['റെയിൽവേ', 'സ്റ്റേഷൻ', 'സ്റ്റേഷനിലേക്ക്', 'സ്റ്റേഷനിൽ', 'ട്രെയിൻ', 'station', 'railway', 'steshan', 'stationilekku', 'stationil'],
              required: true,
            },
            {
              label: 'need to go',
              target: 'പോകണം',
              variants: ['പോകണം', 'പോണം', 'പോകാൻ', 'പോവണം', 'pokanam', 'ponam', 'poganam', 'povanam', 'pokan'],
              required: true,
            },
            { label: 'I / for me', target: 'എനിക്ക്', variants: ['എനിക്ക്', 'enikku', 'enikk', 'eniku'], required: false },
          ],
          grammar: 'The destination comes first and takes -ലേക്ക് (-ilekku, “towards”). The verb പോകണം (pokanam, “need to go”) always goes at the end.',
          context: 'Naming your destination first is exactly what an auto driver expects.',
        },
      },
      {
        npc: { text: 'ശരി. ഇരുനൂറ് രൂപ ആകും.', roman: 'Shari. Irunooru roopa aakum.', meaning: 'Okay. It will be two hundred rupees.' },
        reply: {
          intent: 'That’s too much. Will 120 rupees do?',
          text: 'അത് കൂടുതലാണ്. നൂറ്റിയിരുപത് രൂപ മതിയോ?',
          roman: 'Athu kooduthalaanu. Noottiyirupathu roopa mathiyo?',
          concepts: [
            {
              label: 'a lower fare',
              target: 'നൂറ്റിയിരുപത്',
              variants: ['നൂറ്', 'നൂറ്റി', 'നൂറ്റിയിരുപത്', 'നൂറ്റമ്പത്', 'കുറയ്ക്ക', 'കുറച്ച്', 'nooru', 'nootti', 'noottiyirupathu', 'kurakk', 'kuraykk', 'kurachu', '100', '110', '120', '130', '140'],
              required: true,
            },
            {
              label: 'too much',
              target: 'കൂടുതലാണ്',
              variants: ['കൂടുതൽ', 'കൂടുതലാണ്', 'കൂടിപ്പോയി', 'ജാസ്തി', 'kooduthal', 'kuduthal', 'kooduthalaanu', 'jaasthi', 'jasthi'],
              required: false,
            },
            { label: 'is that enough?', target: 'മതിയോ', variants: ['മതിയോ', 'മതി', 'mathiyo', 'mathi', 'madhi'], required: false },
          ],
          grammar: 'മതിയോ (mathiyo) turns “enough” into a polite question, perfect for bargaining. നൂറ് (100) + ഇരുപത് (20) = നൂറ്റിയിരുപത് (120).',
          context: 'Countering with a lower number is normal and polite at an auto stand.',
        },
      },
      {
        npc: { text: 'നൂറ്റിനാല്പത് തരൂ. അതിൽ കുറയില്ല.', roman: 'Noottinaalpathu tharoo. Athil kurayilla.', meaning: 'Give me 140. I can’t go lower than that.' },
        reply: {
          intent: 'Okay, let’s go. Thank you!',
          text: 'ശരി, പോകാം. നന്ദി!',
          roman: 'Shari, pokaam. Nanni!',
          concepts: [
            { label: "let's go", target: 'പോകാം', variants: ['പോകാം', 'പോവാം', 'pokaam', 'pokam', 'povaam', 'povam'], required: true },
            shari(),
            thanks,
          ],
          grammar: 'The ending -ആം (-aam) makes a friendly suggestion: പോകാം (pokaam) = “let’s go”.',
          context: '₹140 is under your ₹150 budget, so accepting is the smart move.',
        },
      },
    ],
    outro: { text: 'കയറിക്കോളൂ! റെയിൽവേ സ്റ്റേഷനിലേക്ക് പോകാം.', roman: 'Kayarikkollu! Railway stationilekku pokaam.', meaning: 'Hop in! Let’s go to the railway station.' },
  },
  {
    id: 'tea',
    kind: 'story',
    title: 'One Strong Chai',
    npcId: 'ammini',
    locationId: 'teashop',
    unitId: 'u2',
    unlockAfter: 'auto',
    brief: 'Order a chai at Ammini Chechi’s tea shop, choose your sugar and pay politely.',
    objective: 'Order one tea, answer the sugar question and thank Chechi.',
    rewards: { xp: 120, coins: 50 },
    badge: 'Chai Regular',
    vocab: [
      { text: 'ചായ', roman: 'chaaya', meaning: 'tea' },
      { text: 'വേണം', roman: 'venam', meaning: 'want / need' },
      { text: 'പഞ്ചസാര', roman: 'panchasaara', meaning: 'sugar' },
      { text: 'കുറച്ച്', roman: 'kurachu', meaning: 'a little' },
      { text: 'ചേച്ചി', roman: 'chechi', meaning: 'elder sister (respectful)' },
    ],
    turns: [
      {
        npc: { text: 'വരൂ, എന്താ വേണ്ടത്?', roman: 'Varoo, enthaa vendathu?', meaning: 'Come in, what would you like?' },
        reply: {
          intent: 'I want one tea.',
          text: 'എനിക്ക് ഒരു ചായ വേണം.',
          roman: 'Enikku oru chaaya venam.',
          concepts: [
            { label: 'tea', target: 'ചായ', variants: ['ചായ', 'chaaya', 'chaya', 'chai', 'tea'], required: true },
            give(true),
            { label: 'one', target: 'ഒരു', variants: ['ഒരു', 'ഒന്ന്', 'oru', 'onnu'], required: false },
          ],
          grammar: 'വേണം (venam) means “want / need” and sits at the end of the sentence.',
          context: 'A direct order is completely natural at a Kerala tea shop.',
        },
      },
      {
        npc: { text: 'പഞ്ചസാര വേണോ?', roman: 'Panchasaara veno?', meaning: 'Do you want sugar?' },
        reply: {
          intent: 'Just a little is enough.',
          text: 'കുറച്ച് മതി.',
          roman: 'Kurachu mathi.',
          concepts: [
            {
              label: 'how much sugar',
              target: 'കുറച്ച്',
              variants: ['കുറച്ച്', 'വേണ്ട', 'വേണം', 'മതി', 'കൂടുതൽ', 'kurachu', 'kurach', 'venda', 'venam', 'mathi'],
              required: true,
            },
            { label: 'enough', target: 'മതി', variants: ['മതി', 'mathi', 'madhi'], required: false },
          ],
          grammar: 'മതി (mathi) = “enough”. You can also answer വേണ്ട (venda) for “no thanks”.',
          context: 'Any clear sugar preference answers her question.',
        },
      },
      {
        npc: { text: 'ഇതാ ചായ. പതിനഞ്ച് രൂപ.', roman: 'Ithaa chaaya. Pathinanchu roopa.', meaning: 'Here’s your tea. Fifteen rupees.' },
        reply: {
          intent: 'Here you go. Thank you, Chechi!',
          text: 'ഇതാ, നന്ദി ചേച്ചി!',
          roman: 'Ithaa, nanni chechi!',
          concepts: [
            { ...thanks, required: true },
            { label: 'Chechi (sister)', target: 'ചേച്ചി', variants: ['ചേച്ചി', 'chechi', 'chechee'], required: false },
            { label: 'here you go', target: 'ഇതാ', variants: ['ഇതാ', 'ithaa', 'itha'], required: false },
          ],
          grammar: 'ചേച്ചി (chechi, “elder sister”) is a warm, respectful way to address women in Kerala.',
          context: 'Thanking warmly as you pay builds rapport with shopkeepers.',
        },
      },
    ],
    outro: { text: 'സന്തോഷം! വീണ്ടും വരണേ.', roman: 'Santhosham! Veendum varane.', meaning: 'My pleasure! Do come again.' },
  },
  {
    id: 'market',
    kind: 'story',
    title: 'Bargain for Bananas',
    npcId: 'kunjappan',
    locationId: 'market',
    unitId: 'u3',
    unlockAfter: 'tea',
    brief: 'Ask Kunjappan the price of bananas at the local market and bargain it down.',
    objective: 'Ask the price per kilo, make a counter-offer and buy one kilo.',
    rewards: { xp: 140, coins: 50 },
    badge: 'Market Haggler',
    vocab: [
      { text: 'പഴം', roman: 'pazham', meaning: 'banana / fruit' },
      { text: 'എത്ര', roman: 'ethra', meaning: 'how much' },
      { text: 'കിലോ', roman: 'kilo', meaning: 'kilogram' },
      { text: 'അമ്പത്', roman: 'ambathu', meaning: 'fifty' },
      { text: 'തരുമോ', roman: 'tharumo', meaning: 'will you give?' },
    ],
    turns: [
      {
        npc: { text: 'എന്ത് വേണം, മോനേ?', roman: 'Enthu venam, mone?', meaning: 'What do you need, dear?' },
        reply: {
          intent: 'How much is a kilo of bananas?',
          text: 'ഒരു കിലോ പഴത്തിന് എത്രയാണ്?',
          roman: 'Oru kilo pazhathinu ethrayaanu?',
          concepts: [
            { label: 'bananas', target: 'പഴം', variants: ['പഴം', 'പഴത്തിന്', 'നേന്ത്രപ്പഴം', 'pazham', 'pazhathinu', 'banana'], required: true },
            { label: 'how much', target: 'എത്ര', variants: ['എത്ര', 'എത്രയാണ്', 'വില', 'ethra', 'ethrayaanu', 'ethrayanu', 'vila'], required: true },
            { label: 'kilo', target: 'കിലോ', variants: ['കിലോ', 'kilo'], required: false },
          ],
          grammar: 'എത്ര (ethra) means “how much”. Adding -ആണ് (-aanu, “is”) makes it a complete question.',
          context: 'Asking the price first is the classic market opener.',
        },
      },
      {
        npc: { text: 'കിലോ എഴുപത് രൂപ.', roman: 'Kilo ezhupathu roopa.', meaning: 'Seventy rupees a kilo.' },
        reply: {
          intent: 'Will you give it for fifty?',
          text: 'അമ്പത് രൂപയ്ക്ക് തരുമോ?',
          roman: 'Ambathu roopaykku tharumo?',
          concepts: [
            {
              label: 'a lower price',
              target: 'അമ്പത്',
              variants: ['അമ്പത്', 'അറുപത്', 'നാൽപത്', 'കുറയ്ക്ക', 'ambathu', 'ambath', 'arupathu', 'naalpathu', 'kurakk', 'kuraykk', '40', '50', '60'],
              required: true,
            },
            give(),
          ],
          grammar: '-യ്ക്ക് (-ykku) means “for”. തരുമോ (tharumo) = “will you give?”, a polite request.',
          context: 'A counter-offer around 50–60 is reasonable for market bananas.',
        },
      },
      {
        npc: { text: 'അറുപതിന് തരാം. ഇതിൽ കുറയില്ല.', roman: 'Arupathinu tharaam. Ithil kurayilla.', meaning: 'I’ll give it for sixty. Can’t go lower.' },
        reply: {
          intent: 'Okay, give me one kilo.',
          text: 'ശരി, ഒരു കിലോ തരൂ.',
          roman: 'Shari, oru kilo tharoo.',
          concepts: [give(true), shari(), { label: 'kilo', target: 'കിലോ', variants: ['കിലോ', 'kilo'], required: false }],
          grammar: 'തരൂ (tharoo) is the polite “please give”, used constantly in shops.',
          context: 'Accepting a fair final price closes the deal on good terms.',
        },
      },
    ],
    outro: { text: 'ഇതാ, നല്ല പഴമാണ്!', roman: 'Ithaa, nalla pazhamaanu!', meaning: 'Here you go, these are good bananas!' },
  },
  {
    id: 'bus',
    kind: 'story',
    title: 'Bus to Fort Kochi',
    npcId: 'rafeeq',
    locationId: 'busstand',
    unitId: 'u4',
    unlockAfter: 'market',
    brief: 'Check the bus route with Rafeeq the conductor, buy a ticket and ask him to tell you your stop.',
    objective: 'Confirm the route, buy one ticket and ask to be told your stop.',
    rewards: { xp: 160, coins: 50 },
    badge: 'Route Master',
    vocab: [
      { text: 'ബസ്', roman: 'bus', meaning: 'bus' },
      { text: 'പോകുമോ', roman: 'pokumo', meaning: 'will it go?' },
      { text: 'ടിക്കറ്റ്', roman: 'ticket', meaning: 'ticket' },
      { text: 'എത്തുമ്പോൾ', roman: 'ethumbol', meaning: 'when we reach' },
      { text: 'പറയണേ', roman: 'parayane', meaning: 'please tell me' },
    ],
    turns: [
      {
        npc: { text: 'എങ്ങോട്ടാ?', roman: 'Engottaa?', meaning: 'Where to?' },
        reply: {
          intent: 'Does this bus go to Fort Kochi?',
          text: 'ഈ ബസ് ഫോർട്ട് കൊച്ചിക്ക് പോകുമോ?',
          roman: 'Ee bus Fort Kochikku pokumo?',
          concepts: [
            { label: 'Fort Kochi', target: 'ഫോർട്ട് കൊച്ചി', variants: ['ഫോർട്ട്', 'കൊച്ചി', 'കൊച്ചിക്ക്', 'fort', 'kochi', 'kochikku'], required: true },
            { label: 'will it go?', target: 'പോകുമോ', variants: ['പോകുമോ', 'പോവുമോ', 'pokumo', 'pogumo', 'povumo'], required: true },
            { label: 'bus', target: 'ബസ്', variants: ['ബസ്', 'bus'], required: false },
          ],
          grammar: 'Adding -ഓ (-o) to a verb makes a yes/no question: പോകും (pokum, “will go”) → പോകുമോ (pokumo).',
          context: 'Checking the route before boarding is what locals do too.',
        },
      },
      {
        npc: { text: 'പോകും. കയറിക്കോ.', roman: 'Pokum. Kayariko.', meaning: 'It does. Get on.' },
        reply: {
          intent: 'One ticket, please.',
          text: 'ഒരു ടിക്കറ്റ് തരൂ.',
          roman: 'Oru ticket tharoo.',
          concepts: [{ label: 'ticket', target: 'ടിക്കറ്റ്', variants: ['ടിക്കറ്റ്', 'ticket', 'tikket'], required: true }, give()],
          grammar: 'English loanwords like ടിക്കറ്റ് (ticket) are everyday Malayalam.',
          context: 'Conductors collect fares on board, so ask right away.',
        },
      },
      {
        npc: { text: 'ഇരുപത്തഞ്ച് രൂപ.', roman: 'Irupathanchu roopa.', meaning: 'Twenty-five rupees.' },
        reply: {
          intent: 'Please tell me when we reach Fort Kochi.',
          text: 'ഫോർട്ട് കൊച്ചി എത്തുമ്പോൾ പറയണേ.',
          roman: 'Fort Kochi ethumbol parayane.',
          concepts: [
            { label: 'please tell me', target: 'പറയണേ', variants: ['പറയണേ', 'പറയാമോ', 'പറയൂ', 'parayane', 'parayamo', 'parayu'], required: true },
            { label: 'when we reach', target: 'എത്തുമ്പോൾ', variants: ['എത്തുമ്പോൾ', 'എത്തിയാൽ', 'ethumbol', 'etthumbol', 'ethiyal'], required: false },
          ],
          grammar: '-ഉമ്പോൾ (-umbol) means “when”: എത്തുമ്പോൾ (ethumbol) = “when (we) reach”.',
          context: 'Asking the conductor to call your stop is common and friendly.',
        },
      },
    ],
    outro: { text: 'ശരി, പറയാം.', roman: 'Shari, parayaam.', meaning: 'Sure, I’ll tell you.' },
  },
  // Short ambient conversations with townspeople
  {
    id: 'chat-station',
    kind: 'chat',
    title: 'Find Platform One',
    npcId: 'thomas',
    locationId: 'station',
    brief: 'Ask the station master where platform one is.',
    objective: 'Greet Thomas Sir and ask for platform one.',
    rewards: { xp: 20, coins: 10 },
    vocab: [{ text: 'എവിടെയാണ്', roman: 'evideyaanu', meaning: 'where is' }],
    turns: [
      {
        npc: { text: 'നമസ്കാരം! എന്ത് സഹായം വേണം?', roman: 'Namaskaaram! Enthu sahaayam venam?', meaning: 'Hello! How can I help?' },
        reply: {
          intent: 'Hello! Where is platform one?',
          text: 'നമസ്കാരം! ഒന്നാം പ്ലാറ്റ്ഫോം എവിടെയാണ്?',
          roman: 'Namaskaaram! Onnaam platform evideyaanu?',
          concepts: [
            { label: 'where', target: 'എവിടെ', variants: ['എവിടെ', 'എവിടെയാണ്', 'evide', 'evideyaanu', 'evideyanu'], required: true },
            { label: 'platform', target: 'പ്ലാറ്റ്ഫോം', variants: ['പ്ലാറ്റ്ഫോം', 'platform'], required: false },
            { label: 'hello', target: 'നമസ്കാരം', variants: ['നമസ്കാരം', 'namaskaram', 'namaskaaram'], required: false },
          ],
          grammar: 'എവിടെ (evide) = “where”. Put the thing you’re looking for before it.',
          context: 'A greeting before a question is polite with officials.',
        },
      },
    ],
    outro: { text: 'അത് അവിടെ, വലത്തോട്ട്.', roman: 'Athu avide, valathottu.', meaning: 'It’s over there, to the right.' },
  },
  {
    id: 'chat-restaurant',
    kind: 'chat',
    title: 'Fish Curry Meal',
    npcId: 'shaji',
    locationId: 'restaurant',
    brief: 'Order a Kerala fish curry meal.',
    objective: 'Order one fish curry meal from Shaji.',
    rewards: { xp: 20, coins: 10 },
    vocab: [{ text: 'മീൻ', roman: 'meen', meaning: 'fish' }],
    turns: [
      {
        npc: { text: 'വരൂ, ഇരിക്കൂ! എന്ത് കഴിക്കാനാ?', roman: 'Varoo, irikkoo! Enthu kazhikkaanaa?', meaning: 'Come, sit! What will you eat?' },
        reply: {
          intent: 'One fish curry meal, please.',
          text: 'ഒരു മീൻ കറി ഊണ് തരൂ.',
          roman: 'Oru meen curry oonu tharoo.',
          concepts: [
            { label: 'fish', target: 'മീൻ', variants: ['മീൻ', 'meen', 'fish'], required: true },
            { label: 'meal / curry', target: 'ഊണ്', variants: ['ഊണ്', 'കറി', 'oonu', 'oon', 'curry', 'kari'], required: false },
            give(),
          ],
          grammar: 'ഊണ് (oonu) is the classic Kerala rice meal. Describe it first, then തരൂ.',
          context: 'Ordering by dish name is perfect in a local hotel.',
        },
      },
    ],
    outro: { text: 'ഇപ്പോൾ കൊണ്ടുവരാം!', roman: 'Ippol konduvaraam!', meaning: 'Bringing it right away!' },
  },
  {
    id: 'chat-hospital',
    kind: 'chat',
    title: 'At the Clinic',
    npcId: 'mary',
    locationId: 'hospital',
    brief: 'Tell the nurse what is wrong.',
    objective: 'Explain that you have a headache.',
    rewards: { xp: 20, coins: 10 },
    vocab: [{ text: 'തലവേദന', roman: 'thalavedhana', meaning: 'headache' }],
    turns: [
      {
        npc: { text: 'എന്ത് പറ്റി?', roman: 'Enthu patti?', meaning: 'What happened?' },
        reply: {
          intent: 'I have a headache.',
          text: 'എനിക്ക് തലവേദനയാണ്.',
          roman: 'Enikku thalavedhanayaanu.',
          concepts: [
            { label: 'headache', target: 'തലവേദന', variants: ['തലവേദന', 'തലവേദനയാണ്', 'thalavedhana', 'thalavedana', 'headache'], required: true },
            { label: 'I / for me', target: 'എനിക്ക്', variants: ['എനിക്ക്', 'enikku', 'eniku'], required: false },
          ],
          grammar: 'Malayalam says “to me, headache is”: എനിക്ക് + തലവേദന + ആണ്.',
          context: 'Short and clear is best in a medical setting.',
        },
      },
    ],
    outro: { text: 'വിഷമിക്കേണ്ട, ഡോക്ടർ ഉടനെ വരും.', roman: 'Vishamikkenda, doctor udane varum.', meaning: 'Don’t worry, the doctor will come soon.' },
  },
  {
    id: 'chat-home',
    kind: 'chat',
    title: 'Neighbourly Hello',
    npcId: 'ammachi',
    locationId: 'residential',
    brief: 'Ammachi wants to know how you are.',
    objective: 'Tell Ammachi you are well and ask about her.',
    rewards: { xp: 20, coins: 10 },
    vocab: [{ text: 'സുഖമാണ്', roman: 'sukhamaanu', meaning: 'I am well' }],
    turns: [
      {
        npc: { text: 'മോനേ, സുഖമാണോ?', roman: 'Mone, sukhamaano?', meaning: 'Dear, are you well?' },
        reply: {
          intent: 'Yes, I’m well. And you, Ammachi?',
          text: 'അതെ, സുഖമാണ്. അമ്മച്ചിക്കോ?',
          roman: 'Athe, sukhamaanu. Ammachikko?',
          concepts: [
            { label: 'well', target: 'സുഖമാണ്', variants: ['സുഖം', 'സുഖമാണ്', 'sukham', 'sukhamaanu', 'sugham', 'sukhamanu'], required: true },
            { label: 'yes', target: 'അതെ', variants: ['അതെ', 'ഉവ്വ്', 'athe', 'uvvu'], required: false },
          ],
          grammar: 'സുഖമാണോ? (are you well?) is answered with സുഖമാണ് (I am well). The -ഓ marks the question.',
          context: 'Returning the question shows warmth to elders.',
        },
      },
    ],
    outro: { text: 'സുഖം തന്നെ, ദൈവം കാത്തു!', roman: 'Sukham thanne, daivam kaathu!', meaning: 'I’m well too, by God’s grace!' },
  },
]

export const missionById = (id: string) => MISSIONS.find((m) => m.id === id)
export const STORY_MISSIONS = MISSIONS.filter((m) => m.kind === 'story')
