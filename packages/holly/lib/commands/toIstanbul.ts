import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";
import v8toIstanbul = require("v8-to-istanbul");
import convertSourceMap = require("convert-source-map");
import Debug from "debug";

const debug = Debug("holly:commands:toIstanbul");

type JSRange = {
  startOffset: number;
  endOffset: number;
  count: number;
};

type JSCoverageEntry = {
  url: string;
  source?: string;
  functions: {
    functionName: string;
    //isBlockCoverage: boolean;
    ranges: JSRange[];
  }[];
};

class ToIstanbul {
  coverageInfo: Array<JSCoverageEntry>;

  constructor(coverageInfo: Array<JSCoverageEntry>) {
    this.coverageInfo = coverageInfo;
  }

  convertCoverage(coverageItem: any) {
    return [
      {
        ranges: coverageItem.ranges.map(this.convertRange),
        isBlockCoverage: true,
      },
    ];
  }

  // Takes in a Puppeteer range object with start and end properties and
  // converts it to a V8 range with startOffset, endOffset, and count properties
  convertRange(range: { start: number; end: number }) {
    return {
      startOffset: range.start,
      endOffset: range.end,
      count: 1,
    };
  }

  async writeIstanbulFormat({
    sourceRoot,
    servedBasePath,
  }: {
    sourceRoot?: string;
    servedBasePath?: string;
  }) {
    mkdirp.sync("./.nyc_output");

    for (let index = 0; index < this.coverageInfo.length; index++) {
      const coverageInfo = this.coverageInfo[index];

      if (!coverageInfo.source) {
        debug(`skipping coverage info ${coverageInfo.url} without source`);
        continue;
      }

      let urlServedBasePath = null;
      if (servedBasePath) {
        urlServedBasePath = path.join(
          servedBasePath,
          path.dirname(new URL(coverageInfo.url).pathname)
        );
      }

      debug(
        `procesing coverage ${coverageInfo.url}, looking up paths at ${urlServedBasePath}`
      );

      const sourceMap =
        convertSourceMap.fromSource(coverageInfo.source) ||
        (urlServedBasePath &&
          convertSourceMap.fromMapFileSource(
            coverageInfo.source,
            urlServedBasePath
          ));

      if (!sourceMap) {
        debug(
          `skipping coverage info ${coverageInfo.url} without sourcemap. servedBasePath = ${servedBasePath}`
        );
        continue;
      }

      const script = v8toIstanbul(
        path.join(sourceRoot || "", `original_downloaded_file_${index}`),
        0,
        {
          source: coverageInfo.source,
          sourceMap,
        }
      );
      await script.load();
      // @ts-ignore missing isBlockCoverage in playwright types
      script.applyCoverage(coverageInfo.functions);

      const istanbulCoverage = script.toIstanbul();
      Object.keys(istanbulCoverage).forEach((file) => {
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
  coverageInfo: Array<JSCoverageEntry>,
  options?: { sourceRoot?: string; servedBasePath?: string }
) {
  const ti = new ToIstanbul(coverageInfo);
  return ti.writeIstanbulFormat(options || {});
}
