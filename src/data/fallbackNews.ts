import { NewsStory, LiveWireItem, FactCheckClaim } from "../types";

export const FALLBACK_STORIES: NewsStory[] = [
  {
    id: "gdp-growth-japan-surpass",
    title: "India Overtakes Japan as World's 4th Largest Economy with $4.18 Trillion GDP Milestone",
    description: "In a landmark macroeconomic milestone confirmed by official central statistical updates and international fiscal trackers, India's real GDP reached $4.18 trillion in FY 2025-26, surpassing Japan to become the world's fourth-largest economy.",
    date: "2026-07-30",
    category: "Economics",
    institution: "Government",
    region: "National",
    language: "English",
    biasSpectrum: { left: 20, center: 50, right: 30 },
    verifiableConsensus: "India officially surpassed Japan in late 2025 to become the world's fourth-largest economy with a GDP of $4.18 trillion. This milestone was driven by robust real GDP growth, specifically a six-quarter high of 8.2% in Q2 FY 2025-26, supported by strong domestic private consumption. Most reports agree India is now on track to overtake Germany for the third spot by 2027-2030.",
    narrativeLandscape: "The narrative landscape is dominated by government-led reports celebrating the milestone as a sign of economic resilience and 'Goldilocks' conditions. Business-centric and international-facing outlets emphasize India's rising global prestige and investment appeal. Conversely, legacy publications provide a more tempered view by including central bank warnings of future growth moderation and methodology updates such as base-year revisions.",
    perspectives: [
      {
        source: "NDTV",
        title: "India Surpasses Japan To Become World's 4th Largest Economy: Government",
        bias: "center",
        reliability: "high",
        url: "https://www.ndtv.com/india-news/india-gdp-surpasses-japan-fourth-largest-economy",
        quote: "India reached a $4.18 trillion GDP, overtaking Japan. Growth accelerated to 8.2% in Q2 FY 2025-26, surpassing forecasts. The report cites government resilience amid global trade uncertainties and projects India reaching the third spot by 2030 with a $7.3 trillion economy.",
        framingLens: "Exclusively relies on a government press release (PIB) without questioning the timing of the announcement relative to official IMF verification expected in 2026.",
        narrativeSummary: "India reached a $4.18 trillion GDP, overtaking Japan. Growth accelerated to 8.2% in Q2 FY 2025-26, surpassing forecasts.",
        sourceIntegrity: "High",
        confidenceScore: 90,
        forensicAudit: {
          framingStrategy: "NDTV adopts a centrist reporting style but reflects the official state narrative by primarily relaying government data and optimistic projections from the Press Information Bureau.",
          narrativeDiscrepancies: [
            {
              type: "APPEAL TO AUTHORITY",
              description: "Presents government projections as definitive facts before international fiscal bodies have released final comparative annual data."
            }
          ],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      },
      {
        source: "The Economic Times",
        title: "India beats Japan to become world's 4th largest economy - The Economic Times",
        bias: "right",
        reliability: "high",
        url: "https://economictimes.indiatimes.com/news/economy/indicators/india-gdp-growth-japan-fourth-largest",
        quote: "India's economy hit $4.18 trillion, surpassing Japan due to domestic drivers and robust private consumption. The outlet highlights India's status as the world's fastest-growing major economy and its potential to displace Germany from the third rank within three years.",
        framingLens: "Focuses on macroeconomic milestones while downplaying internal warnings about slumping private sector growth and potential manufacturing slowdowns mentioned in secondary briefs.",
        narrativeSummary: "India's economy hit $4.18 trillion, surpassing Japan due to domestic drivers and robust private consumption.",
        sourceIntegrity: "Very High",
        confidenceScore: 88,
        forensicAudit: {
          framingStrategy: "The Economic Times focuses heavily on capital market positivity, investor confidence, and high-frequency growth metrics while placing secondary caveats in buried sections.",
          narrativeDiscrepancies: [
            {
              type: "SELECTIVE STATISTICAL CITATION",
              description: "Highlights top-line GDP expansion rate without detailing persistent rural demand variance or real wage growth dynamics."
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
        quote: "While macro statistical benchmarks mark a symbolic victory, distribution metrics reveal deep per-capita disparities. India's per-capita income remains roughly $2,800, compared to Japan's $33,000.",
        framingLens: "Emphasizes per-capita disparities and questions base-year calculations, centering on wealth concentration rather than aggregate national output.",
        narrativeSummary: "Distribution metrics reveal deep per-capita disparities despite headline aggregate milestone.",
        sourceIntegrity: "High",
        confidenceScore: 85,
        forensicAudit: {
          framingStrategy: "The Wire adopts an institutional critique framing, shifting focus from sovereign GDP totals to individual household purchasing parity and informal sector recovery.",
          narrativeDiscrepancies: [
            {
              type: "REFRAMING SCOPE",
              description: "Substitutes national aggregate comparisons with per-capita rank comparisons to challenge the official celebration narrative."
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
    description: "In a historic fiscal development, the Reserve Bank of India's Board approved a record surplus transfer of ₹2.11 lakh crore to the central government, representing more than double the previous year's transfer and providing an immense non-tax revenue injection.",
    date: "2026-05-22",
    category: "RBI",
    institution: "RBI",
    region: "National",
    language: "English",
    biasSpectrum: { left: 20, center: 45, right: 35 },
    verifiableConsensus: "The RBI Board officially approved a ₹2.11 lakh crore surplus dividend transfer for FY 2024-25. The transfer complies with the Economic Capital Framework (ECF) guidelines set by the Bimal Jalan Committee, maintaining the Contingency Risk Buffer at 6.50% (above the required 5.5%-6.5% band). The funds provide significant non-tax revenue to help meet the government's 4.9% fiscal deficit target.",
    narrativeLandscape: "Centrist business journals focus purely on the macroeconomic impact, analyzing liquidity surpluses, banking system yields, and fiscal deficit reduction. Sovereignty-aligned publications praise the payout as a reflection of India's sturdy economic governance and central bank resilience. Left-leaning journals express concern over recurring high central-bank payouts diluting reserves, questioning long-term buffer viability against global commodity volatility.",
    perspectives: [
      {
        source: "The Hindu",
        title: "Reserve Bank of India Board Approves ₹2.11 Lakh Crore Surplus Transfer to Government",
        bias: "center",
        reliability: "high",
        url: "https://www.thehindu.com/business/Economy/rbi-board-approves-211-lakh-crore-surplus-transfer-to-government-for-fy24/article68202970.ece",
        quote: "The record surplus payout will supplement standard tax-revenue projections, granting the finance ministry additional cushion for public capex and fiscal consolidation goals.",
        framingLens: "Focuses on institutional compliance with Jalan Committee norms and fiscal balance sheet impacts.",
        narrativeSummary: "The record surplus payout will supplement standard tax-revenue projections, granting fiscal consolidation cushion.",
        sourceIntegrity: "Canonical",
        confidenceScore: 94,
        forensicAudit: {
          framingStrategy: "The Hindu uses matter-of-fact institutional framing, giving equal weight to central bank statutory guardrails and government budgetary flexibility.",
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
        quote: "While the fiscal injection is undeniable, repeatedly extracting unprecedented high dividend shares from the central bank raises delicate questions about reserve padding and autonomy.",
        framingLens: "Centers on institutional independence and long-term risk buffers against external financial shocks.",
        narrativeSummary: "Repeatedly extracting high dividend payouts raises questions regarding central bank reserve margins.",
        sourceIntegrity: "High",
        confidenceScore: 86,
        forensicAudit: {
          framingStrategy: "Highlights potential risks of reserve depletion while questioning whether fiscal reliance on central bank transfers masks structural tax revenue gaps.",
          narrativeDiscrepancies: [
            {
              type: "SELECTIVE CONTEXT",
              description: "Omits mention that the Contingency Risk Buffer was retained at the maximum 6.50% ceiling."
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
        quote: "The landmark payout underscores robust asset stewardship under contemporary reforms, creating a secure fiscal shield to drive historic infrastructural growth.",
        framingLens: "Frames the payout as proof of excellent macroeconomic management and state financial strength.",
        narrativeSummary: "Landmark payout reflects robust asset stewardship driving national infrastructure development.",
        sourceIntegrity: "High",
        confidenceScore: 89,
        forensicAudit: {
          framingStrategy: "Employs high-resonance developmental vocabulary, presenting the transfer as an active driver of sovereign self-reliance.",
          narrativeDiscrepancies: [
            {
              type: "EMOTIVE LANGUAGE",
              description: "Uses celebratory adjectives ('landmark', 'stellar stewardship') to characterize standard regulatory surplus distribution."
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
    description: "In a landmark 9-judge bench decision, the Supreme Court of India ruled that not all private properties can automatically be categorized as 'material resources of the community' under Article 39(b) of the Constitution for state acquisition, overhauling decades of socialist judicial precedent.",
    date: "2026-05-15",
    category: "Supreme Court",
    institution: "Supreme Court",
    region: "National",
    language: "English",
    biasSpectrum: { left: 35, center: 40, right: 25 },
    verifiableConsensus: "A 9-judge Supreme Court bench headed by CJI ruled by a 7-2 majority that private property is not automatically a 'material resource of the community' under Article 39(b) of the Constitution. However, the court clarified that certain private assets may qualify if they serve public welfare thresholds. This decision overrules earlier sweeping observations from the 1978 Ranganatha Reddy judgment.",
    narrativeLandscape: "Conservative and classical-liberal commentators celebrated the verdict as a monumental victory protecting individual wealth creators and private capital from arbitrary state seizures. Centrist law reviews detailed procedural checks, noting that while the state can still acquire properties under specific lawful guidelines, the general socialist presumption was dismantled. Left-leaning publications warned that the verdict may severely limit the sovereign's redistribution capabilities, widening economic disparities.",
    perspectives: [
      {
        source: "The Indian Express",
        title: "Supreme Court 9-judge Bench Ruling on Article 39(b): Private Property Is Not Automatically Community Resource",
        bias: "center",
        reliability: "high",
        url: "https://indianexpress.com/article/india/supreme-court-private-property-community-resource-article-39-b/9632454/",
        quote: "The Court held that the socialist era's sweeping ideological rulings that all private wealth belongs to the resource pool run contrary to contemporary constitutional goals.",
        framingLens: "Provides legal doctrine context, detailing majority vs minority opinions and historic case evolution.",
        narrativeSummary: "The Court held that sweeping socialist-era presumptions regarding private wealth run contrary to current constitutional design.",
        sourceIntegrity: "Canonical",
        confidenceScore: 92,
        forensicAudit: {
          framingStrategy: "Focuses on constitutional doctrine history, legal precedents, and procedural nuances of eminent domain.",
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
        quote: "By restricting what constitutes a community resource, the majority judgment risks placing a high hurdle in front of public re-distribution laws meant to address steep inequality.",
        framingLens: "Examines implications for wealth inequality, public land acquisition for social housing, and welfare state capacity.",
        narrativeSummary: "Restricting community resource definitions risks placing hurdles in front of social welfare redistribution policies.",
        sourceIntegrity: "High",
        confidenceScore: 87,
        forensicAudit: {
          framingStrategy: "Framed around economic justice and constitutional directive principles of state policy (DPSP).",
          narrativeDiscrepancies: [
            {
              type: "SLANTED INTERPRETATION",
              description: "Framed as a complete prohibition on public land acquisition, whereas the judgment explicit preserves public acquisition under clear statutory standards."
            }
          ],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      }
    ]
  },
  {
    id: "regional-kerala-wayanad-landslide-rehab",
    title: "Kerala Assembly Approves ₹1,200 Crore Wayanad Rehabilitation Package with Regional Climate Audit",
    description: "The Kerala Legislative Assembly passed a unified rehabilitation bill allocating ₹1,200 crore for eco-restoration, township construction, and landslide victim support in Wayanad, integrating strict Western Ghats ecological zoning regulations.",
    date: "2026-07-28",
    category: "State Governance",
    institution: "Government",
    region: "Kerala",
    language: "Malayalam",
    biasSpectrum: { left: 30, center: 50, right: 20 },
    verifiableConsensus: "The Kerala Cabinet and Assembly sanctioned a ₹1,200 crore climate rehabilitation scheme for Wayanad disaster survivors. The project establishes eco-resilient township clusters and restricts commercial construction in high-hazard slope zones of the Western Ghats.",
    narrativeLandscape: "Malayalam regional newspapers (Manorama, Mathrubhumi) provide micro-level ground coverage detailing victim compensation schedules and township site selections. National English outlets emphasize Western Ghats ecology debates and climate adaptation models, while regional political desks debate local administrative efficiency and central disaster fund allocation.",
    perspectives: [
      {
        source: "Malayala Manorama",
        title: "Wayanad Model Township Plan Passed: Eco-Resilient Housing in Safe Zones",
        bias: "center",
        reliability: "high",
        url: "https://www.manoramaonline.com/news/kerala/wayanad-rehabilitation-package-assembly-passed.html",
        quote: "The rehabilitation package ensures land ownership rights in ecologically stable townships equipped with landslide monitoring sensors.",
        framingLens: "Focuses on community rehabilitation timelines, beneficiary lists, and ground reality in Wayanad.",
        narrativeSummary: "Land ownership rights and eco-resilient township construction guaranteed for affected families.",
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
        quote: "Lawmakers agreed to mandate strict environmental impact assessments for all commercial structures above 15 degrees slope elevation.",
        framingLens: "Highlights ecological protection policies and enforcement of Western Ghats conservation guidelines.",
        narrativeSummary: "Environmental impact audits made mandatory for high-hazard hill slope zones.",
        sourceIntegrity: "High",
        confidenceScore: 90,
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
    title: "Tamil Nadu Unveils ₹4,000 Crore Chip Design Park in Chennai to Boost Electronics R&D Hub",
    description: "In a major state industrial initiative, the Tamil Nadu Government inaugurated the Semiconductor Design & Fabless Ecosystem Park in Sriperumbudur, aiming to train 25,000 chip design engineers and attract global Fabless semiconductor giants.",
    date: "2026-07-25",
    category: "Technology",
    institution: "Government",
    region: "Tamil Nadu",
    language: "Tamil",
    biasSpectrum: { left: 15, center: 60, right: 25 },
    verifiableConsensus: "The Tamil Nadu Industrial Development Corporation (TIDCO) launched a 150-acre semiconductor design park near Chennai with a state outlay of ₹4,000 crore. The facility focuses on Fabless chip design, IP creation, and university research partnerships.",
    narrativeLandscape: "Tamil news outlets (Dinamalar, Daily Thanthi, Hindu Tamil) celebrate the launch as a milestone solidifying Tamil Nadu's position as India's manufacturing and design capital. National business desks highlight Tamil Nadu's strategic competition with Gujarat and Karnataka for high-value tech investments.",
    perspectives: [
      {
        source: "Hindu Tamil Thisai",
        title: "Chennai Semiconductor Design Park: Tamil Nadu's Leap into High-Tech Electronics",
        bias: "center",
        reliability: "high",
        url: "https://www.hindutamil.in/news/tamilnadu/semiconductor-design-park-chennai-tidco.html",
        quote: "The park will foster native Fabless startups and equip regional engineering colleges with state-of-the-art EDA chip design tools.",
        framingLens: "Emphasizes local youth skill development, regional economic diversification, and high-paying engineering jobs.",
        narrativeSummary: "Park fosters native Fabless startups and equips regional universities with advanced chip design labs.",
        sourceIntegrity: "Canonical",
        confidenceScore: 95,
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
        quote: "Leading multinational chipmakers signed initial investment commitments leveraging Chennai's port logistics and talent pool.",
        framingLens: "Focuses on foreign direct investment, state industrial growth, and commercial competitiveness.",
        narrativeSummary: "Multinational chipmakers commit investments leveraging port connectivity and engineering talent pool.",
        sourceIntegrity: "High",
        confidenceScore: 91,
        forensicAudit: {
          framingStrategy: "Market-oriented commercial framing praising state industrial promotion and FDI inflows.",
          narrativeDiscrepancies: [],
          multiLensValidationRef: "PUBLIC KNOWLEDGE AUDIT"
        }
      }
    ]
  }
];

export const FALLBACK_WIRE: LiveWireItem[] = [
  {
    id: "wire-1",
    title: "Supreme Court Constitution Bench Begins Final Hearing on Electoral Reforms and Campaign Finance Rules",
    source: "Supreme Court Desk",
    bias: "center",
    url: "https://main.sci.gov.in",
    timestamp: "12 mins ago",
    category: "SUPREME COURT",
    institution: "Supreme Court",
    status: "Developing",
    relatedStoryId: "sc-article-39b-property"
  },
  {
    id: "wire-2",
    title: "Lok Sabha Passes Telecommunications Act Amendment Regulating Satellite Spectrum Allocation Fees",
    source: "Parliament Hansard Bureau",
    bias: "center",
    url: "https://sansad.in/ls",
    timestamp: "28 mins ago",
    category: "PARLIAMENT",
    institution: "Parliament",
    status: "Verified",
    relatedStoryId: "gdp-growth-japan-surpass"
  },
  {
    id: "wire-3",
    title: "RBI Keeps Benchmark Repo Rate Unchanged at 6.50% Citing Food Inflation Sensitivity",
    source: "Reserve Bank of India Press Note",
    bias: "center",
    url: "https://rbi.org.in",
    timestamp: "45 mins ago",
    category: "RBI",
    institution: "RBI",
    status: "Verified",
    relatedStoryId: "rbi-dividend-payout-2026"
  },
  {
    id: "wire-4",
    title: "Election Commission Announces Polling Dates for Bihar & Assembly By-Elections with EVM Audit VVPAT Verification",
    source: "ECI Bulletin",
    bias: "center",
    url: "https://eci.gov.in",
    timestamp: "1 hour ago",
    category: "ELECTION COMMISSION",
    institution: "Election Commission",
    status: "Verified"
  },
  {
    id: "wire-5",
    title: "Government Sanctions ₹8,500 Crore National Quantum Computing Mission Infrastructure in Bengaluru and Hyderabad",
    source: "PIB Delhi",
    bias: "center",
    url: "https://pib.gov.in",
    timestamp: "2 hours ago",
    category: "TECHNOLOGY",
    institution: "Government",
    status: "Verified",
    relatedStoryId: "regional-tamil-nadu-semiconductor-design"
  },
  {
    id: "wire-6",
    title: "India-European Union Free Trade Negotiations Reach Final Phase on Carbon Border Tax Adjustments",
    source: "Ministry of External Affairs",
    bias: "center",
    url: "https://mea.gov.in",
    timestamp: "3 hours ago",
    category: "GOVERNMENT",
    institution: "Government",
    status: "Developing"
  }
];

export const FALLBACK_FACT_CHECKS: FactCheckClaim[] = [
  {
    id: "fc-1",
    claim: "Narendra Modi is an opposition leader in the Indian Parliament.",
    verdict: "FALSE",
    verdictDetail: "As of 2026, Narendra Modi is the Prime Minister of India, leading the National Democratic Alliance (NDA) government following the 2024 general elections. The official Leader of the Opposition in the Lok Sabha is Rahul Gandhi of the Indian National Congress.",
    officialSource: "Lok Sabha Secretariat / Parliament Gazette",
    evidencePoints: [
      "Sworn in as Prime Minister of India on June 9, 2024 for his third consecutive term.",
      "Official Leader of the Opposition in the 18th Lok Sabha is Rahul Gandhi.",
      "Union Cabinet gazette notifications affirm NDA ministry executive leadership."
    ],
    historicalContext: "The Leader of the Opposition is a statutory post recognized under the Salary and Allowances of Leaders of Opposition in Parliament Act, 1977.",
    confidenceScore: 99
  },
  {
    id: "fc-2",
    claim: "The RBI dividend transfer to the Union Government dilutes the central bank's Contingency Risk Buffer below regulatory norms.",
    verdict: "FALSE",
    verdictDetail: "Official RBI Central Board minutes confirm that the Contingency Risk Buffer was maintained at 6.50% of the balance sheet, which sits at the maximum ceiling of the 5.5%–6.5% risk parameter recommended by the Bimal Jalan Economic Capital Framework committee.",
    officialSource: "Reserve Bank of India Annual Financial Statement FY25",
    evidencePoints: [
      "Contingency Risk Buffer set at 6.50% (maximum statutory allowance).",
      "Surplus transfer calculated strictly after deducting provisions for risk assets and balance sheet revaluation.",
      "Complies fully with Bimal Jalan Committee ECF guidelines."
    ],
    historicalContext: "The Economic Capital Framework was updated in 2019 following the Jalan Committee recommendations to establish objective, rule-based surplus transfers.",
    confidenceScore: 96
  },
  {
    id: "fc-3",
    claim: "The Supreme Court 9-judge bench completely banned state acquisition of private land for public infrastructure.",
    verdict: "PARTIALLY VERIFIED",
    verdictDetail: "The Supreme Court ruled that private property cannot *automatically* be presumed to be a 'material resource of the community' under Article 39(b). However, the Court explicitly clarified that the state *can* acquire private property if it satisfies specific statutory guidelines and public interest thresholds under lawful eminent domain.",
    officialSource: "Supreme Court Judgment Reporter (Civil Appeal No. 4011/1983)",
    evidencePoints: [
      "Dismantled the 1978 socialist presumption that all private wealth belongs to community pool.",
      "Preserved state eminent domain powers provided procedural safeguards and fair compensation are met.",
      "Delivered a 7-2 majority decision with nuanced guidelines for community asset classification."
    ],
    historicalContext: "Article 39(b) of the Directive Principles instructs the State to direct policy toward distributing material resources to serve the common good.",
    confidenceScore: 94
  }
];
