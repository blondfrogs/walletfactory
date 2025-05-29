const fs = require("fs");
const path = require("path");

const BLOCK_FILE = path.join(__dirname, "../data/lastScannedBlocks.json");

function loadLastScannedBlocks() {
  try {
    return JSON.parse(fs.readFileSync(BLOCK_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveLastScannedBlocks(data) {
  fs.writeFileSync(BLOCK_FILE, JSON.stringify(data, null, 2));
}

function getLastBlock(chain) {
  const blocks = loadLastScannedBlocks();
  return blocks[chain] || 0;
}

function updateLastBlock(chain, blockNumber) {
  const blocks = loadLastScannedBlocks();
  blocks[chain] = blockNumber;
  saveLastScannedBlocks(blocks);
}

module.exports = {
  getLastBlock,
  updateLastBlock,
};
