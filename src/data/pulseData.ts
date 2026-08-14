export interface CitizenBlog {
  id: string;
  title: string;
  author: string;
  category: string;
  body: string;
  date: string;
  stance: "left" | "center" | "right";
  tags: string[];
  upvotes: number;
  highlightedPhrase: string;
}

export const PRESET_BLOGS: CitizenBlog[] = [
  {
    id: "b1",
    title: "The Electronics Supply Chain Calculus: Navigating Chip Subsidies at Dholera",
    author: "Dr. Aravind Swaminathan (Policy Analyst)",
    category: "Technology",
    body: "The central government's ₹76,000 crore semiconductor incentive scheme represents an audacious bet on high-tech sovereignty. However, as independent analysts, we must inspect the risk-sharing profile. The current construct offsets up to 50% of capital hardware expenditures using taxpayer funds, yet the underlying intellectual property (IP) remains locked inside private global corporate vaults. To truly cultivate an 'Atmanirbhar' technology ecosystem, capital subsidies should mandatorily be bound to open-sourcing local processor variations or funding Indian research labs.",
    date: "Jul 27, 2026",
    stance: "left",
    tags: ["Semiconductors", "Taxpayer Risk", "Atmanirbhar"],
    upvotes: 42,
    highlightedPhrase: "as independent analysts, we must inspect the risk-sharing profile and open-source IP returns."
  },
  {
    id: "b2",
    title: "Decoupling Judicial Definitions: Sovereign Resource Distribution Post-39(b)",
    author: "Meera Sen (Constitutional Researcher)",
    category: "Supreme Court",
    body: "The landmark Supreme Court verdict regarding Article 39(b) marks the official end of socialist-era judicial overreaches that categorized all private assets as public inventory. This provides critical statutory safety for industrial growth and capital expansion. By ruling that the state cannot arbitrarily override private asset protections, the bench has restored constitutional equilibrium.",
    date: "Jul 24, 2026",
    stance: "right",
    tags: ["Supreme Court", "Private Enterprise", "Economic Safety"],
    upvotes: 56,
    highlightedPhrase: "restored critical constitutional equilibrium and private asset protection models."
  },
  {
    id: "b3",
    title: "Surplus Transfers and Capital Autonomy: The Statistical RBI Analysis",
    author: "Rohan Kapoor (Financial Strategist)",
    category: "RBI",
    body: "The Reserve Bank of India's surplus transfer of ₹2.11 lakh crore offers a massive boost to the central government's ledger. From a neutral economic stance, this payout complies with the robust capital index guidelines updated by the Jalan Committee. While critics express anxiety over padding ratios, the bank's core emergency capital buffer remains firmly at 6.5%, well above the recommended 5.5% regulatory floor.",
    date: "Jul 25, 2026",
    stance: "center",
    tags: ["RBI Surplus", "Jalan Committee", "Fiscal Balance"],
    upvotes: 29,
    highlightedPhrase: "bank's core emergency capital buffer remains firmly at 6.5%, well above the 5.5% floor."
  }
];
