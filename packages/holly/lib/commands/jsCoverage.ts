/**
 * Copyright 2017 Google Inc. All rights reserved.
 * Modifications copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CRSession } from "playwright-core/lib/chromium/crConnection";
import {
  assert,
  debugError,
  helper,
  RegisteredListener
} from "playwright-core/lib/helper";
import { Protocol } from "playwright-core/lib/chromium/protocol";

import { EVALUATION_SCRIPT_URL } from "playwright-core/lib/chromium/crExecutionContext";
import { Page } from "playwright-core/lib/page";
import * as types from "playwright-core/lib/types";

type CoverageEntry = {
  url: string;
  text: string;
  entry: any;
};

export class CRCoverage {
  private _jsCoverage: JSCoverage;

  constructor(page: Page) {
    this._jsCoverage = new JSCoverage(page);
  }

  async startJSCoverage(options?: types.JSCoverageOptions) {
    return await this._jsCoverage.start(options);
  }

  async stopJSCoverage(): Promise<CoverageEntry[]> {
    return await this._jsCoverage.stop();
  }
}

class JSCoverage {
  _client: CRSession;
  _enabled: boolean;
  _scriptURLs: Map<string, string>;
  _scriptSources: Map<string, string>;
  _eventListeners: RegisteredListener[];
  _resetOnNavigation: boolean;
  _reportAnonymousScripts = false;

  constructor(page: Page) {
    // @ts-ignore
    const client = page._delegate._client;
    if (!client) {
      throw new Error("unable to get client");
    }
    this._client = client;
    this._enabled = false;
    this._scriptURLs = new Map();
    this._scriptSources = new Map();
    this._eventListeners = [];
    this._resetOnNavigation = false;
  }

  async start(options: types.JSCoverageOptions = {}) {
    assert(!this._enabled, "JSCoverage is already enabled");
    const {
      resetOnNavigation = true,
      reportAnonymousScripts = false
    } = options;
    this._resetOnNavigation = resetOnNavigation;
    this._reportAnonymousScripts = reportAnonymousScripts;
    this._enabled = true;
    this._scriptURLs.clear();
    this._scriptSources.clear();
    this._eventListeners = [
      helper.addEventListener(
        this._client,
        "Debugger.scriptParsed",
        this._onScriptParsed.bind(this)
      ),
      helper.addEventListener(
        this._client,
        "Runtime.executionContextsCleared",
        this._onExecutionContextsCleared.bind(this)
      )
    ];
    this._client.on("Debugger.paused", () =>
      this._client.send("Debugger.resume")
    );
    await Promise.all([
      this._client.send("Profiler.enable"),
      this._client.send("Profiler.startPreciseCoverage", {
        callCount: true,
        detailed: true
      }),
      this._client.send("Debugger.enable"),
      this._client.send("Debugger.setSkipAllPauses", { skip: true })
    ]);
  }

  _onExecutionContextsCleared() {
    if (!this._resetOnNavigation) return;
    this._scriptURLs.clear();
    this._scriptSources.clear();
  }

  async _onScriptParsed(event: Protocol.Debugger.scriptParsedPayload) {
    // Ignore playwright-injected scripts
    if (event.url === EVALUATION_SCRIPT_URL) return;
    // Ignore other anonymous scripts unless the reportAnonymousScripts option is true.
    if (!event.url && !this._reportAnonymousScripts) return;
    try {
      const response = await this._client.send("Debugger.getScriptSource", {
        scriptId: event.scriptId
      });
      this._scriptURLs.set(event.scriptId, event.url);
      this._scriptSources.set(event.scriptId, response.scriptSource);
    } catch (e) {
      // This might happen if the page has already navigated away.
      debugError(e);
    }
  }

  async stop(): Promise<CoverageEntry[]> {
    assert(this._enabled, "JSCoverage is not enabled");
    this._enabled = false;
    const [profileResponse] = await Promise.all([
      this._client.send("Profiler.takePreciseCoverage"),
      this._client.send("Profiler.stopPreciseCoverage"),
      this._client.send("Profiler.disable"),
      this._client.send("Debugger.disable")
    ] as const);
    helper.removeEventListeners(this._eventListeners);

    const coverage = [];
    for (const entry of profileResponse.result) {
      let url = this._scriptURLs.get(entry.scriptId);
      if (!url && this._reportAnonymousScripts)
        url = "debugger://VM" + entry.scriptId;
      const text = this._scriptSources.get(entry.scriptId);
      if (text === undefined || url === undefined) continue;
      coverage.push({ url, text, entry });
    }
    return coverage;
  }
}
