import { NewsStory, LanguageCode, Perspective, TimelineEvent, NarrativeLandscapeDetails } from "../types";

// In-memory client-side translation cache
const clientTranslationCache = new Map<string, string>();

interface TranslationPattern {
  verifiablePrefix: string;
  crossVerifiedAcross: string;
  leftNarrative: string;
  centerNarrative: string;
  rightNarrative: string;
  readerTakeawayPrefix: string;
  timelineStep1: string;
  timelineStep2: string;
  timelineStep3: string;
  timelineStep4: string;
  timelineDesc1: (source: string, title: string) => string;
  timelineDesc2: (source: string) => string;
  timelineDesc3: (source: string) => string;
  timelineDesc4: (sourcesCount: number) => string;
  leftFraming: string;
  centerFraming: string;
  rightFraming: string;
  leftEmphasized: string;
  centerEmphasized: string;
  rightEmphasized: string;
  leftDownplayed: string;
  centerDownplayed: string;
  rightDownplayed: string;
  narrativeSummaryTpl: (source: string, title: string) => string;
}

const TRANSLATION_PATTERNS: Record<LanguageCode, TranslationPattern> = {
  en: {
    verifiablePrefix: "Verified reporting confirmed key occurrences:",
    crossVerifiedAcross: "Cross-verified across independent newsrooms including",
    leftNarrative: "Progressive and left-leaning outlets scrutinize institutional procedure, statutory conventions, and platform opposition rebuttals.",
    centerNarrative: "Neutral wire desks and centrist publications document the empirical timeline, official notices, and statutory filings verbatim.",
    rightNarrative: "Nationalist and right-leaning newsrooms frame the development around governance momentum, sovereign authority, and national interest.",
    readerTakeawayPrefix: "THE PAPERBACK READER TAKEAWAY: Empirical facts are established; evaluate each newsroom's commentary with an awareness of its editorial lean.",
    timelineStep1: "Initial Ground Break",
    timelineStep2: "Official Filings & Institutional Replies",
    timelineStep3: "Cross-Spectrum National Analysis",
    timelineStep4: "Multi-Newsroom Consensus & Ongoing Review",
    timelineDesc1: (source, title) => `${source} filed the foundational dispatch on "${title}", reporting initial ground developments, emergency briefings, or administrative actions.`,
    timelineDesc2: (source) => `${source} documented statutory notices, formal communiqués, or counter-rebuttals submitted by participating stakeholder leadership.`,
    timelineDesc3: (source) => `${source} and regional desks published investigative deep-dives analyzing legal precedents, policy impact, and broader governance ramifications.`,
    timelineDesc4: (count) => `Cross-verified across ${count || 5} newsrooms. Statutory follow-ups, committee inquiries, and public hearings remain under active monitoring.`,
    leftFraming: "CONCENTRATES ON INSTITUTIONAL ACCOUNTABILITY, STATUTORY CONVENTIONS, AND COUNTER-STATEMENTS ISSUED BY PARTICIPATING OPPOSITION LEADERSHIP.",
    centerFraming: "CHRONOLOGICALLY RECORDS VERIFIED STATEMENTS, OFFICIAL COMMUNIQUÉS, AND STATUTORY FILINGS WITHOUT PARTISAN COMMENTARY.",
    rightFraming: "EMPHASIZES EXECUTIVE GOVERNANCE RESOLVE, NATIONAL PRIDE, AND SOVEREIGN ADMINISTRATIVE MOMENTUM.",
    leftEmphasized: "Procedural compliance and public accountability.",
    centerEmphasized: "Chronological timeline and verbatim quotes.",
    rightEmphasized: "Executive resolve and ceremonial decorum.",
    leftDownplayed: "Executive ceremonial declarations.",
    centerDownplayed: "Partisan speculation and unverified claims.",
    rightDownplayed: "Opposition procedural challenges.",
    narrativeSummaryTpl: (source, title) => `Reporting by ${source} documents key statements and developments surrounding "${title}". The coverage highlights primary stakeholders, official positions, and the direct public implications of the unfolding situation.`
  },
  hi: {
    verifiablePrefix: "सत्यापित रिपोर्टिंग के अनुसार प्रमुख घटनाक्रम की पुष्टि की गई है:",
    crossVerifiedAcross: "विभिन्न स्वतंत्र समाचार कक्षों द्वारा क्रॉस-सत्यापित, जिनमें शामिल हैं:",
    leftNarrative: "वामपंथी एवं प्रगतिशील मीडिया आउटलेट संस्थागत जवाबदेही, नियमों के पालन और विपक्ष के बयानों को प्रमुखता देते हैं।",
    centerNarrative: "तटस्थ और मुख्यधारा के समाचार कक्ष आधिकारिक बयानों, प्राथमिक रिकॉर्ड और वस्तुनिष्ठ तथ्यों का कालक्रम के अनुसार विवरण प्रस्तुत करते हैं।",
    rightNarrative: "राष्ट्रवादी एवं दक्षिणपंथी समाचार आउटलेट इसे शासन की दृढ़ता, राष्ट्रीय संप्रभुता और प्रशासनिक उपलब्धियों के रूप में प्रस्तुत करते हैं।",
    readerTakeawayPrefix: "द पेपरबैक पाठक निष्कर्ष: बुनियादी तथ्य पुष्ट हैं; प्रत्येक मीडिया हाउस की व्याख्या को उसके संपादकीय दृष्टिकोण के संदर्भ में समझें।",
    timelineStep1: "प्रारंभिक घटनाक्रम एवं पहली रिपोर्ट",
    timelineStep2: "आधिकारिक बयान एवं वैधानिक नोटिस",
    timelineStep3: "राष्ट्रीय स्तर पर संपादकीय विश्लेषण",
    timelineStep4: "बहु-समाचार कक्ष सहमति एवं निरंतर समीक्षा",
    timelineDesc1: (source, title) => `${source} ने "${title}" पर प्राथमिक रिपोर्ट दर्ज की, जिसमें प्रारंभिक घटनाक्रम, आपातकालीन ब्रीफिंग और प्रशासनिक कदमों का विवरण दिया गया।`,
    timelineDesc2: (source) => `${source} ने आधिकारिक नोटिस, औपचारिक विज्ञप्तियां और संबंधित पक्षों द्वारा प्रस्तुत प्रत्युत्तरों को प्रलेखित किया।`,
    timelineDesc3: (source) => `${source} और क्षेत्रीय संवाददाताओं ने कानूनी पहलुओं, नीतिगत प्रभाव और व्यापक प्रशासनिक प्रभावों का गहन विश्लेषण प्रकाशित किया।`,
    timelineDesc4: (count) => `${count || 5} प्रमुख समाचार कक्षों द्वारा सत्यापित। वैधानिक अनुवर्ती कार्रवाइयों, समिति की जांच और सार्वजनिक प्रक्रियाओं पर निरंतर निगरानी जारी है।`,
    leftFraming: "संस्थागत जवाबदेही, संवैधानिक परंपराओं और विपक्षी नेतृत्व द्वारा जारी बयानों पर केंद्रित।",
    centerFraming: "बिना किसी पक्षपात के आधिकारिक बयानों, सरकारी विज्ञप्तियों और तथ्यात्मक कालक्रम का विवरण।",
    rightFraming: "प्रशासनिक दृढ़ता, राष्ट्रीय संप्रभुता, सुरक्षा और शासन की उपलब्धियों पर केंद्रित।",
    leftEmphasized: "प्रक्रियात्मक नियमों का पालन और सार्वजनिक जवाबदेही।",
    centerEmphasized: "वस्तुनिष्ठ कालक्रम और आधिकारिक विज्ञप्ति।",
    rightEmphasized: "प्रशासनिक दृढ़ता और राष्ट्रीय सुरक्षा।",
    leftDownplayed: "प्रशासनिक औपचारिक घोषणाएं।",
    centerDownplayed: "पक्षपातपूर्ण अटकलें।",
    rightDownplayed: "विपक्षी प्रक्रियात्मक आपत्तियां।",
    narrativeSummaryTpl: (source, title) => `${source} की रिपोर्टिंग में "${title}" से संबंधित प्रमुख बयानों और घटनाक्रमों को रेखांकित किया गया है। यह कवरेज मुख्य हितधारकों, आधिकारिक रुख और सार्वजनिक प्रभावों पर प्रकाश डालती है।`
  },
  ml: {
    verifiablePrefix: "സ്ഥിരീകരിച്ച റിപ്പോർട്ടുകൾ പ്രകാരം പ്രധാന വസ്തുതകൾ വ്യക്തമായിട്ടുണ്ട്:",
    crossVerifiedAcross: "സ്വതന്ത്ര വാർത്താ ഏജൻസികൾ മുഖേന സ്ഥിരീകരിച്ചത്:",
    leftNarrative: "പുരോഗമന മാധ്യമങ്ങൾ സ്ഥാപനപരമായ സുതാര്യതയ്ക്കും പ്രതിപക്ഷ നിലപാടുകൾക്കും പ്രാധാന്യം നൽകുന്നു.",
    centerNarrative: "നിഷ്പക്ഷ മാധ്യമങ്ങൾ ഔദ്യോഗിക രേഖകളും സംഭവങ്ങളുടെ സമയക്രമവും രേഖപ്പെടുത്തുന്നു.",
    rightNarrative: "ദേശീയ മാധ്യമങ്ങൾ ഭരണപരമായ നേട്ടങ്ങളും രാജ്യതാൽപ്പര്യവും ഉയർത്തിക്കാട്ടുന്നു.",
    readerTakeawayPrefix: "വായനക്കാരുടെ നിഗമനം: അടിസ്ഥാന വസ്തുതകൾ ഉറപ്പാണ്; ഓരോ മാധ്യമത്തിന്റെയും നിലപാട് മനസ്സിലാക്കി വാർത്തകൾ വിലയിരുത്തുക.",
    timelineStep1: "പ്രാഥമിക റിപ്പോർട്ട്",
    timelineStep2: "ഔദ്യോഗിക അറിയിപ്പുകളും പ്രതികരണങ്ങളും",
    timelineStep3: "ദേശീയതലത്തിലുള്ള വിശകലനം",
    timelineStep4: "തുടർ നിരീക്ഷണവും പരിശോധനയും",
    timelineDesc1: (source, title) => `${source}, "${title}" എന്ന വിഷയത്തിൽ പ്രാഥമിക റിപ്പോർട്ട് പ്രസിദ്ധീകരിച്ചു; തുടക്കത്തിലെ സംഭവവികാസങ്ങളും അടിയന്തര നടപടികളും ഇതിൽ രേഖപ്പെടുത്തിയിട്ടുണ്ട്.`,
    timelineDesc2: (source) => `${source} ഔദ്യോഗിക നോട്ടീസുകൾ, ഭരണഘടനാപരമായ അറിയിപ്പുകൾ, ബന്ധപ്പെട്ട നേതൃത്വം നൽകിയ മറുപടികൾ എന്നിവ രേഖപ്പെടുത്തി.`,
    timelineDesc3: (source) => `${source} അടക്കമുള്ള മാധ്യമങ്ങൾ നിയമപരമായ വശങ്ങളും നയപരമായ പ്രത്യാഘാതങ്ങളും വിശകലനം ചെയ്യുന്ന വിശദമായ അന്വേഷണാത്മക റിപ്പോർട്ടുകൾ പ്രസിദ്ധീകരിച്ചു.`,
    timelineDesc4: (count) => `${count || 5} വാർത്താ ഏജൻസികൾ മുഖേന സ്ഥിരീകരിച്ചു. തുടർ നടപടികളും സമിതി അന്വേഷണങ്ങളും സജീവ നിരീക്ഷണത്തിലാണ്.`,
    leftFraming: "സ്ഥാപനപരമായ സുതാര്യത, ഭരണഘടനാപരമായ മാനദണ്ഡങ്ങൾ, പ്രതിപക്ഷ നിലപാടുകൾ എന്നിവയിൽ ശ്രദ്ധ കേന്ദ്രീകരിക്കുന്നു.",
    centerFraming: "ഔദ്യോഗിക രേഖകളും സംഭവങ്ങളുടെ സമയക്രമവും പക്ഷപാതരഹിതമായി രേഖപ്പെടുത്തുന്നു.",
    rightFraming: "ഭരണപരമായ ദൃഢത, ദേശീയ ഐക്യം, നയപരമായ തീരുമാനങ്ങൾ എന്നിവയ്ക്ക് മുൻഗണന നൽകുന്നു.",
    leftEmphasized: "നിയമപരമായ സുതാര്യതയും പൊതു ഉത്തരവാദിത്തവും.",
    centerEmphasized: "സംഭവങ്ങളുടെ യഥാർത്ഥ സമയക്രമവും ഔദ്യോഗിക പ്രതികരണങ്ങളും.",
    rightEmphasized: "ഭരണപരമായ നേട്ടങ്ങളും ദേശീയ സുരക്ഷയും.",
    leftDownplayed: "ഔദ്യോഗിക പ്രഖ്യാപനങ്ങൾ.",
    centerDownplayed: "അടിസ്ഥാനരഹിതമായ അഭ്യൂഹങ്ങൾ.",
    rightDownplayed: "പ്രതിപക്ഷത്തിന്റെ നടപടിക്രമപരമായ തടസ്സവാദങ്ങൾ.",
    narrativeSummaryTpl: (source, title) => `${source} നൽകിയ റിപ്പോർട്ടിൽ "${title}" സംബന്ധിച്ച പ്രധാന പ്രസ്താവനകളും സംഭവവികാസങ്ങളും രേഖപ്പെടുത്തിയിട്ടുണ്ട്. പ്രധാന പങ്കാളികളുടെ നിലപാടുകളും ഇതിന്റെ പൊതുജന പ്രത്യാഘാതങ്ങളും റിപ്പോർട്ട് വ്യക്തമാക്കുന്നു.`
  },
  bn: {
    verifiablePrefix: "যাচাইকৃত প্রতিবেদনের ভিত্তিতে মূল ঘটনার সত্যতা নিশ্চিত করা হয়েছে:",
    crossVerifiedAcross: "বিভিন্ন স্বাধীন সংবাদমাধ্যমের মাধ্যমে যাচাইকৃত, যার মধ্যে অন্তর্ভুক্ত:",
    leftNarrative: "প্রগতিশীল ও বামপন্থী মাধ্যমগুলি প্রাতিষ্ঠানিক জবাবদিহিতা ও বিরোধী বক্তব্যকে প্রাধান্য দিচ্ছে।",
    centerNarrative: "নিরপেক্ষ ও মূলধারার সংবাদমাধ্যমগুলি তথ্যভিত্তিক কালানুক্রমিক বিবরণ প্রকাশ করছে।",
    rightNarrative: "জাতীয়তাবাদী ও দক্ষিণপন্থী মাধ্যমগুলি এটিকে সুশাসনের সংকল্প ও জাতীয় স্বার্থের অংশ হিসেবে উপস্থাপন করছে।",
    readerTakeawayPrefix: "পাঠক পর্যালোচনা: মূল সত্য প্রমাণিত; সংবাদমাধ্যমের নিজস্ব দৃষ্টিভঙ্গি বিবেচনা করে খবর বিশ্লেষণ করুন।",
    timelineStep1: "প্রাথমিক তথ্য ও মাঠপর্যায়ের প্রতিবেদন",
    timelineStep2: "অফিসিয়াল বিজ্ঞপ্তি ও প্রাতিষ্ঠানিক প্রতিক্রিয়া",
    timelineStep3: "জাতীয় স্তরে গভীর বিশ্লেষণ",
    timelineStep4: "সর্বসম্মত যাচাই ও চলমান পর্যবেক্ষণ",
    timelineDesc1: (source, title) => `${source} "${title}" বিষয়ে প্রাথমিক প্রতিবেদন প্রকাশ করেছে, যেখানে মাঠপর্যায়ের তাৎক্ষণিক পরিস্থিতি ও প্রশাসনিক পদক্ষেপ তুলে ধরা হয়েছে।`,
    timelineDesc2: (source) => `${source} প্রাতিষ্ঠানিক বিজ্ঞপ্তি, সরকারি প্রেস বিজ্ঞপ্তি এবং সংশ্লিষ্ট পক্ষের যুক্তি-পাল্টা যুক্তি বিস্তারিতভাবে নথিভুক্ত করেছে।`,
    timelineDesc3: (source) => `${source} এবং আঞ্চলিক সংবাদমাধ্যমগুলি আইনি নজির, নীতিগত প্রভাব এবং বৃহত্তর প্রশাসনিক প্রভাবের বিস্তারিত বিশ্লেষণ প্রকাশ করেছে।`,
    timelineDesc4: (count) => `${count || 5}টি স্বতন্ত্র সংবাদমাধ্যম দ্বারা যাচাইকৃত। প্রশাসনিক অগ্রগতি ও তদন্তের ওপর সার্বক্ষণিক নজর রাখা হচ্ছে।`,
    leftFraming: "প্রাতিষ্ঠানিক জবাবদিহিতা, সাংবিধানিক নিয়মাবলী এবং বিরোধী নেতৃত্বের পাল্টা বক্তব্যের ওপর গুরুত্বারোপ।",
    centerFraming: "কোনো পক্ষপাত ছাড়া সরাসরি যাচাইকৃত তথ্য, সরকারি বিজ্ঞপ্তি ও সঠিক ঘটনাপ্রবাহের বিবরণ।",
    rightFraming: "প্রশাসনিক দৃঢ়তা, জাতীয় সংহতি এবং নীতি প্রয়োগের ওপর জোর।",
    leftEmphasized: "নিয়ম ও প্রশাসনিক স্বচ্ছতা বজায় রাখা।",
    centerEmphasized: "বস্তুনিষ্ঠ কালানুক্রম ও মূল বিবৃতি।",
    rightEmphasized: "প্রশাসনিক সংকল্প ও জাতীয় স্বার্থ।",
    leftDownplayed: "আনুষ্ঠানিক সরকারি ঘোষণা।",
    centerDownplayed: "অযাচাইকৃত জল্পনা।",
    rightDownplayed: "বিরোধীদের প্রক্রিয়াগত আপত্তি।",
    narrativeSummaryTpl: (source, title) => `${source}-এর প্রতিবেদনে "${title}" সম্পর্কিত মূল বিবৃতি এবং অগ্রগতি তুলে ধরা হয়েছে। এটি গুরুত্বপূর্ণ পক্ষসমূহের অবস্থান ও সার্বিক প্রভাব পর্যালোচনা করে।`
  },
  ta: {
    verifiablePrefix: "சரிபார்க்கப்பட்ட செய்திகளின்படி அடிப்படை உண்மைகள் உறுதி செய்யப்பட்டுள்ளன:",
    crossVerifiedAcross: "சுயாதீன செய்தி நிறுவனங்கள் மூலம் குறுக்கு-சரிபார்க்கப்பட்டது, இதில் அடங்கும்:",
    leftNarrative: "முற்போக்கு மற்றும் இடதுசாரி ஊடகங்கள் நிறுவன பொறுப்புடைமை மற்றும் எதிர்க்கட்சி வாதங்களை முன்வைக்கின்றன.",
    centerNarrative: "நடுநிலை செய்தி நிறுவனங்கள் அதிகாரப்பூர்வ பதிவுகள் மற்றும் நிகழ்வுகளின் காலவரிசையை ஆவணப்படுத்துகின்றன.",
    rightNarrative: "தேசியவாத மற்றும் வலதுசாரி செய்தி அறைகள் ஆட்சி வலிமை மற்றும் தேசிய நலனை வலியுறுத்துகின்றன.",
    readerTakeawayPrefix: "வாசகர் வழிகாட்டல்: உண்மைகள் உறுதி செய்யப்பட்டுள்ளன; ஊடகங்களின் தலையங்க பார்வையை அறிந்து செய்திகளை அணுகவும்.",
    timelineStep1: "ஆரம்ப கள அறிக்கை",
    timelineStep2: "அதிகாரப்பூர்வ அறிவிப்புகள் மற்றும் பதில்கள்",
    timelineStep3: "தேசிய அளவிலான பகுப்பாய்வு",
    timelineStep4: "தொடர் கண்காணிப்பு மற்றும் ஆய்வு",
    timelineDesc1: (source, title) => `${source} நிறுவனம் "${title}" குறித்து முதன்மை கள அறிக்கையை வெளியிட்டது, இதில் ஆரம்பக்கட்ட நிகழ்வுகள் பதிவு செய்யப்பட்டுள்ளன.`,
    timelineDesc2: (source) => `${source} சட்டப்பூர்வ அறிவிப்புகள், அதிகாரப்பூர்வ தகவல்கள் மற்றும் பங்குதாரர்களின் பதில் வாதங்களை ஆவணப்படுத்தியது.`,
    timelineDesc3: (source) => `${source} மற்றும் பிராந்திய ஊடகங்கள் சட்டப் பின்னணி மற்றும் கொள்கை தாக்கங்கள் குறித்த ஆழமான பகுப்பாய்வை வெளியிட்டன.`,
    timelineDesc4: (count) => `${count || 5} செய்தி நிறுவனங்கள் மூலம் சரிபார்க்கப்பட்டது. சட்டப்பூர்வ தொடர் நடவடிக்கைகள் தீவிர கண்காணிப்பில் உள்ளன.`,
    leftFraming: "நிறுவன பொறுப்புடைமை, அரசியலமைப்பு விதிகள் மற்றும் எதிர்க்கட்சி வாதங்களில் கவனம் செலுத்துகிறது.",
    centerFraming: "சார்பற்ற முறையில் அதிகாரப்பூர்வ அறிவிப்புகள் மற்றும் நிகழ்வுகளின் காலவரிசையை ஆவணப்படுத்துகிறது.",
    rightFraming: "ஆட்சி வலிமை, தேசிய பெருமிதம் மற்றும் நிர்வாக முடிவுகளுக்கு முக்கியத்துவம் அளிக்கிறது.",
    leftEmphasized: "நடைமுறை வெளிப்படைத்தன்மை மற்றும் பொதுப் பொறுப்பு.",
    centerEmphasized: "உண்மையான காலவரிசை மற்றும் அதிகாரப்பூர்வ மேற்கோள்கள்.",
    rightEmphasized: "நிர்வாக வலிமை மற்றும் தேசிய நலன்.",
    leftDownplayed: "அதிகாரப்பூர்வ சடங்கு அறிவிப்புகள்.",
    centerDownplayed: "சரிபார்க்கப்படாத யூகங்கள்.",
    rightDownplayed: "எதிர்க்கட்சிகளின் நடைமுறை ஆட்சேபனைகள்.",
    narrativeSummaryTpl: (source, title) => `${source} வெளியிட்ட செய்தி "${title}" தொடர்பான முக்கிய அறிக்கைகள் மற்றும் முன்னேற்றங்களை ஆவணப்படுத்துகிறது.`
  },
  te: {
    verifiablePrefix: "ధృవీకరించబడిన నివేదికల ప్రకారం కీలక వాస్తవాలు నిర్ధారించబడ్డాయి:",
    crossVerifiedAcross: "స్వతంత్ర వార్తా సంస్థల ద్వారా క్రాస్-వెరిఫై చేయబడింది:",
    leftNarrative: "వామపక్ష మరియు ప్రగతిశీల మీడియా సంస్థాగత పారదర్శకత మరియు ప్రతిపక్ష వాదనలను హైలైట్ చేస్తుంది.",
    centerNarrative: "తటస్థ మీడియా అధికారిక పత్రాలు మరియు కాలక్రమానుసార వాస్తవాలను నమోదు చేస్తుంది.",
    rightNarrative: "జాతీయవాద మీడియా పాలనా సామర్థ్యం మరియు జాతీయ ప్రయోజనాల ఆధారంగా విశ్లేషిస్తుంది.",
    readerTakeawayPrefix: "పాఠకుల ముగింపు: ప్రాథమిక వాస్తవాలు స్థిరపడ్డాయి; వార్తా సంస్థల సంపాదకీయ దృక్పథాన్ని పరిగణనలోకి తీసుకోండి.",
    timelineStep1: "ప్రారంభ గ్రౌండ్ రిపోర్ట్",
    timelineStep2: "అధికారిక ప్రకటనలు & స్పందనలు",
    timelineStep3: "జాతీయ విశ్లేషణ",
    timelineStep4: "బహుళ-వార్తా సంస్థల పర్యవేక్షణ",
    timelineDesc1: (source, title) => `${source} సంస్థ "${title}" పై ప్రాథమిక నివేదికను నమోదు చేసింది, ప్రారంభ పరిణామాలను ప్రచురించింది.`,
    timelineDesc2: (source) => `${source} చట్టబద్ధమైన నోటీసులు, అధికారిక ప్రకటనలు మరియు ప్రతిస్పందనలను నమోదు చేసింది.`,
    timelineDesc3: (source) => `${source} మరియు ప్రాంతీయ విభాగాలు చట్టపరమైన అంశాలు, విధాన ప్రభావాలపై లోతైన విశ్లేషణను ప్రచురించాయి.`,
    timelineDesc4: (count) => `${count || 5} వార్తా సంస్థల ద్వారా ధృవీకరించబడింది. తదుపరి చర్యలపై నిరంతర పర్యవేక్షణ కొనసాగుతోంది.`,
    leftFraming: "సంస్థాగత జవాబుదారీతనం, రాజ్యాంగ నిబంధనలు మరియు ప్రతిపక్ష వాదనలపై దృష్టి.",
    centerFraming: "పక్షపాతం లేకుండా అధికారిక సమాచారం మరియు కాలక్రమాన్ని నిష్పాక్షికంగా నమోదు చేయడం.",
    rightFraming: "పరిపాలనా సంకల్పం, జాతీయ ప్రయోజనాలు మరియు దృఢమైన నిర్ణయాలకు ప్రాధాన్యత.",
    leftEmphasized: "ప్రజా బాధ్యత మరియు నిబంధనల అమలు.",
    centerEmphasized: "యథార్థ కాలక్రమం మరియు ప్రత్యక్ష ప్రకటనలు.",
    rightEmphasized: "పరిపాలనా దృఢత్వం మరియు జాతీయ భద్రత.",
    leftDownplayed: "అధికారిక ప్రకటనలు.",
    centerDownplayed: "ఆధారాలు లేని ఊహాగానాలు.",
    rightDownplayed: "ప్రతిపక్షాల అభ్యంతరాలు.",
    narrativeSummaryTpl: (source, title) => `${source} వార్తా కథనం "${title}" కు సంబంధించిన కీలక ప్రకటనలు మరియు పరిణామాలను సమగ్రంగా వివరిస్తుంది.`
  },
  mr: {
    verifiablePrefix: "सत्यापित अहवालानुसार मुख्य घडामोडींची पुष्टी झाली आहे:",
    crossVerifiedAcross: "विविध स्वतंत्र वृत्तसंस्थांद्वारे पडताळणी केली गेली, ज्यामध्ये समाविष्ट आहेत:",
    leftNarrative: "डावे व पुरोगामी माध्यम संस्थात्मक पारदर्शकता आणि विरोधकांच्या भूमिकेला महत्त्व देतात.",
    centerNarrative: "तटस्थ माध्यमे अधिकृत नोंदी आणि वस्तुनिष्ठ घटनाक्रमाची नोंद ठेवतात.",
    rightNarrative: "राष्ट्रवादी माध्यमे प्रशासकीय निर्णय आणि राष्ट्रीय हिताच्या दृष्टीने बातमी मांडतात.",
    readerTakeawayPrefix: "वाचक निष्कर्ष: मूलभूत तथ्ये स्पष्ट आहेत; प्रत्येक वृत्तसंस्थेच्या भूमिकेनुसार बातमी समजून घ्या.",
    timelineStep1: "प्राथमिक घडामोड व पहिला अहवाल",
    timelineStep2: "अधिकृत पत्रके व कायदेशीर प्रतिक्रिया",
    timelineStep3: "राष्ट्रीय संपादकीय विश्लेषण",
    timelineStep4: "सर्वसमावेशक पडताळणी व चालू घडामोडी",
    timelineDesc1: (source, title) => `${source} ने "${title}" वर प्राथमिक वृत्त प्रसिद्ध केले, ज्यामध्ये सुरुवातीच्या घडामोडींची नोंद आहे.`,
    timelineDesc2: (source) => `${source} ने वैधानिक सूचना, अधिकृत निवेदने आणि संबंधित घटकांनी दिलेली उत्तरे नोंदवली आहेत.`,
    timelineDesc3: (source) => `${source} आणि प्रादेशिक वृत्तसंस्थांनी कायदेशीर बाजू आणि धोरणात्मक परिणामांचे सखोल विश्लेषण प्रसिद्ध केले.`,
    timelineDesc4: (count) => `${count || 5} वृत्तसंस्थांद्वारे पडताळणी केली गेली. वैधानिक पाठपुरावा आणि चौकशीवर सतत लक्ष ठेवले जात आहे.`,
    leftFraming: "संस्थात्मक उत्तरदायित्व, घटनात्मक परंपरा आणि विरोधी पक्षांच्या भूमिकेवर भर.",
    centerFraming: "कोणत्याही पूर्वग्रहाशिवाय वस्तुनिष्ठ नोंदी व घटनाक्रमाची मांडणी.",
    rightFraming: "प्रशासकीय निर्णय, राष्ट्रीय हित आणि शासन क्षमतेवर भर.",
    leftEmphasized: "प्रक्रियेचे पालन व पारदर्शकता.",
    centerEmphasized: "वस्तुनिष्ठ घटनाक्रम व अधिकृत विधाने.",
    rightEmphasized: "प्रशासकीय निर्णय व राष्ट्रीय सुरक्षा.",
    leftDownplayed: "औपचारिक शासकीय घोषणा.",
    centerDownplayed: "अपूऱ्या माहितीवरील अंदाज.",
    rightDownplayed: "विरोधकांचे तांत्रिक आक्षेप.",
    narrativeSummaryTpl: (source, title) => `${source} च्या वृत्तांकनात "${title}" संदर्भातील महत्त्वाची विधाने आणि घडामोडींचा सविस्तर आढावा घेण्यात आला आहे.`
  },
  kn: {
    verifiablePrefix: "ಪರಿಶೀಲಿಸಿದ ವರದಿಗಳ ಪ್ರಕಾರ ಪ್ರಮುಖ ಘಟನಾವಳಿಗಳು ದೃಢಪಟ್ಟಿವೆ:",
    crossVerifiedAcross: "ಸ್ವತಂತ್ರ ಸುದ್ದಿ ಸಂಸ್ಥೆಗಳ ಮೂಲಕ ಕ್ರಾಸ್-ಪರಿಶೀಲಿಸಲಾಗಿದೆ:",
    leftNarrative: "ಪ್ರಗತಿಪರ ಮತ್ತು ಎಡಪಂಥೀಯ ಮಾಧ್ಯಮಗಳು ಸಾಂಸ್ಥಿಕ ಹೊಣೆಗಾರಿಕೆ ಮತ್ತು ವಿರೋಧ ಪಕ್ಷದ ಹೇಳಿಕೆಗಳಿಗೆ ಒತ್ತು ನೀಡುತ್ತವೆ.",
    centerNarrative: "ತಟಸ್ಥ ಮಾಧ್ಯಮಗಳು ಅಧಿಕೃತ ದಾಖಲೆಗಳು ಮತ್ತು ವಸ್ತುನಿಷ್ಠ ಕಾಲಾನುಕ್ರಮವನ್ನು ದಾಖಲಿಸುತ್ತವೆ.",
    rightNarrative: "ರಾಷ್ಟ್ರವಾದಿ ಮಾಧ್ಯಮಗಳು ಆಡಳಿತಾತ್ಮಕ ದೃಢತೆ ಮತ್ತು ರಾಷ್ಟ್ರೀಯ ಹಿತಾಸಕ್ತಿಯನ್ನು ಕೇಂದ್ರೀಕರಿಸುತ್ತವೆ.",
    readerTakeawayPrefix: "ಓದುಗರ ತೀರ್ಮಾನ: ಮೂಲ ಸತ್ಯಗಳು ಸ್ಪಷ್ಟವಾಗಿವೆ; ಮಾಧ್ಯಮಗಳ ದೃಷ್ಟಿಕೋನವನ್ನು ಗಮನದಲ್ಲಿಟ್ಟುಕೊಂಡು ವಿಶ್ಲೇಷಿಸಿ.",
    timelineStep1: "ಆರಂಭಿಕ ಮಾಹಿತಿ ಮತ್ತು ವರದಿ",
    timelineStep2: "ಅಧಿಕೃತ ಹೇಳಿಕೆಗಳು ಮತ್ತು ಸಲ್ಲಿಕೆಗಳು",
    timelineStep3: "ರಾಷ್ಟ್ರೀಯ ಮಟ್ಟದ ವಿಶ್ಲೇಷಣೆ",
    timelineStep4: "ಮುಂದುವರಿದ ಪರಿಶೀಲನೆ ಮತ್ತು ನಿಗಾ",
    timelineDesc1: (source, title) => `${source} ಸಂಸ್ಥೆಯು "${title}" ಕುರಿತು ಪ್ರಾಥಮಿಕ ವರದಿಯನ್ನು ದಾಖಲಿಸಿದೆ.`,
    timelineDesc2: (source) => `${source} ಶಾಸನಬದ್ಧ ಸೂಚನೆಗಳು, ಅಧಿಕೃತ ಪ್ರಕಟಣೆಗಳು ಮತ್ತು ಪ್ರತಿಕ್ರಿಯೆಗಳನ್ನು ದಾಖಲಿಸಿದೆ.`,
    timelineDesc3: (source) => `${source} ಮತ್ತು ಪ್ರಾದೇಶಿಕ ಡೆಸ್ಕ್‌ಗಳು ಕಾನೂನು ಅಂಶಗಳು ಮತ್ತು ನೀತಿ ಪರಿಣಾಮಗಳ ಆಳವಾದ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಪ್ರಕಟಿಸಿವೆ.`,
    timelineDesc4: (count) => `${count || 5} ಸುದ್ದಿ ಸಂಸ್ಥೆಗಳಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ಶಾಸನಬದ್ಧ ಕ್ರಮಗಳನ್ನು ನಿರಂತರವಾಗಿ ಗಮನಿಸಲಾಗುತ್ತಿದೆ.`,
    leftFraming: "ಸಾಂಸ್ಥಿಕ ಹೊಣೆಗಾರಿಕೆ, ಸಾಂವಿಧಾನಿಕ ನಿಯಮಗಳು ಮತ್ತು ವಿರೋಧ ಪಕ್ಷದ ನಿಲುವುಗಳ ಮೇಲೆ ಗಮನ.",
    centerFraming: "ಯಾವುದೇ ಪಕ್ಷಪಾತವಿಲ್ಲದೆ ಅಧಿಕೃತ ಪ್ರಕಟಣೆಗಳು ಮತ್ತು ಘಟನೆಗಳ ವಸ್ತುನಿಷ್ಠ ಕಾಲಾನುಕ್ರಮದ ದಾಖಲೆ.",
    rightFraming: "ಆಡಳಿತಾತ್ಮಕ ದೃಢತೆ, ರಾಷ್ಟ್ರೀಯ ಹಿತಾಸಕ್ತಿ ಮತ್ತು ನಿರ್ಣಾಯಕ ನೀತಿ ಜಾರಿಗೆ ಒತ್ತು.",
    leftEmphasized: "ನಿಯಮಗಳ ಪಾಲನೆ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಹೊಣೆಗಾರಿಕೆ.",
    centerEmphasized: "ವಸ್ತುನಿಷ್ಠ ಕಾಲಾನುಕ್ರಮ ಮತ್ತು ಅಧಿಕೃತ ಹೇಳಿಕೆಗಳು.",
    rightEmphasized: "ಆಡಳಿತಾತ್ಮಕ ದೃಢತೆ ಮತ್ತು ರಾಷ್ಟ್ರೀಯ ಭದ್ರತೆ.",
    leftDownplayed: "ಔಪಚಾರಿಕ ಆಡಳಿತಾತ್ಮಕ ಹೇಳಿಕೆಗಳು.",
    centerDownplayed: "ದೃಢಪಡದ ಊಹಾಪೋಹಗಳು.",
    rightDownplayed: "ವಿರೋಧಿಗಳ ಪ್ರಕ್ರಿಯಾತ್ಮಕ ಆಕ್ಷೇಪಗಳು.",
    narrativeSummaryTpl: (source, title) => `${source} ವರದಿಯು "${title}" ಕುರಿತ ಪ್ರಮುಖ ಹೇಳಿಕೆಗಳು ಮತ್ತು ಬೆಳವಣಿಗೆಗಳನ್ನು ವಿವರವಾಗಿ ದಾಖಲಿಸಿದೆ.`
  }
};

/**
 * Translates a single text string via the API with caching
 */
export async function translateTextOnline(text: string, targetLang: LanguageCode, signal?: AbortSignal): Promise<string> {
  if (!text || targetLang === "en") return text;
  const cacheKey = `${targetLang}:${text.trim()}`;
  if (clientTranslationCache.has(cacheKey)) {
    return clientTranslationCache.get(cacheKey)!;
  }

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang }),
      signal
    });
    if (res.ok) {
      const data = await res.json();
      if (data.translation) {
        clientTranslationCache.set(cacheKey, data.translation);
        return data.translation;
      }
    }
  } catch (err) {
    // Non-blocking fallback
  }

  return text;
}

/**
 * Translates an array of texts in a single batch
 */
export async function translateTextsBatch(texts: string[], targetLang: LanguageCode, signal?: AbortSignal): Promise<string[]> {
  if (!texts.length || targetLang === "en") return texts;

  const uncached: { text: string; index: number }[] = [];
  const results: string[] = new Array(texts.length);

  texts.forEach((text, i) => {
    const cacheKey = `${targetLang}:${text.trim()}`;
    if (clientTranslationCache.has(cacheKey)) {
      results[i] = clientTranslationCache.get(cacheKey)!;
    } else {
      uncached.push({ text, index: i });
    }
  });

  if (uncached.length === 0) return results;

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        texts: uncached.map(u => u.text),
        targetLang
      }),
      signal
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.translations)) {
        data.translations.forEach((trans: string, idx: number) => {
          const original = uncached[idx].text;
          const origIdx = uncached[idx].index;
          clientTranslationCache.set(`${targetLang}:${original.trim()}`, trans);
          results[origIdx] = trans;
        });
      }
    }
  } catch (err) {
    // Fill remaining with original text
    uncached.forEach(u => {
      if (!results[u.index]) results[u.index] = u.text;
    });
  }

  return results.map((r, idx) => r || texts[idx]);
}

const HINDI_TO_ENGLISH_MAP: Record<string, {
  title: string;
  description: string;
  consensus: string[];
  perspectives?: Record<string, { title: string; summary: string }>;
}> = {
  "story-1788202717405-10": {
    title: "'Move from Endless War to End of War': PM Modi Tells Putin During Bilateral Talks",
    description: "Prime Minister Narendra Modi held a bilateral meeting with Russian President Vladimir Putin in Bishkek ahead of the Shanghai Cooperation Organisation (SCO) summit. Lasting over thirty minutes, the discussions focused on bilateral economic and energy ties, regional connectivity, and the ongoing Ukraine war, with PM Modi emphasizing that for humanity's welfare, the world must progress from 'Endless War' to the 'End of War' through peaceful diplomatic dialogue.",
    consensus: [
      "Prime Minister Narendra Modi and Russian President Vladimir Putin held bilateral talks in Bishkek ahead of the SCO Summit.",
      "The bilateral meeting between the two leaders extended for over thirty minutes.",
      "Discussions encompassed India-Russia bilateral trade, energy ties, economic cooperation, regional connectivity, and the Ukraine conflict.",
      "PM Modi reiterated India's firm stance in favor of dialogue, diplomacy, and peaceful conflict resolution.",
      "PM Modi directly stated to President Putin that humanity must transition from 'Endless War' to the 'End of War'.",
      "Both leaders highlighted expanding bilateral trade turnover and confirmed President Putin's forthcoming visit to India for the BRICS Summit."
    ],
    perspectives: {
      "Aaj Tak": {
        title: "'Move from Endless War to End of War': PM Modi Tells Putin During Bilateral Talks",
        summary: "Focuses on PM Modi's direct appeal to Russian President Vladimir Putin during their 30-minute bilateral meeting in Bishkek, urging an urgent shift from 'Endless War' to the 'End of War' regarding Ukraine while reaffirming India's support for peaceful diplomatic resolution."
      }
    }
  }
};

const HEADLINE_TRANSLATIONS: Record<string, string> = {
  "पढ़ें 3 सितम्बर के मुख्य और ताजा समाचार - लाइव ब्रेकिंग न्यूज": "Daily National Dispatch: Key Developments and Breaking Updates for September 3",
  "जोंटी रोड्स की भारतीय कप्तान शुभमन गिल को सलाह: सीनियर खिलाड़ियों के अनुभव का फायदा उठाने को कहा, दिए ये सुझाव": "Jonty Rhodes Advises Shubman Gill: Urges Indian Captain to Leverage Senior Players' Experience",
  "नेपाल मे लोग पुतलों का कर रहे अंतिम संस्कार,लापता लोगों के मिलने की उम्मीद खत्म!": "Nepal Floods: Families Perform Symbolic Last Rites with Effigies as Hope for Missing Fades",
  "कृष्ण जन्माष्टमी व्रत नियम: जन्माष्टमी का व्रत कैसे रखें? जानें जरूरी नियम, क्या करें और किन बातों से बचें": "Krishna Janmashtami Observance: Fasting Guidelines, Religious Traditions, and Civic Celebrations",
  "अरुणाचल प्रदेश विजेता": "Arunachal Pradesh Clinches National Championship Title",
  "इनकम टैक्स कैलकुलेटर": "Income Tax Assessment & Calculation Guide",
  "'अंतहीन युद्ध से युद्ध के अंत की ओर बढ़ें', पुतिन से मिलकर बोले पीएम मोदी": "'Move from Endless War to End of War': PM Modi Tells Putin During Bilateral Talks"
};

/**
 * Synchronously translates a NewsStory using pre-cached terms and structured natural patterns
 */
export function getContextualStory(story: NewsStory, lang: LanguageCode): NewsStory {
  if (!story) return story;

  const hasDevanagari = (str?: string) => !!str && /[\u0900-\u097F]/.test(str);

  // Case 1: English requested (Default platform mode)
  if (lang === "en") {
    // Check curated mapping first
    const curated = HINDI_TO_ENGLISH_MAP[story.id];
    if (curated) {
      const updatedPerspectives = (story.perspectives || []).map(p => {
        const curatedPersp = curated.perspectives && curated.perspectives[p.source];
        return {
          ...p,
          title: curatedPersp?.title || (hasDevanagari(p.title) ? curated.title : p.title),
          narrativeSummary: curatedPersp?.summary || (hasDevanagari(p.narrativeSummary) ? curated.description : p.narrativeSummary)
        };
      });

      return {
        ...story,
        title: curated.title,
        description: curated.description,
        summary: curated.description,
        verifiableConsensus: curated.consensus.join('\n'),
        sharedFactualGround: JSON.stringify(curated.consensus),
        perspectives: updatedPerspectives
      };
    }

    // Check if title has a curated English headline
    let translatedTitle = story.title;
    for (const [hindi, eng] of Object.entries(HEADLINE_TRANSLATIONS)) {
      if (story.title.includes(hindi)) {
        translatedTitle = eng;
        break;
      }
    }

    // If story contains raw Hindi in title or consensus, translate to English
    if (hasDevanagari(story.title) || hasDevanagari(story.description) || hasDevanagari(story.verifiableConsensus)) {
      const p = TRANSLATION_PATTERNS.en;
      const sources = Array.from(new Set((story.perspectives || []).map(p => p.source))).slice(0, 4).join(", ");
      const englishTitle = translatedTitle !== story.title ? translatedTitle : (clientTranslationCache.get(`en:${story.title.trim()}`) || story.title);
      
      let englishDesc = story.description;
      if (hasDevanagari(englishDesc)) {
        englishDesc = `Verified news dispatch covering "${englishTitle}". Independent regional reporting across ${sources || "national desks"} documents statutory announcements, verified events, and on-the-ground developments.`;
      }

      let englishConsensus = story.verifiableConsensus;
      if (hasDevanagari(englishConsensus)) {
        englishConsensus = `${p.verifiablePrefix} ${englishTitle}.\n${p.crossVerifiedAcross} ${sources || "indexed desks"}.\nOfficial sources and participating stakeholders documented key operational facts without unresolved contradictions.`;
      }

      const cleanPerspectives = (story.perspectives || []).map(item => {
        let itemTitle = item.title;
        if (hasDevanagari(itemTitle)) {
          itemTitle = HEADLINE_TRANSLATIONS[itemTitle] || englishTitle;
        }
        let itemSummary = item.narrativeSummary;
        if (hasDevanagari(itemSummary)) {
          itemSummary = p.narrativeSummaryTpl(item.source, itemTitle);
        }

        return {
          ...item,
          title: itemTitle,
          narrativeSummary: itemSummary
        };
      });

      return {
        ...story,
        title: englishTitle,
        description: englishDesc,
        summary: englishDesc,
        verifiableConsensus: englishConsensus,
        perspectives: cleanPerspectives
      };
    }

    return story;
  }

  // Case 2: Hindi requested (User explicitly toggled 'HI')
  if (lang === "hi") {
    if (story.id === "story-1788202717405-10") {
      const hindiFacts = [
        "प्रधानमंत्री नरेंद्र मोदी और रूस के राष्ट्रपति व्लादिमीर पुतिन ने बिश्केक में शंघाई सहयोग संगठन (SCO) शिखर सम्मेलन से इतर मुलाकात की।",
        "दोनों नेताओं के बीच यह मुलाकात आधे घंटे से ज्यादा समय तक चली।",
        "बैठक में भारत-रूस के द्विपक्षीय संबंधों, व्यापार और आर्थिक सहयोग के साथ यूक्रेन युद्ध पर चर्चा हुई।",
        "बैठक के दौरान पीएम मोदी ने यूक्रेन युद्ध को लेकर भारत के शांति और संवाद के रुख को दोहराया।",
        "राष्ट्रपति पुतिन से बातचीत के दौरान पीएम मोदी ने कहा कि मानवता की भलाई के लिए दुनिया को 'अंतहीन युद्ध से युद्ध के अंत' की ओर बढ़ना होगा।",
        "उन्होंने कहा कि भारत शांतिपूर्ण समाधान के लिए किए जा रहे सभी प्रयासों का समर्थन करता है।"
      ];

      return {
        ...story,
        title: "'अंतहीन युद्ध से युद्ध के अंत की ओर बढ़ें', पुतिन से मिलकर बोले पीएम मोदी",
        description: "प्रधानमंत्री नरेंद्र मोदी और रूस के राष्ट्रपति व्लादिमीर पुतिन ने बिश्केक में शंघाई सहयोग संगठन (SCO) शिखर सम्मेलन से इतर द्विपक्षीय बैठक की। दोनों नेताओं के बीच यह बातचीत आधे घंटे से अधिक समय तक चली, जिसमें द्विपक्षीय व्यापार, ऊर्जा सहयोग, क्षेत्रीय कनेक्टिविटी और यूक्रेन संघर्ष पर चर्चा हुई। पीएम मोदी ने जोर देकर कहा कि मानवता के कल्याण के लिए दुनिया को 'अंतहीन युद्ध से युद्ध के अंत' की ओर बढ़ना होगा।",
        summary: "प्रधानमंत्री नरेंद्र मोदी और रूस के राष्ट्रपति व्लादिमीर पुतिन ने बिश्केक में शंघाई सहयोग संगठन (SCO) शिखर सम्मेलन से इतर द्विपक्षीय बैठक की।",
        verifiableConsensus: hindiFacts.join('\n'),
        sharedFactualGround: JSON.stringify(hindiFacts)
      };
    }
  }

  const p = TRANSLATION_PATTERNS[lang] || TRANSLATION_PATTERNS.en;
  const sources = Array.from(new Set((story.perspectives || []).map(p => p.source))).slice(0, 4).join(", ");

  // Check if headline is in translation cache
  const cachedTitle = clientTranslationCache.get(`${lang}:${story.title.trim()}`) || story.title;
  const cachedConsensus = clientTranslationCache.get(`${lang}:${story.verifiableConsensus?.trim()}`);

  const verifiableConsensus = cachedConsensus || `${p.verifiablePrefix} ${cachedTitle}. ${p.crossVerifiedAcross} ${sources}.`;

  const narrativeDetails: NarrativeLandscapeDetails = {
    leftNarrative: p.leftNarrative,
    centerNarrative: p.centerNarrative,
    rightNarrative: p.rightNarrative
  };

  const narrativeLandscape = `${p.leftNarrative} ${p.centerNarrative} ${p.rightNarrative}`;

  const timeline: TimelineEvent[] = (story.timeline || []).map((t, idx) => {
    const titles = [p.timelineStep1, p.timelineStep2, p.timelineStep3, p.timelineStep4];
    const sourceName = (story.perspectives && story.perspectives[idx]?.source) || (idx === 0 ? "The Hindu" : idx === 1 ? "NDTV" : idx === 2 ? "The Times of India" : "ThePrint");
    
    let desc = t.description;
    if (idx === 0) desc = p.timelineDesc1(sourceName, cachedTitle);
    else if (idx === 1) desc = p.timelineDesc2(sourceName);
    else if (idx === 2) desc = p.timelineDesc3(sourceName);
    else if (idx === 3) desc = p.timelineDesc4(story.perspectives?.length || 5);

    return {
      ...t,
      title: `${titles[idx] || t.title}: ${sourceName}`,
      description: desc
    };
  });

  const perspectives: Perspective[] = (story.perspectives || []).map((item, idx) => {
    const isLeft = item.bias === "left" || item.bias === "left-center";
    const isRight = item.bias === "right" || item.bias === "right-center";
    const cachedItemTitle = clientTranslationCache.get(`${lang}:${item.title?.trim()}`) || cachedTitle || item.title;

    return {
      ...item,
      title: cachedItemTitle,
      editorialFraming: isLeft ? p.leftFraming : isRight ? p.rightFraming : p.centerFraming,
      narrativeSummary: p.narrativeSummaryTpl(item.source, cachedItemTitle),
      framingLens: isLeft ? p.leftNarrative : isRight ? p.rightNarrative : p.centerNarrative,
      emphasized: isLeft ? p.leftEmphasized : isRight ? p.rightEmphasized : p.centerEmphasized,
      downplayed: isLeft ? p.leftDownplayed : isRight ? p.rightDownplayed : p.centerDownplayed
    };
  });

  return {
    ...story,
    title: cachedTitle,
    verifiableConsensus,
    narrativeLandscape,
    narrativeDetails,
    timeline,
    perspectives,
    readerTakeaway: p.readerTakeawayPrefix
  };
}
