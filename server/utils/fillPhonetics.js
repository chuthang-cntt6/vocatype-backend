// server/utils/fillPhonetics.js
// Usage: node server/utils/fillPhonetics.js
// Requires: Node 18+ (global fetch) and DATABASE_URL env var

const db = require('../models/db');

// Put your words here (deduplicated, lowercased handled in query)
const WORDS = [
  "environment","pollution","air pollution","water pollution","soil pollution","grill","noise pollution","climate change","boarding card","hotel","flight","passport","itinerary","computer","software","internet","keyboard","noodle","soup","Healthcare","Ecosystem","algorithm","interface","database","protocol","cybersecurity","encryption","bandwidth","virtual machine","scalability","machine learning","cloud computing","debugging","compiler","framework","repository","integration","backend","frontend","version control","middleware","docker","API","server","client","network","router","firewall","operating system","CPU","RAM","hard drive","SSD","peripheral","input device","output device","application","browser","web development","mobile development","user experience (UX)","user interface (UI)","big data","global warming","data mining","artificial intelligence (AI)","virtual reality (VR)","augmented reality (AR)","IoT (Internet of Things)","blockchain","cryptocurrency","quantum computing","serverless computing","containerization","microservices","devops","agile methodology","scrum","UX research","prototyping","wireframe","user story","testing","bug","patch","deployment","hosting","domain name","IP address","DNS (Domain Name System)","VPN (Virtual Private Network)","malware","phishing","two-factor authentication (2FA)","biometrics","data center","virtualization","load balancer","cache","cookie","session","encryption key","digital signature","open source","proprietary software","webinar","podcast","streaming","e-commerce","fintech","robotics","automation","appetizer","main course","dessert","beverage","vegetarian","vegan","ingredients","spices","herbs","chop","slice","dice","peel","mince","grate","mix","stir","whisk","knead","boil","simmer","fry","sauté","deep-fry","roast","bake","steam","stew","saucepan","frying pan","baking tray","cutting board","knife","spoon","fork","chopsticks","bowl","plate","mug","glass","blender","oven","microwave","refrigerator","sweet","sour","salty","spicy","bitter","umami","crispy","tender","fresh","stale","delicious","tasty","dishes","recipe","cuisine","cook","chef","waiter","waitress","menu","order","bill","tip","reservation","takeaway","delivery","restaurant","cafe","bakery","market","supermarket","food poisoning","allergy","diet","nutrition","organic","fast food","street food","airport","airplane","ticket","luggage","suitcase","backpack","departure","arrival","customs","immigration","terminal","gate","check-in","security check","flight attendant","pilot","take off","land","delay","cancel","hostel","resort","accommodation","check-out","single room","double room","suite","tourist","tour guide","sightseeing","landmark","attraction","museum","beach","mountain","valley","waterfall","forest","desert","map","currency","exchange rate","souvenir","local cuisine","travel agency","package tour","cruise","expedition","adventure travel","eco-tourism","backpacking","road trip","departure lounge","baggage claim","connecting flight","layover","jet lag","travel insurance","vaccination","local guide","souvenir shop","duty-free shop","public transport","taxi stand","rent a car","campsite","tent","sleeping bag","school","student","teacher","professor","classroom","lesson","homework","exam","test","grade","degree","diploma","curriculum","subject","science","mathematics","literature","history","geography","art","music","physical education (PE)","foreign language","library","textbook","notebook","pen","pencil","eraser","ruler","calculator","chalkboard","whiteboard","desk","chair","lecture","seminar","workshop","research","presentation","discussion","group work","project","assignment","deadline","tuition fee","scholarship","campus","dormitory","cafeteria","principal","dean","syllabus","enrollment","admission","graduation","alumni","distance learning","online course","blended learning","tutorial","mentor","internship","dissertation","thesis","academic advisor","extracurricular activities","study abroad","lifelong learning","greenhouse effect","deforestation","habitat","biodiversity","extinction","endangered species","conservation","sustainability","renewable energy","solar power","wind power","hydropower","geothermal energy","fossil fuels","coal","oil","natural gas","carbon footprint","recycling","waste management","landfill","composting","reduce","reuse","reforest","wildlife","national park","natural disaster","flood","drought","earthquake","tsunami","hurricane","typhoon","tornado","volcano","landslide","ozone layer","acid rain","smog","pesticide","chemical waste","nuclear waste","biodegradable","non-biodegradable","carbon capture","eco-friendly","green technology","emission","footprint","land degradation","soil erosion","aquatic life","terrestrial life","ecosystem services","pollution control","waste segregation","public awareness","environmental protection","health","illness","symptom","fever","cough","sore throat","headache","stomachache","flu","cold","infection","diagnosis","treatment","prescription","medicine","doctor","nurse","pharmacist","hospital","clinic","pharmacy","surgery","check-up","blood pressure","temperature","exercise","fitness","sleep","stress","mental health","physical health","hygiene","wellness","recovery","prevention","first aid","ambulance","emergency","pain","chronic disease","acute disease","virus","bacteria","immune system","heart attack","stroke","cancer","diabetes","obesity","blood test","x-ray","mri","ultrasound","medication","side effect","dosage","overdose","rehabilitation","physiotherapy","psychology","therapy","vaccine","outpatient","inpatient","public health","epidemic","pandemic","quarantine","nutritionist","personal trainer","healthy lifestyle","marinate","visa","heart rate"
];

async function fetchIPA(word) {
  // Use dictionaryapi.dev (free). It often returns IPA in phonetics[].text
  // For multi-word terms, try the first token as fallback.
  const q = encodeURIComponent(word.toLowerCase());
  const urls = [
    `https://api.dictionaryapi.dev/api/v2/entries/en/${q}`,
    // fallback: first token only (for compound terms)
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.split(' ')[0].toLowerCase())}`
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { timeout: 10000 });
      if (!res.ok) continue;
      const data = await res.json();
      const entry = Array.isArray(data) ? data[0] : null;
      const ipa = entry?.phonetics?.find(p => p.text)?.text || null;
      if (ipa) return ipa;
    } catch (_) {
      // ignore and try next
    }
  }
  return null;
}

async function main() {
  let updated = 0, skipped = 0;
  for (const word of WORDS) {
    const ipa = await fetchIPA(word);
    if (!ipa) {
      skipped++;
      continue;
    }
    try {
      await db.query(
        'UPDATE vocabulary SET phonetic = $1 WHERE LOWER(word) = LOWER($2)',
        [ipa, word]
      );
      updated++;
      console.log(`✔ ${word} -> ${ipa}`);
    } catch (e) {
      console.warn(`✖ DB update failed for ${word}:`, e.message);
    }
    // throttle lightly
    await new Promise(r => setTimeout(r, 120));
  }
  console.log(`Done. Updated: ${updated}, Skipped (no IPA found): ${skipped}`);
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});


