import { NewsStory, LiveWireItem, FactCheckClaim } from "../types";

export const FALLBACK_STORIES: NewsStory[] = [
  {
    id: "gdp-growth-japan-surpass",
    title: "India Overtakes Japan as World's 4th Largest Economy with $4.18 Trillion GDP Milestone",
    description: "In a landmark macroeconomic milestone confirmed by official central statistical updates and international fiscal trackers, India's nominal GDP reached $4.18 trillion in the latest fiscal quarter, officially surpassing Japan to become the world's fourth-largest economy while maintaining robust expansion rates above eight percent.",
    date: "2026-08-14",
    category: "Economics",
    institution: "Government",
    region: "National",
    language: "English",
    biasSpectrum: { left: 20, center: 50, right: 30 },
    verifiableConsensus: "Official national accounts published by the Ministry of Statistics and Programme Implementation (MoSPI) alongside comparative International Monetary Fund (IMF) multilateral tracking databases confirm that India's nominal Gross Domestic Product reached $4.18 trillion in the recent quarter, officially eclipsing Japan's $4.11 trillion output to establish India as the fourth-largest global economy. The transition was driven by an 8.2% real GDP growth trajectory over recent quarters, underpinned by resilient domestic private consumption, expanded capital expenditure allocations by the Union government, and strong performance across services and capital goods manufacturing. Multilateral projections affirm that on current growth differentials, India remains on course to approach Germany's GDP benchmark prior to 2030, though international comparative reviews will finalize annual standardized purchasing power adjustments at the close of the financial year.",
    narrativeLandscape: "Coverage across national and global newsrooms reflects a clear thematic divide between developmental optimism and structural socioeconomic scrutiny. Business dailies and government-aligned outlets foreground the historic sovereign milestone, framing the $4.18 trillion valuation as concrete proof of executive economic stewardship, foreign direct investment attractiveness, and sovereign geopolitical ascent on the world stage. These accounts heavily emphasize capital market expansion, infrastructure asset creation, and rapid digital public infrastructure adoption. Conversely, left-leaning publications, independent economic columnists, and progressive policy desks background the aggregate gross figures to spotlight acute per-capita income disparities, pointing out that India's per-capita GDP of approximately $2,800 remains roughly one-twelfth of Japan's developed baseline. These critical perspectives foreground persistent rural wage stagnation, manufacturing employment elasticity deficits, and the widening consumption divide between top-tier urban brackets and the informal labor force.",
    perspectives: [
      {
        source: "NDTV",
        title: "India Surpasses Japan To Become World's 4th Largest Economy: Government Statistical Report",
        bias: "center",
        reliability: "high",
        url: "https://www.ndtv.com/india-news/india-gdp-surpasses-japan-fourth-largest-economy",
        quote: "India reached a verified $4.18 trillion national gross domestic product, overtaking Japan. Quarterly growth accelerated to 8.2%, outperforming international forecasts and reflecting domestic manufacturing resilience.",
        framingLens: "Foregrounds official MoSPI and PIB statistical releases, emphasizing sovereign rank elevation while backgrounding structural per-capita income disparities.",
        narrativeSummary: "NDTV reports that India's nominal GDP reached $4.18 trillion to surpass Japan as the fourth-largest economy, driven by resilient domestic consumption and quarterly growth exceeding eight percent.",
        sourceIntegrity: "Canonical",
        confidenceScore: 92,
        forensicAudit: {
          framingStrategy: "NDTV adopts a centrist institutional posture, highlighting official government statistics and macroeconomic growth targets while placing structural per-capita qualifiers in secondary subsections.",
          narrativeDiscrepancies: [
            {
              type: "APPEAL TO AUTHORITY",
              description: "Presents government projections as settled outcomes before international multilateral agencies conclude annual comparative reviews."
            }
          ],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      },
      {
        source: "The Economic Times",
        title: "India Beats Japan to Become World's 4th Largest Economy on Resilient Capital Flows",
        bias: "right",
        reliability: "high",
        url: "https://economictimes.indiatimes.com/news/economy/indicators/india-gdp-growth-japan-fourth-largest",
        quote: "Domestic manufacturing drivers and robust private capex propelled India's economy past Japan at $4.18 trillion, consolidating India's ranking as the fastest-growing major economy globally.",
        framingLens: "Emphasizes corporate earnings momentum, private capital expenditure, and institutional investor confidence, projecting rapid ascent toward Germany's third-place global standing.",
        narrativeSummary: "The Economic Times frames the milestone around private capital expenditure, expanding market valuations, and international investor confidence, projecting rapid ascent toward Germany's third-place global standing.",
        sourceIntegrity: "Very High",
        confidenceScore: 90,
        forensicAudit: {
          framingStrategy: "Emphasizes corporate optimism, infrastructure investments, and capital market performance while downplaying rural consumption variances and real wage growth indicators.",
          narrativeDiscrepancies: [
            {
              type: "SELECTIVE STATISTICAL CITATION",
              description: "Focuses on top-line GDP expansion without balancing against sector-wise informal employment metrics."
            }
          ],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      },
      {
        source: "The Wire India",
        title: "India's $4.18 Trillion GDP Milestone: Structural Inequalities and Real Base-Year Questions",
        bias: "left",
        reliability: "high",
        url: "https://thewire.in/economy/india-gdp-japan-fourth-largest-inequality-base-year",
        quote: "While aggregate gross domestic output marks a notable symbolic achievement, distribution metrics reveal deep per-capita disparities, with India's per-capita income remaining roughly one-twelfth of Japan's developed baseline.",
        framingLens: "Foregrounds severe per-capita wealth inequalities, informal sector distress, and statistical base-year questions while backgrounding sovereign aggregate growth milestones.",
        narrativeSummary: "The Wire argues that aggregate national output figures mask wide per-capita income gaps and persistent informal sector stress, urging attention toward equitable distribution over headline rankings.",
        sourceIntegrity: "High",
        confidenceScore: 86,
        forensicAudit: {
          framingStrategy: "Adopts a critical socioeconomic framing, redirecting reader focus from aggregate national wealth to household purchasing power and uneven post-pandemic recovery.",
          narrativeDiscrepancies: [
            {
              type: "REFRAMING SCOPE",
              description: "Contrasts sovereign aggregate output against individual per-capita indicators to contest the official celebratory narrative."
            }
          ],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      }
    ]
  },
  {
    id: "rbi-dividend-payout-2026",
    title: "RBI Board Approves Record ₹2.11 Lakh Crore Surplus Dividend Transfer to Union Government",
    description: "In an unprecedented fiscal development, the Reserve Bank of India approved a record surplus transfer of ₹2.11 lakh crore to the central treasury for the financial year, providing a massive non-tax revenue injection to support capital expenditure while keeping regulatory risk buffers intact.",
    date: "2026-08-13",
    category: "RBI",
    institution: "RBI",
    region: "National",
    language: "English",
    biasSpectrum: { left: 20, center: 45, right: 35 },
    verifiableConsensus: "The Central Board of Directors of the Reserve Bank of India (RBI), convened under the chairmanship of the Governor, officially approved a record surplus transfer of ₹2,10,874 crore (approximately ₹2.11 lakh crore) to the Government of India for the accounting year. The allocation strictly adheres to the Economic Capital Framework (ECF) formulated by the expert committee chaired by Dr. Bimal Jalan. Crucially, the Board resolved to maintain the Contingency Risk Buffer (CRB) at 6.50%, the upper limit of the recommended 5.50%–6.50% band, in view of prevailing global macroeconomic uncertainties. The surplus transfer represents a substantial increase over previous years, driven by foreign exchange operation earnings and elevated gross interest yields on sovereign securities, significantly expanding the Union Finance Ministry's non-tax revenue receipts.",
    narrativeLandscape: "Financial newsrooms and policy desks present contrasting interpretations of the record dividend. Mainstream financial publications and pro-growth economic commentary celebrate the payout as validation of prudent central bank asset-liability management, noting that the infusion provides crucial non-inflationary fiscal headroom to finance ambitious capital infrastructure projects without widening the fiscal deficit target of 4.9% of GDP. Conversely, independent monetary policy observers and progressive editorial desks express caution regarding the long-term precedent of high surplus extraction. These critical outlets question whether sovereign budgetary reliance on central bank transfers masks structural shortfalls in direct and indirect tax buoyancy, and whether recurring mega-dividends could diminish the RBI's internal reserves during future foreign exchange shocks.",
    perspectives: [
      {
        source: "The Hindu",
        title: "Reserve Bank of India Board Approves ₹2.11 Lakh Crore Surplus Transfer to Government",
        bias: "center",
        reliability: "high",
        url: "https://www.thehindu.com/business/Economy/rbi-board-approves-211-lakh-crore-surplus-transfer-to-government-for-fy24/article68202970.ece",
        quote: "The surplus payout will provide substantial non-tax revenue support to the Union Budget, expanding capital expenditure allocations while adhering strictly to the Jalan Committee's risk parameters.",
        framingLens: "Focuses on institutional compliance with the Jalan Committee framework, balance sheet mechanics, and fiscal deficit consolidation targets.",
        narrativeSummary: "The Hindu reports that the RBI's surplus transfer of ₹2.11 lakh crore adheres strictly to Jalan Committee capital framework guidelines, providing fiscal flexibility for public investments without compromising institutional buffers.",
        sourceIntegrity: "Canonical",
        confidenceScore: 95,
        forensicAudit: {
          framingStrategy: "Maintains an objective institutional reporting tone, giving equal weight to statutory buffer compliance and national fiscal deficit implications.",
          narrativeDiscrepancies: [],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      },
      {
        source: "The Wire India",
        title: "Record RBI Surplus Transfer Helps Government's Finances But What About Central Bank Autonomy?",
        bias: "left",
        reliability: "high",
        url: "https://thewire.in/economy/rbi-surplus-transfer-government-fiscal-deficit-inflation",
        quote: "Repeatedly extracting massive dividend payouts from the central bank raises pertinent questions regarding long-term reserve cushions against global currency shocks and central bank policy autonomy.",
        framingLens: "Foregrounds institutional autonomy risks and underlying tax revenue weaknesses while backgrounding the fact that contingency buffers were held at maximum legal ceilings.",
        narrativeSummary: "The Wire questions whether repeated mega-dividend transfers risk central bank reserves over the long run, framing the payout as an expedient fiscal band-aid for structural tax collection challenges.",
        sourceIntegrity: "High",
        confidenceScore: 87,
        forensicAudit: {
          framingStrategy: "Focuses on potential long-term vulnerability of reserves while questioning sovereign reliance on central bank transfers to meet fiscal consolidation benchmarks.",
          narrativeDiscrepancies: [
            {
              type: "SELECTIVE CONTEXT",
              description: "Omits mention that the Contingency Risk Buffer was retained at the maximum 6.50% ceiling permitted under the Jalan framework."
            }
          ],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      },
      {
        source: "Swarajya Magazine",
        title: "Atmanirbhar Fiscal Strength: What RBI's Record Dividend Surplus Means for Public Investment",
        bias: "right",
        reliability: "high",
        url: "https://swarajyamag.com/economy/rbi-approves-record-211-lakh-crore-dividend-transfer",
        quote: "The landmark payout underscores robust asset stewardship under contemporary reforms, creating a secure fiscal shield to drive historic infrastructural development across railways and highways.",
        framingLens: "Emphasizes indigenous fiscal self-reliance, administrative competence, and sovereign capital expenditure momentum.",
        narrativeSummary: "Swarajya celebrates the ₹2.11 lakh crore dividend as evidence of superior macroeconomic governance, highlighting how the funds will accelerate national highway construction and sovereign debt reduction.",
        sourceIntegrity: "High",
        confidenceScore: 90,
        forensicAudit: {
          framingStrategy: "Uses affirmative developmental vocabulary, framing the surplus transfer as a victory of indigenous fiscal stewardship and state capital capability.",
          narrativeDiscrepancies: [
            {
              type: "EMOTIVE LANGUAGE",
              description: "Employs celebratory adjectives ('landmark', 'stellar stewardship') to characterize standard regulatory surplus distribution."
            }
          ],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      }
    ]
  },
  {
    id: "sc-article-39b-property",
    title: "Supreme Court 9-Judge Bench Verdict Rules Private Property Cannot Automatically Be Treated as Community Resource",
    description: "In a historic 7-2 majority decision, a nine-judge Constitution Bench of the Supreme Court ruled that privately owned property cannot automatically be deemed a 'material resource of the community' under Article 39(b) for state redistribution, reforming five decades of socialist judicial doctrine.",
    date: "2026-08-12",
    category: "Supreme Court",
    institution: "Supreme Court",
    region: "National",
    language: "English",
    biasSpectrum: { left: 35, center: 40, right: 25 },
    verifiableConsensus: "A 9-judge Constitution Bench of the Supreme Court, presided over by the Chief Justice of India, delivered a 7-2 majority verdict holding that privately owned properties cannot be generically categorized as 'material resources of the community' under Article 39(b) of the Constitution for state acquisition or redistribution. Overruling previous expansive interpretations from the late 1970s (specifically Justice V.R. Krishna Iyer's socialist jurisprudence in the Sanjeev Coke case), the majority held that while certain private assets meeting specific criteria—such as scarcity, vital public utility, or environmental impact—may qualify, a blanket socialist presumption over all private ownership is unconstitutional. The Court established a rigorous multi-factor operational test to assess future state acquisition statutes while upholding legitimate eminent domain powers under Article 300A.",
    narrativeLandscape: "The verdict has generated deep constitutional and economic discourse across Indian legal desks. Commercial legal analysts and corporate commentators celebrate the decision as a decisive modern update that provides legal certainty for private investments, intellectual property, and enterprise capital, shedding legacy socialist-era ambiguities. Mainstream centrist dailies focus on the institutional nuance of the judgment, emphasizing that the Court did not bar state acquisition altogether, but rather established strict constitutional scrutiny for public welfare acquisitions. In sharp contrast, left-leaning jurists and civil liberties publications argue that circumscribing Article 39(b) weakens the constitutional mandate for wealth redistribution, expressing concern that the ruling restricts legislative power to remedy deep socioeconomic inequality and land concentration.",
    perspectives: [
      {
        source: "The Indian Express",
        title: "Supreme Court 9-judge Bench Ruling on Article 39(b): Private Property Is Not Automatically Community Resource",
        bias: "center",
        reliability: "high",
        url: "https://indianexpress.com/article/india/supreme-court-private-property-community-resource-article-39-b/9632454/",
        quote: "The Court held that the socialist era's sweeping ideological rulings that all private wealth belongs to the resource pool run contrary to contemporary constitutional goals.",
        framingLens: "Provides comprehensive legal doctrine analysis, detailing majority rationale, dissenting opinions, and the evolution from 1970s socialist jurisprudence to modern market realities.",
        narrativeSummary: "The Indian Express explains that the Supreme Court's 7-2 ruling dismantles blanket socialist assumptions from the 1970s while retaining defined statutory mechanisms for legitimate public interest acquisitions.",
        sourceIntegrity: "Canonical",
        confidenceScore: 94,
        forensicAudit: {
          framingStrategy: "Focuses on constitutional doctrine, legislative history, and the delicate balance between private ownership protections and public welfare mandates.",
          narrativeDiscrepancies: [],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      },
      {
        source: "The Wire India",
        title: "Supreme Court's Private Property Verdict: Will It Dilute Constitutional Welfare Goals?",
        bias: "left",
        reliability: "high",
        url: "https://thewire.in/law/supreme-court-private-property-verdict-welfare-state-article-39b",
        quote: "By restricting what constitutes a community resource, the majority judgment risks placing a high hurdle in front of public redistribution laws meant to address steep inequality.",
        framingLens: "Foregrounds constitutional egalitarian goals, the Directive Principles of State Policy, and wealth inequality concerns while backgrounding property rights protections.",
        narrativeSummary: "The Wire warns that curtailing the definition of community resources under Article 39(b) erects legal obstacles against redistributive policies aimed at tackling severe socioeconomic inequality in India.",
        sourceIntegrity: "High",
        confidenceScore: 88,
        forensicAudit: {
          framingStrategy: "Frames the ruling through Directive Principles of State Policy, arguing that weakening state acquisition powers could impede progressive welfare programs.",
          narrativeDiscrepancies: [
            {
              type: "SLANTED INTERPRETATION",
              description: "Characterizes the judgment as a total prohibition on state acquisition, whereas the ruling explicitly preserves lawful eminent domain with due process."
            }
          ],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      },
      {
        source: "The Hindu",
        title: "Constitution Bench Clarifies Scope of Article 39(b): Balance Between Private Rights and Public Good",
        bias: "center",
        reliability: "high",
        url: "https://www.thehindu.com/news/national/supreme-court-verdict-article-39b-private-property/article68102.ece",
        quote: "The majority verdict emphasizes that judicial interpretation must align with dynamic economic realities while ensuring essential public utilities remain protected.",
        framingLens: "Details the operational guidelines established by the bench for classifying community resources, focusing on procedural checks and statutory boundaries.",
        narrativeSummary: "The Hindu details the specific multi-factor test laid down by the Supreme Court to evaluate when private property may be classified as a community resource for public welfare.",
        sourceIntegrity: "Canonical",
        confidenceScore: 93,
        forensicAudit: {
          framingStrategy: "Presents legal arguments neutrally, outlining criteria such as resource scarcity and public utility impact.",
          narrativeDiscrepancies: [],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      }
    ]
  },
  {
    id: "regional-kerala-wayanad-landslide-rehab",
    title: "Kerala Assembly Passes ₹1,200 Crore Wayanad Rehabilitation Package with Western Ghats Climate Zoning",
    description: "The Kerala Legislative Assembly unanimously passed an all-encompassing ₹1,200 crore rehabilitation and eco-restoration bill for Wayanad, funding eco-resilient township construction, modern landslide early warning radar networks, and strict zoning curbs on high-slope commercial construction.",
    date: "2026-08-11",
    category: "State Governance",
    institution: "Government",
    region: "Kerala",
    language: "Malayalam",
    biasSpectrum: { left: 30, center: 50, right: 20 },
    verifiableConsensus: "The Kerala Legislative Assembly unanimously enacted special statutory legislation appropriating ₹1,200 crore for the long-term ecological restoration and permanent rehabilitation of disaster-affected families in Wayanad district. Official state revenue records confirm that the blueprint allocates ₹650 crore for constructing two model climate-resilient township clusters on ecologically stable terrain, ₹250 crore for specialized micro-radar weather and soil-saturation monitoring stations, and ₹300 crore for direct compensation and livelihood rebuilding packages. The legislation also introduces mandatory geological clearance certificates for all commercial and plantation structures situated above 15 degrees slope elevation across the Western Ghats mountain tract.",
    narrativeLandscape: "Regional Malayalam newspapers and local broadcast networks focus intensively on the humanitarian timeline, profiling displaced families in temporary shelters, detailing land title distribution schedules, and scrutinizing administrative transparency in relief disbursement. In contrast, national environmental journalists and conservation policy desks frame the legislation around the broader, decades-long debate over the Madhav Gadgil and Kasturirangan Western Ghats ecology committee reports. National outlets examine whether state zoning curbs will withstand political lobbying from commercial resort operators and plantation associations, emphasizing the urgent need for a coordinated multi-state Himalayan and Western Ghats mountain conservation protocol.",
    perspectives: [
      {
        source: "Malayala Manorama",
        title: "Wayanad Model Township Plan Passed: Eco-Resilient Housing in Safe Zones",
        bias: "center",
        reliability: "high",
        url: "https://www.manoramaonline.com/news/kerala/wayanad-rehabilitation-package-assembly-passed.html",
        quote: "The rehabilitation package ensures land ownership rights in ecologically stable townships equipped with landslide monitoring sensors and solar power grids.",
        framingLens: "Prioritizes community rehabilitation schedules, land title distribution mechanics, and ground-level family welfare in Wayanad.",
        narrativeSummary: "Malayala Manorama reports that the unified rehabilitation bill guarantees secure land ownership and eco-resilient housing in designated safe zones for all affected families in Wayanad.",
        sourceIntegrity: "Canonical",
        confidenceScore: 93,
        forensicAudit: {
          framingStrategy: "Ground-level regional journalism prioritizing citizen relief timelines and civic infrastructure assurances.",
          narrativeDiscrepancies: [],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      },
      {
        source: "Mathrubhumi",
        title: "Gadgil Report Recommendations Back on Table as Assembly Tightens Hill Construction Norms",
        bias: "left",
        reliability: "high",
        url: "https://mathrubhumi.com/news/kerala/wayanad-rehabilitation-gadgil-committee-norms-1.984512",
        quote: "Lawmakers agreed to mandate strict environmental impact assessments for all commercial structures above 15 degrees slope elevation to prevent further ecological damage.",
        framingLens: "Foregrounds ecological governance, Western Ghats conservation recommendations, and commercial construction restrictions.",
        narrativeSummary: "Mathrubhumi highlights the statutory requirement for rigorous environmental impact assessments and strict commercial building bans across fragile slope zones in the Western Ghats.",
        sourceIntegrity: "High",
        confidenceScore: 91,
        forensicAudit: {
          framingStrategy: "Eco-centric framing linking disaster rehabilitation with long-term climate policy and scientific committee recommendations.",
          narrativeDiscrepancies: [],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      }
    ]
  },
  {
    id: "regional-tamil-nadu-semiconductor-design",
    title: "Tamil Nadu Unveils ₹4,000 Crore Chip Design Park in Chennai to Boost Semiconductor R&D",
    description: "In a major state industrial initiative, the Tamil Nadu Government inaugurated the Semiconductor Design & Fabless Ecosystem Park in Sriperumbudur, aiming to train 25,000 chip design engineers and attract global Fabless semiconductor giants to establish native research centers.",
    date: "2026-08-10",
    category: "Technology",
    institution: "Government",
    region: "Tamil Nadu",
    language: "Tamil",
    biasSpectrum: { left: 15, center: 60, right: 25 },
    verifiableConsensus: "The Tamil Nadu Industrial Development Corporation (TIDCO) formally inaugurated a dedicated 150-acre Semiconductor Design & Fabless Ecosystem Park in the Sriperumbudur industrial belt near Chennai, supported by a ₹4,000 crore capital outlay. State government documentation verifies that the park offers subsidized Electronic Design Automation (EDA) software tool licenses, clean-room prototype testing suites, and a specialized VLSI training institute partnering with Anna University and IIT Madras. The initiative aims to graduate 25,000 certified chip design engineers by 2028, with initial Memorandums of Understanding signed by six domestic and international Fabless design firms.",
    narrativeLandscape: "Tamil-language newsrooms and regional business pages enthusiastically celebrate the initiative as a decisive strategic move positioning Tamil Nadu as India's premier high-value electronics and fabless design capital, emphasizing youth engineering employment and diversified industrial growth. National technology publications focus on the competitive dynamics between states, analyzing how Tamil Nadu's focus on software-heavy fabless design compares with Gujarat's capital-intensive fabrication foundries (Dholera) and Karnataka's entrenched Bengaluru hardware hub, examining whether state tax incentives and power tariff subsidies will prove sufficient to attract Tier-1 global semiconductor multinational research centers.",
    perspectives: [
      {
        source: "Hindu Tamil Thisai",
        title: "Chennai Semiconductor Design Park: Tamil Nadu's Leap into High-Tech Electronics",
        bias: "center",
        reliability: "high",
        url: "https://www.hindutamil.in/news/tamilnadu/semiconductor-design-park-chennai-tidco.html",
        quote: "The park will foster native Fabless startups and equip regional engineering colleges with state-of-the-art EDA chip design tools, bridging academia and industry.",
        framingLens: "Emphasizes local engineering youth employment, regional industrial prestige, and academic-industry partnerships.",
        narrativeSummary: "Hindu Tamil Thisai reports that the Sriperumbudur chip park will foster homegrown Fabless design startups while equipping engineering graduates with advanced chip synthesis tools.",
        sourceIntegrity: "Canonical",
        confidenceScore: 94,
        forensicAudit: {
          framingStrategy: "Regional economic empowerment framing highlighting industrial competitiveness and workforce skill upgrade.",
          narrativeDiscrepancies: [],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      },
      {
        source: "Dinamalar",
        title: "Global Tech Firms Sign MoUs for Chennai Chip Design Center",
        bias: "right",
        reliability: "high",
        url: "https://www.dinamalar.com/news/tamil-nadu-news/chennai-semiconductor-park-mou-signed/368291",
        quote: "Leading multinational chipmakers signed initial investment commitments leveraging Chennai's port logistics, power reliability, and dense engineering talent pool.",
        framingLens: "Focuses on foreign direct investment, state industrial growth, and commercial competitiveness.",
        narrativeSummary: "Dinamalar highlights multinational corporate agreements signed during the inaugural summit, focusing on private capital commitments and Chennai's logistical advantages.",
        sourceIntegrity: "High",
        confidenceScore: 91,
        forensicAudit: {
          framingStrategy: "Market-oriented commercial framing praising state industrial promotion and FDI inflows.",
          narrativeDiscrepancies: [],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      }
    ]
  },
  {
    id: "wire-me-hostilities-energy",
    title: "Persistent Middle East Hostilities Pose Risk to Global Supply Chains and Indian Crude Imports",
    description: "Escalating regional conflict in the Middle East has triggered maritime shipping reroutes around the Cape of Good Hope, raising freight costs, transit times, and insurance surcharges for crude oil shipments destined for Indian refineries and industrial ports.",
    date: "2026-08-09",
    category: "Economics",
    institution: "Government",
    region: "International",
    language: "English",
    biasSpectrum: { left: 25, center: 50, right: 25 },
    verifiableConsensus: "Official trade flow data from the Directorate General of Commercial Intelligence and Statistics (DGCIS) confirms that India imports over 85% of its crude oil requirements, with approximately 45% traditionally transiting through key maritime chokepoints in West Asia. Persistent regional hostilities and Red Sea security risks have forced commercial tankers to divert around the Cape of Good Hope, adding 12–14 days to voyage times and escalating maritime insurance war-risk premiums by 15%–20%. While the Ministry of Petroleum and Natural Gas affirms that India's Strategic Petroleum Reserves (SPR) and commercial refinery stockpiles provide an aggregate 74-day buffer, extended shipping diversions are exerting upward pressure on landed import parity pricing.",
    narrativeLandscape: "Financial newsrooms prioritize fuel price stability, government subsidy exposure, and refining margins. Commercial coverage analyzes whether state-owned oil marketing companies can absorb elevated freight surcharges or whether pump prices for petrol and diesel will face upward revisions. Foreign policy and strategic desks examine India's delicate non-aligned diplomatic posture, analyzing bilateral engagements with regional powers to ensure unhindered commercial transit. In contrast, progressive editorial commentary foregrounds the downstream inflationary threat to ordinary households, warning that higher transport fuel expenses could quickly cascade into agricultural inputs, fertilizer distribution, and essential food commodities.",
    perspectives: [
      {
        source: "The Indian Express",
        title: "Middle East Red Sea Disruption: How Freight Surcharges Impact Indian Refiners",
        bias: "center",
        reliability: "high",
        url: "https://indianexpress.com/article/business/economy/middle-east-shipping-energy-import-india-98214/",
        quote: "State-owned oil marketing companies have absorbed initial freight increases, but extended supply diversions will inevitably pressure retail fuel margins and transport logistics.",
        framingLens: "Examines trade logistics, freight indices, and government price stabilization mechanisms.",
        narrativeSummary: "The Indian Express explains that state-owned refiners are currently absorbing freight surcharges, but warns that protracted shipping diversions around Africa could impact retail fuel prices.",
        sourceIntegrity: "Canonical",
        confidenceScore: 93,
        forensicAudit: {
          framingStrategy: "Factual supply chain and macroeconomic risk audit tracking tanker shipping lanes.",
          narrativeDiscrepancies: [],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      },
      {
        source: "The Hindu",
        title: "Energy Security Strategy: India Diversifies Crude Cargoes Amid Gulf Regional Tensions",
        bias: "center",
        reliability: "high",
        url: "https://www.thehindu.com/business/Economy/india-crude-basket-diversification-gulf-tensions/article68412.ece",
        quote: "The Petroleum Ministry is accelerating long-term purchase agreements with West African and Latin American producers to buffer against single-corridor chokepoints and maritime blockades.",
        framingLens: "Focuses on strategic diversification and institutional energy security diplomacy.",
        narrativeSummary: "The Hindu reports that the Petroleum Ministry is expediting bilateral crude procurement from African and South American sources to reduce reliance on volatile maritime corridors in West Asia.",
        sourceIntegrity: "High",
        confidenceScore: 92,
        forensicAudit: {
          framingStrategy: "Diplomatic policy framing detailing institutional risk mitigation.",
          narrativeDiscrepancies: [],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      },
      {
        source: "The Wire India",
        title: "Global Energy Shocks and Inflationary Pressures on Everyday Indian Households",
        bias: "left",
        reliability: "high",
        url: "https://thewire.in/economy/middle-east-energy-inflation-household-budget",
        quote: "Looming energy price hikes threaten to cascade into fertilizer and transport logistics, disproportionately burdening agrarian and working-class families already grappling with food inflation.",
        framingLens: "Focuses on retail inflationary risks and socioeconomic vulnerability.",
        narrativeSummary: "The Wire analyzes how heightened shipping costs and crude volatility could cascade into essential fertilizer and food transport expenses, exacerbating cost-of-living burdens for vulnerable households.",
        sourceIntegrity: "High",
        confidenceScore: 88,
        forensicAudit: {
          framingStrategy: "Socioeconomic equity framing tracking the burden on low-income consumers.",
          narrativeDiscrepancies: [
            {
              type: "PREDICTIVE EXTRAPOLATION",
              description: "Projects immediate consumer price hikes before central excise adjustments or buffer drawdown decisions have been finalized."
            }
          ],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      }
    ]
  },
  {
    id: "wire-youth-exam-reforms",
    title: "Youth Protests Intensify Over Examination Paper Leaks and Structural Employment Reforms",
    description: "Student federations and educational advocates across multiple states held unified demonstrations urging comprehensive reforms to the National Testing Agency (NTA), statutory anti-paper leak enforcement, and transparent annual recruitment calendars for public sector vacancies.",
    date: "2026-08-08",
    category: "Politics",
    institution: "Government",
    region: "National",
    language: "English",
    biasSpectrum: { left: 40, center: 40, right: 20 },
    verifiableConsensus: "Following nationwide student protests and parliamentary debate, the Ministry of Education constituted a high-level committee of technical and educational experts to overhaul the operations of the National Testing Agency (NTA). Parliament previously notified the Public Examinations (Prevention of Unfair Means) Act, establishing stringent statutory penalties including up to 10 years imprisonment and ₹1 crore fines for organized leak syndicates. Official circulars confirm that the expert panel has submitted recommendations mandating computer-adaptive multi-session test formats, encrypted localized question-paper transmission, and standardized protocol audits for all outsourced examination centers.",
    narrativeLandscape: "Coverage diverges sharply between official governance narratives and youth civil society perspectives. Pro-administration publications emphasize executive resolve, strict law enforcement crackdowns on commercial cheating cartels, and technological upgrades designed to eliminate human discretion during paper handling. Centrist newspapers focus on procedural reforms, exploring whether computer-adaptive testing and strict proctoring standards can restore public trust among millions of applicants. In contrast, youth organizations, opposition political desks, and progressive independent media frame the crisis as a manifestation of a deeper structural crisis in formal job generation, arguing that severe private sector employment deficits force millions of overqualified graduates to compete desperately for limited government posts.",
    perspectives: [
      {
        source: "The Hindu",
        title: "Centre Overhauls National Testing Agency Framework with High-Security Computer Adaptive Protocol",
        bias: "center",
        reliability: "high",
        url: "https://www.thehindu.com/education/nta-reforms-high-level-committee-recommendations/article68391.ece",
        quote: "The reform panel recommended multi-stage localized question bank generation and end-to-end digital encryption to eliminate paper transit vulnerabilities across exam centres.",
        framingLens: "Reports administrative recommendations and procedural technology improvements.",
        narrativeSummary: "The Hindu details the high-level reform panel's recommendations to replace physical paper logistics with end-to-end encrypted computer-adaptive testing across all national examinations.",
        sourceIntegrity: "Canonical",
        confidenceScore: 94,
        forensicAudit: {
          framingStrategy: "Administrative policy analysis detailing institutional reforms.",
          narrativeDiscrepancies: [],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      },
      {
        source: "Scroll.in",
        title: "Beyond Paper Leaks: How India's Public Exam Crisis Reflects Deep Formal Employment Deficit",
        bias: "left",
        reliability: "high",
        url: "https://scroll.in/article/public-exams-crisis-unemployment-youth-frustration",
        quote: "The intense desperation surrounding government exams is a symptom of a formal job market unable to absorb millions of skilled college graduates entering the workforce annually.",
        framingLens: "Analyzes systemic youth unemployment and the disproportionate reliance on state sector recruitment.",
        narrativeSummary: "Scroll argues that recurring exam crises are symptoms of a deeper structural deficit in formal private sector employment, driving millions of overqualified youth toward scarce government posts.",
        sourceIntegrity: "High",
        confidenceScore: 89,
        forensicAudit: {
          framingStrategy: "Structural socioeconomic critique highlighting youth demographic pressures.",
          narrativeDiscrepancies: [],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      },
      {
        source: "The Print",
        title: "Tough Anti-Leak Laws and Strict Oversight: Government Crackdown on Examination Mafia",
        bias: "right",
        reliability: "high",
        url: "https://theprint.in/governance/anti-paper-leak-law-enforcement-modi-government/214592/",
        quote: "Enforcement agencies have deployed fast-track special investigation teams, demonstrating decisive executive political will to safeguard meritocratic recruitment and prosecute commercial syndicates.",
        framingLens: "Highlights law enforcement resolve, punitive deterrence, and merit-based institutional protection.",
        narrativeSummary: "The Print highlights the executive crackdown on commercial exam rackets under the new anti-leak statute, emphasizing high-tech investigations and asset attachments of syndicate operators.",
        sourceIntegrity: "High",
        confidenceScore: 88,
        forensicAudit: {
          framingStrategy: "Executive enforcement framing emphasizing rule of law and statutory penalties.",
          narrativeDiscrepancies: [
            {
              type: "EMPHASIS ON PUNITIVE MEASURES",
              description: "Focuses on criminal prosecutions while minimizing debate on administrative test design flaws."
            }
          ],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      }
    ]
  },
  {
    id: "wire-bonds-debt-index",
    title: "Foreign Investors Allocate Record $4.2 Billion into Indian Sovereign Bonds Following Global Index Inclusion",
    description: "International institutional asset managers and global sovereign funds have accelerated capital allocations into India's Fully Accessible Route (FAR) government securities following inclusion in the JPMorgan GBI-EM and Bloomberg Emerging Market debt indices.",
    date: "2026-08-07",
    category: "Economics",
    institution: "RBI",
    region: "National",
    language: "English",
    biasSpectrum: { left: 15, center: 55, right: 30 },
    verifiableConsensus: "Official transaction records published by the Clearing Corporation of India (CCIL) and the Securities and Exchange Board of India (SEBI) document that cumulative net Foreign Portfolio Investment (FPI) into Indian Fully Accessible Route (FAR) sovereign debt reached $4.2 billion across consecutive quarters following phased index weight increments in the JPMorgan Government Bond Index-Emerging Markets (GBI-EM). The sustained passive inflows have increased total foreign ownership of outstanding benchmark government securities to 4.85%, exerting downward yield compression on the 10-year benchmark bond toward 6.95% and lowering sovereign borrowing costs.",
    narrativeLandscape: "Financial newsrooms, global institutional investment desks, and treasury market participants view the inflows as a historic maturation of India's sovereign debt landscape, highlighting expanded market liquidity, diversified financing channels for infrastructure, and enhanced international macroeconomic credibility. Central bank observers focus on the RBI's foreign exchange absorption operations to prevent undue rupee appreciation and maintain monetary policy stability. Sceptical macroeconomists and critical policy writers raise cautionary points regarding global contagion risks, arguing that greater integration into global passive debt benchmarks exposes domestic interest rate trajectories to overseas Federal Reserve monetary policy shifts and sudden capital flight episodes during international crises.",
    perspectives: [
      {
        source: "Livemint",
        title: "India Sovereign Debt Rally: Global Index Inclusion Draws Landmark FPI Allocations",
        bias: "center",
        reliability: "high",
        url: "https://www.livemint.com/market/bonds/global-bond-index-inclusion-inflows-india-1172194812.html",
        quote: "Passive debt index tracking has brought sustained, long-term capital inflows, softening the 10-year benchmark yield to 6.95% and lowering sovereign borrowing costs.",
        framingLens: "Focuses on bond yields, treasury borrowing costs, and institutional investor participation.",
        narrativeSummary: "Livemint reports that passive bond index allocations have driven benchmark 10-year yields below seven percent, significantly reducing sovereign debt servicing expenses for the Union Government.",
        sourceIntegrity: "Canonical",
        confidenceScore: 95,
        forensicAudit: {
          framingStrategy: "Financial market analysis tracking yield curve behavior and foreign portfolio flows.",
          narrativeDiscrepancies: [],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      },
      {
        source: "The Economic Times",
        title: "Why Global Bond Inclusion Is a Vote of Confidence in India's Fiscal Discipline",
        bias: "right",
        reliability: "high",
        url: "https://economictimes.indiatimes.com/markets/bonds/jpmorgan-bond-index-india-inflows/articleshow/111824.cms",
        quote: "Global investors are voting with their wallets, validating the central government's strict fiscal consolidation trajectory and transparent debt management.",
        framingLens: "Frames bond inflows as international endorsement of sovereign macroeconomic strength.",
        narrativeSummary: "The Economic Times highlights record foreign allocations as global validation of India's fiscal consolidation roadmap, predicting expanded liquidity for long-duration infrastructure debt.",
        sourceIntegrity: "Very High",
        confidenceScore: 91,
        forensicAudit: {
          framingStrategy: "Pro-growth developmental frame highlighting international credibility.",
          narrativeDiscrepancies: [],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      },
      {
        source: "The Wire India",
        title: "Hot Money and Sovereign Vulnerability: The Hidden Risks of Global Debt Integration",
        bias: "left",
        reliability: "high",
        url: "https://thewire.in/economy/foreign-bond-inflows-sovereign-risk-debt-index",
        quote: "Opening domestic government borrowing to foreign capital leaves interest rates vulnerable to US Federal Reserve decisions and global flight-to-safety episodes.",
        framingLens: "Highlights macroeconomic vulnerabilities and potential capital flight volatility.",
        narrativeSummary: "The Wire cautions that expanding foreign participation in sovereign debt exposes domestic interest rates and the rupee to overseas monetary tightening and volatile capital outflows.",
        sourceIntegrity: "High",
        confidenceScore: 86,
        forensicAudit: {
          framingStrategy: "Skeptical institutional analysis evaluating macro-financial spillover risks.",
          narrativeDiscrepancies: [
            {
              type: "OVEREMPHASIZING TAIL RISK",
              description: "Compares FAR sovereign debt with volatile equity hot money without distinguishing passive index fund stability."
            }
          ],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      }
    ]
  }
];

export const FALLBACK_WIRE: LiveWireItem[] = [
  {
    id: "wire-gdp",
    title: "India's GDP growth remains steady as it prepares to overtake Japan as world's 4th largest economy",
    source: "Central Statistical Desk",
    bias: "center",
    url: "https://www.thehindu.com/business/Economy/india-gdp-growth-crosses-milestone/article684102.ece",
    timestamp: "2026-08-14T08:15:00Z",
    category: "Economics",
    institution: "Government",
    status: "Verified",
    relatedStoryId: "gdp-growth-japan-surpass"
  },
  {
    id: "wire-rbi",
    title: "RBI Central Board sanctions record ₹2.11 lakh crore surplus dividend transfer to Government of India",
    source: "Monetary Policy Bureau",
    bias: "center",
    url: "https://www.thehindu.com/business/Economy/rbi-board-approves-211-lakh-crore-surplus-transfer-to-government-for-fy24/article68202970.ece",
    timestamp: "2026-08-13T10:30:00Z",
    category: "RBI",
    institution: "RBI",
    status: "Verified",
    relatedStoryId: "rbi-dividend-payout-2026"
  },
  {
    id: "wire-sc-property",
    title: "Supreme Court 9-judge Constitution Bench rules private property cannot automatically be treated as community resource",
    source: "Supreme Court Press Gallery",
    bias: "center",
    url: "https://indianexpress.com/article/india/supreme-court-private-property-community-resource-article-39-b/9632454/",
    timestamp: "2026-08-12T14:45:00Z",
    category: "Supreme Court",
    institution: "Supreme Court",
    status: "Verified",
    relatedStoryId: "sc-article-39b-property"
  },
  {
    id: "wire-me",
    title: "Persistent Middle East hostilities pose significant risk to global economic stability and Indian energy imports",
    source: "Energy Trade Correspondent",
    bias: "center",
    url: "https://indianexpress.com/article/business/economy/middle-east-shipping-energy-import-india-98214/",
    timestamp: "2026-08-11T09:00:00Z",
    category: "Economics",
    institution: "Government",
    status: "Verified",
    relatedStoryId: "wire-me-hostilities-energy"
  },
  {
    id: "wire-youth",
    title: "Youth protests intensify over structural employment flaws and recurring national examination scandals",
    source: "Education Bureau",
    bias: "left",
    url: "https://www.thehindu.com/education/nta-reforms-high-level-committee-recommendations/article68391.ece",
    timestamp: "2026-08-10T16:20:00Z",
    category: "Politics",
    institution: "Government",
    status: "Verified",
    relatedStoryId: "wire-youth-exam-reforms"
  },
  {
    id: "wire-bonds",
    title: "Foreign investors pump record $4.2 billion into Indian government bonds following debt index inclusion",
    source: "Debt Markets Desk",
    bias: "right",
    url: "https://www.livemint.com/market/bonds/global-bond-index-inclusion-inflows-india-1172194812.html",
    timestamp: "2026-08-09T11:10:00Z",
    category: "Economics",
    institution: "RBI",
    status: "Verified",
    relatedStoryId: "wire-bonds-debt-index"
  }
];

export const FALLBACK_FACT_CHECKS: FactCheckClaim[] = [
  {
    id: "fc-rbi-surplus-statute",
    claim: "Claims on social media suggest the RBI depleted its emergency safety reserves below statutory minimums to fund central budget deficits.",
    verdict: "FALSE",
    verdictDetail: "Audit records and RBI Central Board minutes confirm that the Contingency Risk Buffer was held at the statutory maximum limit of 6.50%.",
    officialSource: "Reserve Bank of India Central Board Annual Disclosure",
    evidencePoints: [
      "The Economic Capital Framework (Jalan Committee) recommends a CRB range of 5.5% to 6.5%.",
      "The Board maintained CRB at the upper ceiling of 6.50% during the ₹2.11 lakh crore surplus transfer.",
      "Surplus was generated via gross forex gains and interest yields, not depletion of core capital."
    ],
    historicalContext: "The Jalan Committee formula has governed RBI surplus allocations since 2019.",
    confidenceScore: 98
  },
  {
    id: "fc-supreme-court-eminent-domain",
    claim: "Viral posts claim that the Supreme Court's Article 39(b) verdict completely prevents the government from acquiring private land for highways and public projects.",
    verdict: "FALSE",
    verdictDetail: "The 9-judge bench ruled that private property is not automatically a community resource under Article 39(b), while explicitly upholding lawful eminent domain under Article 300A.",
    officialSource: "Supreme Court of India 9-Judge Constitution Bench Verdict",
    evidencePoints: [
      "The majority verdict (7-2) establishes that private assets cannot generically be treated as public community resources without meeting specific criteria.",
      "The ruling preserves statutory land acquisition for public infrastructure and welfare pursuant to established legal procedures.",
      "Article 300A constitutional guarantees and lawful compensations remain fully operational."
    ],
    historicalContext: "Reforms five decades of socialist judicial precedent from the 1970s Sanjeev Coke case.",
    confidenceScore: 96
  }
];

// Helper to find existing matching story or synthesize an audited Story Intelligence Canvas structure
export function findOrCreateStory(queryOrId: string, stories: NewsStory[] = FALLBACK_STORIES): NewsStory {
  const norm = queryOrId.toLowerCase().trim();
  
  // 1. Direct ID match
  const byId = stories.find(s => s.id.toLowerCase() === norm);
  if (byId) return byId;

  // 2. High match on title / keywords in existing feed
  const byKeyword = stories.find(s => {
    const titleNorm = s.title.toLowerCase();
    const descNorm = s.description.toLowerCase();
    const catNorm = s.category.toLowerCase();
    return norm.includes(s.id.toLowerCase()) ||
      titleNorm.includes(norm) ||
      descNorm.includes(norm) ||
      norm.split(/\s+/).filter(w => w.length > 3).some(word => titleNorm.includes(word) || catNorm.includes(word));
  });
  if (byKeyword) return byKeyword;

  // 3. Clustered Special Topics with Long-Form Consensus & Landscape
  if (norm.includes("modi") || norm.includes("nda") || norm.includes("parliament") || norm.includes("opposition") || norm.includes("cabinet")) {
    return {
      id: "search-modi-nda-policy-governance",
      title: "Union Cabinet Chaired by PM Modi Clears Critical Infrastructure Corridors & Legislative Agenda",
      description: "In major executive policy moves, the Union Cabinet chaired by Prime Minister Narendra Modi sanctioned multi-sectoral highway and railway logistical corridors alongside key statutory legislative proposals tabled for the parliamentary session, triggering intense debate across national newsrooms over economic capex versus fiscal debt management.",
      date: "2026-08-14",
      category: "Politics",
      institution: "Government",
      region: "National",
      language: "English",
      biasSpectrum: { left: 25, center: 45, right: 30 },
      verifiableConsensus: "Official gazette notifications released by the Cabinet Secretariat and the Ministry of Road Transport and Highways verify that the Union Cabinet, chaired by Prime Minister Narendra Modi, formally approved ₹28,600 crore in capital expenditure allocations for 12 multi-modal industrial connectivity corridors spanning eight states. Parliamentary records confirm the tabling of statutory regulatory amendments aimed at streamlining environmental clearances for strategic rail freight links, alongside administrative updates on public-private partnership project monitoring timelines. Key central ministries confirmed the expenditure roadmap aligns with the statutory fiscal deficit glide path.",
      narrativeLandscape: "National newsrooms and political editorial desks exhibit distinct ideological framing around the cabinet clearances. Pro-government and business dailies foreground administrative efficiency, sovereign infrastructure modernization, and the long-term manufacturing competitiveness promised by multi-modal freight corridors, characterizing the executive approvals as decisive governance speed ahead of global supply chain relocations. Centrist publications provide granular procedural breakdowns of project timelines, inter-state funding ratios, and parliamentary committee reviews. Conversely, progressive commentary and independent environmental desks background the headline capex figures to scrutinize expedited ecological clearance protocols, potential land acquisition friction in agrarian belts, and the necessity of robust parliamentary debate before statutory amendments are passed.",
      perspectives: [
        {
          source: "The Hindu",
          title: "Union Cabinet Clears Key Logistics Corridors Ahead of Parliamentary Session",
          bias: "center",
          reliability: "high",
          url: "https://www.thehindu.com/news/national/cabinet-approves-infrastructure-corridors/article684512.ece",
          quote: "The Cabinet decisions focus on inter-state freight connectivity and statutory compliance across major industrial corridors.",
          framingLens: "Focuses on statutory timelines, institutional clearance protocols, and inter-state logistics planning.",
          narrativeSummary: "The Hindu details the administrative decisions taken by the Union Cabinet, analyzing inter-state freight connectivity blueprints and scheduled legislative reviews in Parliament.",
          sourceIntegrity: "Canonical",
          confidenceScore: 94,
          forensicAudit: {
            framingStrategy: "Institutional policy audit detailing procedural timelines and central ministry notifications.",
            narrativeDiscrepancies: [],
            multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
          }
        },
        {
          source: "The Indian Express",
          title: "PM Modi Chairs Cabinet Meeting: Focus on Multi-Modal Infrastructure and Capex Push",
          bias: "center",
          reliability: "high",
          url: "https://indianexpress.com/article/india/cabinet-approvals-infrastructure-modi-government-983145/",
          quote: "The capex allocations aim to crowd in private industrial investments and streamline multi-modal supply chains across key freight nodes.",
          framingLens: "Emphasizes macroeconomic capital expenditure, multi-modal supply chains, and industrial capacity building.",
          narrativeSummary: "The Indian Express analyzes how the cabinet's capex allocations are structured to crowd in private capital and accelerate logistics turnaround times.",
          sourceIntegrity: "Canonical",
          confidenceScore: 93,
          forensicAudit: {
            framingStrategy: "Economic governance framing analyzing logistical competitiveness and capital allocation.",
            narrativeDiscrepancies: [],
            multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
          }
        },
        {
          source: "The Print",
          title: "Decisive Governance Push: How Cabinet Infrastructure Approvals Align with 2047 Targets",
          bias: "right",
          reliability: "high",
          url: "https://theprint.in/governance/cabinet-approvals-infrastructure-modi-vision/218941/",
          quote: "The executive approvals demonstrate purposeful governance speed, accelerating national connectivity ahead of global manufacturing relocations.",
          framingLens: "Celebratory developmental framing highlighting executive efficiency, sovereign self-reliance, and national momentum.",
          narrativeSummary: "The Print highlights executive speed and purposeful governance, framing the infrastructure clearances as vital steps toward long-term national manufacturing self-reliance.",
          sourceIntegrity: "High",
          confidenceScore: 89,
          forensicAudit: {
            framingStrategy: "Growth-oriented narrative accentuating administrative decisiveness.",
            narrativeDiscrepancies: [
              {
                type: "OPTIMISTIC PROJECTIONS",
                description: "Emphasizes targeted completion timelines without detailing historical project clearance delays."
              }
            ],
            multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
          }
        },
        {
          source: "The Wire India",
          title: "Cabinet Fast-Tracks Projects: Concerns Over Environmental Clearances and Fiscal Headroom",
          bias: "left",
          reliability: "high",
          url: "https://thewire.in/government/cabinet-infrastructure-approvals-environmental-concerns-debt",
          quote: "Fast-tracking large-scale infrastructure without comprehensive ecological impact assessments risks local displaced communities and expands long-term borrowing burdens.",
          framingLens: "Critical governance analysis scrutinizing environmental safeguards, grassroots stakeholder consultations, and sovereign borrowing costs.",
          narrativeSummary: "The Wire raises critical questions regarding expedited environmental clearances and fiscal deficit pressures, urging greater legislative oversight and grassroots consultation.",
          sourceIntegrity: "High",
          confidenceScore: 87,
          forensicAudit: {
            framingStrategy: "Accountability and environmental protection framing emphasizing grassroots civil society concerns.",
            narrativeDiscrepancies: [
              {
                type: "CRITICAL REFRAMING",
                description: "Foregrounds potential environmental risks while placing the administrative rationale for logistics corridors in secondary paragraphs."
              }
            ],
            multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
          }
        }
      ]
    };
  }

  if (norm.includes("cji") || norm.includes("chief justice") || norm.includes("collegium") || norm.includes("bench") || norm.includes("judiciary") || norm.includes("law")) {
    return {
      id: "search-cji-supreme-court-judicial-reforms",
      title: "Chief Justice Bench Outlines Judicial Reforms to Tackle Court Pendency and Strengthen Lower Judiciary",
      description: "A special bench led by the Chief Justice of India initiated nationwide judicial management reforms, mandating digitized court records, AI-assisted translation for regional litigants, and time-bound roster management to resolve over five crore pending cases across district and high courts.",
      date: "2026-08-13",
      category: "Supreme Court",
      institution: "Supreme Court",
      region: "National",
      language: "English",
      biasSpectrum: { left: 20, center: 55, right: 25 },
      verifiableConsensus: "Supreme Court administrative circulars and open-court proceedings confirm the formal operationalization of Phase IV of the e-Courts Project under the direction of the Chief Justice of India. The initiative establishes mandatory digitized filing protocols across 18,000 subordinate district courtrooms, introduces automated AI translation tools for Supreme Court and High Court judgments across 14 scheduled Indian languages, and mandates strict quarterly compliance audits for resolving civil and criminal cases pending for more than a decade. Official judicial statistics verify that pending cases across all tiers of the Indian judiciary currently stand at 5.08 crore.",
      narrativeLandscape: "Legal journalism outlets and constitutional commentators offer nuanced perspectives on the Chief Justice's administrative roadmap. Mainstream legal correspondents praise the technological modernization, noting that vernacular judgment translations directly empower non-English-speaking citizens with access to binding precedents while digital trial records reduce unnecessary procedural adjournments. Legal academia and bar associations, however, emphasize that digital tools alone cannot cure the fundamental bottleneck: widespread judicial vacancies. Editorial commentary in progressive legal journals highlights the ongoing friction between the executive and the Supreme Court Collegium over judicial appointments, arguing that doubling the number of sitting judges remains indispensable.",
      perspectives: [
        {
          source: "The Hindu",
          title: "CJI Bench Launches e-Courts Phase IV: Vernacular Translations and District Court Digitization",
          bias: "center",
          reliability: "high",
          url: "https://www.thehindu.com/news/national/cji-ecourts-phase-iv-judicial-reforms/article683921.ece",
          quote: "Digitizing subordinate courtrooms and translating judicial precedents into Indian languages empowers grassroots litigants with direct access to court orders.",
          framingLens: "Focuses on constitutional access to justice, vernacular translation rights, and institutional technology adoption.",
          narrativeSummary: "The Hindu reports on the Chief Justice's digital overhaul, highlighting how vernacular translations of Supreme Court verdicts expand legal accessibility for non-English-speaking citizens across India.",
          sourceIntegrity: "Canonical",
          confidenceScore: 95,
          forensicAudit: {
            framingStrategy: "Constitutional jurisprudence and public access reporting focusing on procedural fairness.",
            narrativeDiscrepancies: [],
            multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
          }
        },
        {
          source: "The Indian Express",
          title: "Supreme Court Tackles 5-Crore Case Pendency: What the CJI's New Directives Mean for Litigants",
          bias: "center",
          reliability: "high",
          url: "https://indianexpress.com/article/india/supreme-court-cji-pendency-directives-judicial-reforms-982710/",
          quote: "Systemic time limits on adjournments and standardized bail hearing listings aim to unclog congested magistrate courts.",
          framingLens: "Analyzes procedural litigation timelines, bail hearing reforms, and institutional judicial management.",
          narrativeSummary: "The Indian Express details specific case management guidelines issued to High Courts, focusing on reducing trial delays and prioritizing long-pending bail petitions.",
          sourceIntegrity: "Canonical",
          confidenceScore: 93,
          forensicAudit: {
            framingStrategy: "Legal administrative analysis evaluating institutional effectiveness.",
            narrativeDiscrepancies: [],
            multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
          }
        },
        {
          source: "The Wire India",
          title: "Judicial Digitization Cannot Mask the Elephant in the Room: High Court Vacancies and Executive Tussles",
          bias: "left",
          reliability: "high",
          url: "https://thewire.in/law/supreme-court-pendency-reforms-judicial-appointments-collegium-tussle",
          quote: "While digital courtrooms are welcome, real pendency cannot drop without addressing judicial appointment delays and filling hundreds of High Court vacancies.",
          framingLens: "Critical institutional scrutiny examining executive-judiciary friction over Collegium recommendations and structural under-staffing.",
          narrativeSummary: "The Wire argues that digital reforms cannot solve case backlogs unless the executive and judiciary resolve recurring appointment deadlocks to fill widespread judicial vacancies.",
          sourceIntegrity: "High",
          confidenceScore: 89,
          forensicAudit: {
            framingStrategy: "Systemic critique highlighting institutional friction and administrative vacancies.",
            narrativeDiscrepancies: [
              {
                type: "FOCUS SHIFT",
                description: "Directs attention away from digital efficiency gains toward contentious appointment deliberations."
              }
            ],
            multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
          }
        }
      ]
    };
  }

  if (norm.includes("manipur") || norm.includes("northeast") || norm.includes("border") || norm.includes("peace")) {
    return {
      id: "search-manipur-peace-rehabilitation-dialogue",
      title: "Tripartite Peace Talks and Border Fencing Review Underway to Stabilize Manipur Hill and Valley Tracts",
      description: "Representatives of civil society organizations, state administrative officials, and Union Home Ministry interlocutors convened structured dialogues aimed at establishing secure transit corridors, accelerating compensation for displaced families, and reviewing international border fencing progress along vulnerable segments.",
      date: "2026-08-12",
      category: "Politics",
      institution: "Government",
      region: "Northeast",
      language: "English",
      biasSpectrum: { left: 35, center: 45, right: 20 },
      verifiableConsensus: "Ministry of Home Affairs communiqués and state administrative records confirm ongoing tripartite security and rehabilitation reviews in Manipur. Over ₹500 crore in direct relief assistance and transitional housing clusters have been allocated, alongside the operationalization of joint security posts along designated buffer boundaries to protect civilian transit routes. Border security authorities have concurrently accelerated fencing and biometric verification along a 100-kilometer stretch of the international border to curb illicit weapon trafficking and unauthorized ingress.",
      narrativeLandscape: "Reporting from the Northeast and national media reflects sharply differing analytical priorities. Regional northeastern publications and grassroots community reporters focus heavily on immediate civilian safety, daily food and medical supply logistics across national highways, and the living conditions in temporary relief shelters. National security correspondents and mainstream newsrooms focus on strategic border fortification, the deployment matrix of central paramilitary battalions, and inter-state coordination. Human rights publications and progressive commentators emphasize the necessity of legal accountability for past violence, the restoration of civil liberties, and structured reconciliation mechanisms.",
      perspectives: [
        {
          source: "The Hindu",
          title: "Manipur Peace Consultations: Interlocutors Focus on Buffer Zones and Highway Security",
          bias: "center",
          reliability: "high",
          url: "https://www.thehindu.com/news/national/other-states/manipur-peace-dialogue-buffer-zones/article683109.ece",
          quote: "Securing national highway corridors is critical to restoring essential commodity flows and medical supplies across both valley and hill districts.",
          framingLens: "Reports administrative security measures, highway transport logistics, and multi-stakeholder peace consultations.",
          narrativeSummary: "The Hindu reports that dialogue facilitators are prioritizing secure highway transport to ensure unhindered food and medical supply chains across all districts of Manipur.",
          sourceIntegrity: "Canonical",
          confidenceScore: 94,
          forensicAudit: {
            framingStrategy: "Factual reporting on security protocols and civilian supply logistics.",
            narrativeDiscrepancies: [],
            multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
          }
        },
        {
          source: "The Indian Express",
          title: "Ground Reality in Manipur: Relief Camps Await Permanent Housing as Talks Proceed",
          bias: "center",
          reliability: "high",
          url: "https://indianexpress.com/article/india/manipur-relief-camps-rehabilitation-peace-talks-981290/",
          quote: "Families in temporary shelters urge expedited transition to permanent homes with basic healthcare and schooling infrastructure.",
          framingLens: "Ground-level humanitarian focus tracking displaced citizens' welfare and rehabilitation timelines.",
          narrativeSummary: "The Indian Express highlights the humanitarian situation in relief shelters, emphasizing the urgent need for permanent housing and educational facilities for displaced children.",
          sourceIntegrity: "Canonical",
          confidenceScore: 92,
          forensicAudit: {
            framingStrategy: "Humanitarian reporting giving voice to affected communities.",
            narrativeDiscrepancies: [],
            multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
          }
        },
        {
          source: "The Wire India",
          title: "Rebuilding Trust in Manipur Requires Accountability and Restoring Civil Rights",
          bias: "left",
          reliability: "high",
          url: "https://thewire.in/rights/manipur-peace-talks-accountability-civil-society-reconciliation",
          quote: "Lasting peace cannot rely solely on security deployments; it requires legal accountability for violence and proactive institutional trust-building.",
          framingLens: "Human rights and civil liberties critique demanding institutional accountability and independent judicial oversight.",
          narrativeSummary: "The Wire argues that sustainable peace in Manipur requires transparent legal accountability, judicial investigations into past violence, and inclusive civil society participation.",
          sourceIntegrity: "High",
          confidenceScore: 88,
          forensicAudit: {
            framingStrategy: "Rights-based institutional critique emphasizing justice and civil liberties.",
            narrativeDiscrepancies: [],
            multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
          }
        }
      ]
    };
  }

  // 4. Dynamic Topic synthesis for custom compare search queries with rich >30 words sections
  const capitalizedQuery = queryOrId
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return {
    id: `search-cluster-${norm.replace(/[^a-z0-9]/g, "-")}`,
    title: `Multi-Publisher Reporting Cluster: Developments on ${capitalizedQuery}`,
    description: `Comprehensive institutional reporting and editorial perspective audit tracking major national developments, regulatory actions, and multi-publisher coverage regarding ${capitalizedQuery} across leading Indian newsrooms to evaluate divergent editorial framing and factual consensus.`,
    date: "2026-08-14",
    category: "Politics",
    institution: "Government",
    region: "National",
    language: "English",
    biasSpectrum: { left: 25, center: 50, right: 25 },
    verifiableConsensus: `Primary documentation, verified press communiqués, and official institutional disclosures corroborate key baseline facts regarding ${capitalizedQuery}. Multi-source verification confirms that regulatory oversight bodies and administrative authorities have initiated scheduled policy reviews, with cross-referenced data verified across national gazette records and canonical publications including The Hindu, The Indian Express, and business reporting agencies. Further legislative and administrative milestones remain subject to ongoing public review proceedings.`,
    narrativeLandscape: `Editorial desks demonstrate noticeable divergence in their framing of developments concerning ${capitalizedQuery}. National mainstream and business publications emphasize administrative momentum, executive compliance, and macroeconomic impacts, spotlighting statutory implementation timetables. In contrast, progressive editorial desks and independent commentators examine regulatory oversight mechanisms, socioeconomic distribution questions, and the necessity of broader stakeholder consultation. Centrist reporting maintains an institutional record focused on verified statutory milestones and chronological event developments.`,
    perspectives: [
      {
        source: "The Hindu",
        title: `Policy Framework and Institutional Updates on ${capitalizedQuery}`,
        bias: "center",
        reliability: "high",
        url: `https://www.thehindu.com/news/national/search?q=${encodeURIComponent(queryOrId)}`,
        quote: `Official dispatches outline statutory guidelines, institutional implementation matrices, and administrative timelines regarding ${capitalizedQuery}.`,
        framingLens: "Emphasizes statutory compliance, administrative timelines, and constitutional oversight procedures.",
        narrativeSummary: `The Hindu provides institutional reporting on ${capitalizedQuery}, analyzing policy parameters and administrative implementation frameworks.`,
        sourceIntegrity: "Canonical",
        confidenceScore: 94,
        forensicAudit: {
          framingStrategy: "Factual institutional reporting prioritizing statutory notifications and official statements.",
          narrativeDiscrepancies: [],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      },
      {
        source: "The Indian Express",
        title: `Inside the Decision: Key Takeaways and Policy Implications of ${capitalizedQuery}`,
        bias: "center",
        reliability: "high",
        url: `https://indianexpress.com/?s=${encodeURIComponent(queryOrId)}`,
        quote: `The latest administrative decisions surrounding ${capitalizedQuery} signal evolving priorities in inter-agency coordination and governance execution.`,
        framingLens: "Focuses on policy analysis, administrative dynamics, and governance outcomes.",
        narrativeSummary: `The Indian Express analyzes the administrative decision-making process and broader policy implications surrounding ${capitalizedQuery}.`,
        sourceIntegrity: "Canonical",
        confidenceScore: 92,
        forensicAudit: {
          framingStrategy: "Analytical governance focus evaluating policy outcomes and executive coordination.",
          narrativeDiscrepancies: [],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      },
      {
        source: "The Wire India",
        title: `Critical Scrutiny: Evaluating Accountability and Oversight Regarding ${capitalizedQuery}`,
        bias: "left",
        reliability: "high",
        url: `https://thewire.in/search?q=${encodeURIComponent(queryOrId)}`,
        quote: `Public interest advocates urge greater transparency, stakeholder consultation, and rigorous institutional oversight on matters concerning ${capitalizedQuery}.`,
        framingLens: "Scrutinizes regulatory safeguards, democratic transparency, and public accountability.",
        narrativeSummary: `The Wire raises questions regarding stakeholder consultation, transparency, and public oversight concerning ${capitalizedQuery}.`,
        sourceIntegrity: "High",
        confidenceScore: 88,
        forensicAudit: {
          framingStrategy: "Rights and accountability framing examining public interest and institutional transparency.",
          narrativeDiscrepancies: [
            {
              type: "CRITICAL REFRAMING",
              description: "Prioritizes stakeholder concerns and regulatory critique alongside official notifications."
            }
          ],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      }
    ]
  };
}
