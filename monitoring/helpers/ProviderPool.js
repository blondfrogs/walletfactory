const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

class ProviderPool {
  constructor(freeUrls, paidUrls, persistPath = "./provider_stats.json") {
    this.persistPath = persistPath;
    this.tiers = [freeUrls, paidUrls].map((urls, tierIndex) =>
      urls.map((url) => this._wrapProvider(url, tierIndex === 0 ? "free" : "paid"))
    );
    this._loadStats();
  }

  _wrapProvider(url, type) {
    return {
      url,
      provider: new ethers.JsonRpcProvider(url),
      type,
      successCount: 0,
      failCount: 0,
      lastLatency: null,
    };
  }

  _loadStats() {
    if (fs.existsSync(this.persistPath)) {
      try {
        const saved = JSON.parse(fs.readFileSync(this.persistPath, "utf8"));
        for (const tier of this.tiers) {
          for (const entry of tier) {
            const stat = saved[entry.url];
            if (stat) {
              entry.successCount = stat.successCount;
              entry.failCount = stat.failCount;
              entry.lastLatency = stat.lastLatency;
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load provider stats:", err.message);
      }
    }
  }

  _saveStats() {
    const all = this.tiers.flat();
    const data = {};
    for (const entry of all) {
      data[entry.url] = {
        successCount: entry.successCount,
        failCount: entry.failCount,
        lastLatency: entry.lastLatency,
      };
    }
    fs.writeFileSync(this.persistPath, JSON.stringify(data, null, 2));
  }

  async call(fn) {
    for (const tier of this.tiers) {
      const sorted = tier
        .slice()
        .sort((a, b) => {
          const aScore = a.successCount - a.failCount;
          const bScore = b.successCount - b.failCount;
          const latencyDiff = (a.lastLatency || 9999) - (b.lastLatency || 9999);
          return bScore - aScore || latencyDiff;
        });

      for (const entry of sorted) {
        const start = Date.now();
        try {
          const result = await fn(entry.provider);
          entry.successCount += 1;
          entry.lastLatency = Date.now() - start;
          this._saveStats(); // Save after every successful call
          return result;
        } catch (err) {
          entry.failCount += 1;
          entry.lastLatency = Date.now() - start;
          console.warn(`[${entry.type}] Provider failed: ${entry.url}\n→ ${err.message}`);
        }
      }
    }

    this._saveStats(); // Save final stats on full failure
    throw new Error("All providers failed");
  }

  getStats() {
    return this.tiers.flat().map((p) => ({
      url: p.url,
      type: p.type,
      success: p.successCount,
      fail: p.failCount,
      latency: p.lastLatency,
    }));
  }
}

module.exports = ProviderPool;
