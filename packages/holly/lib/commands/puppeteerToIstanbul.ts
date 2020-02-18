const fs = require("fs");
const mkdirp = require("mkdirp");
const path = require("path");
const v8toIstanbul = require("v8-to-istanbul");
const convertSourceMap = require("convert-source-map");

class PuppeteerToIstanbul {
  coverageInfo: Array<any>;

  constructor(coverageInfo: any) {
    this.coverageInfo = coverageInfo;
  }

  convertCoverage(coverageItem: any) {
    return [
      {
        ranges: coverageItem.ranges.map(this.convertRange),
        isBlockCoverage: true
      }
    ];
  }

  // Takes in a Puppeteer range object with start and end properties and
  // converts it to a V8 range with startOffset, endOffset, and count properties
  convertRange(range: { start: number; end: number }) {
    return {
      startOffset: range.start,
      endOffset: range.end,
      count: 1
    };
  }

  async writeIstanbulFormat({
    sourceRoot,
    servedBasePath
  }: {
    sourceRoot?: string;
    servedBasePath?: string;
  }) {
    mkdirp.sync("./.nyc_output");

    for (let index = 0; index < this.coverageInfo.length; index++) {
      const coverageInfo = this.coverageInfo[index];

      const sourceMap =
        convertSourceMap.fromSource(coverageInfo.text) ||
        convertSourceMap.fromMapFileSource(coverageInfo.text, servedBasePath);

      const script = v8toIstanbul(
        path.join(sourceRoot || "", `original_downloaded_file_${index}`),
        0,
        {
          source: coverageInfo.text,
          sourceMap
        }
      );
      await script.load();
      script.applyCoverage(coverageInfo.entry.functions);

      const istanbulCoverage = script.toIstanbul();
      Object.keys(istanbulCoverage).forEach(file => {
        if (
          file.indexOf("original_downloaded_file_") >= 0 ||
          file.indexOf("node_modules") >= 0
        ) {
          delete istanbulCoverage[file];
        }
      });

      if (Object.keys(istanbulCoverage).length > 0) {
        fs.writeFileSync(
          `./.nyc_output/out_${index}.json`,
          JSON.stringify(istanbulCoverage)
        );
      }
    }
  }
}

export default function(
  coverageInfo: any,
  options?: { sourceRoot?: string; servedBasePath?: string }
) {
  const pti = new PuppeteerToIstanbul(coverageInfo);
  return pti.writeIstanbulFormat(options || {});
}
