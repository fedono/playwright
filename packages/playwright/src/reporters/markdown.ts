import fs from 'fs';
import path from 'path';
import type { FullResult, TestCase } from '../../types/testReporter';
import { resolveReporterOutputPath } from '../util';
import { BaseReporter, formatTestTitle } from './base';

type MarkdownReporterOptions = {
  configDir: string,
  outputFile?: string;
};


class MarkdownReporter extends BaseReporter {
  private _options: MarkdownReporterOptions;

  constructor(options: MarkdownReporterOptions) {
    super();
    this._options = options;
  }

  override printsToStdio() {
    return false;
  }

  override async onEnd(result: FullResult) {
    await super.onEnd(result);
    const summary = this.generateSummary();
    const lines: string[] = [];
    if (summary.fatalErrors.length)
      lines.push(`**${summary.fatalErrors.length} fatal errors, not part of any test**`);
    if (summary.unexpected.length) {
      lines.push(`**${summary.unexpected.length} failed**`);
      this._printTestList(':x:', summary.unexpected, lines);
    }
    if (summary.flaky.length) {
      lines.push(`<details>`);
      lines.push(`<summary><b>${summary.flaky.length} flaky</b></summary>`);
      this._printTestList(':warning:', summary.flaky, lines, ' <br/>');
      lines.push(`</details>`);
      lines.push(``);
    }
    if (summary.interrupted.length) {
      lines.push(`<details>`);
      lines.push(`<summary><b>${summary.flaky.length} interrupted</b></summary>`);
      this._printTestList(':warning:', summary.interrupted, lines, ' <br/>');
      lines.push(`</details>`);
      lines.push(``);
    }
    const skipped = summary.skipped ? `, ${summary.skipped} skipped` : '';
    const didNotRun = summary.didNotRun ? `, ${summary.didNotRun} did not run` : '';
    lines.push(`**${summary.expected} passed${skipped}${didNotRun}**`);
    lines.push(`:heavy_check_mark::heavy_check_mark::heavy_check_mark:`);
    lines.push(``);

    const reportFile = resolveReporterOutputPath('report.md', this._options.configDir, this._options.outputFile);
    await fs.promises.mkdir(path.dirname(reportFile), { recursive: true });
    await fs.promises.writeFile(reportFile, lines.join('\n'));
  }

  private _printTestList(prefix: string, tests: TestCase[], lines: string[], suffix?: string) {
    for (const test of tests)
      lines.push(`${prefix} ${formatTestTitle(this.config, test)}${suffix || ''}`);
    lines.push(``);
  }
}

export default MarkdownReporter;
