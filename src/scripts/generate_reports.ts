import fs from 'fs';
import path from 'path';

const resultsPath = path.join(process.cwd(), 'source_runtime_results.json');
const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

fs.writeFileSync(path.join(process.cwd(), 'LIVE_NETWORK_TRUTH_TABLE.json'), JSON.stringify(results, null, 2));

// Generate coverage report
const coverage = {
  totalSources: results.length,
  liveSources: results.filter(r => r.currentlyLive).length,
  byLanguage: {},
  byRegion: {},
  byTier: {},
  issues: results.filter(r => !r.currentlyLive).map(r => ({
    sourceName: r.sourceName,
    url: r.url,
    failureReason: r.failureReason
  }))
};

for (const r of results) {
  coverage.byLanguage[r.language] = (coverage.byLanguage[r.language] || 0) + 1;
  coverage.byRegion[r.region] = (coverage.byRegion[r.region] || 0) + 1;
  const tier = r.tier || 'Unknown';
  coverage.byTier[tier] = (coverage.byTier[tier] || 0) + 1;
}

fs.writeFileSync(path.join(process.cwd(), 'NETWORK_COVERAGE_REPORT.json'), JSON.stringify(coverage, null, 2));

console.log("Generated LIVE_NETWORK_TRUTH_TABLE.json and NETWORK_COVERAGE_REPORT.json");
