/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TFunction } from 'i18next';
import type { DomainScoreSnapshot, StrengthTheme } from '../types';

export interface ReportExportInput {
  topThemes: StrengthTheme[];
  domainScores: DomainScoreSnapshot[];
  aiReport: string | null;
  language: string;
  model?: string;
  generatedAt?: number;
  t: TFunction;
}

function formatTimestamp(ms: number, language: string): string {
  const locale = language.startsWith('en') ? 'en-US' : 'zh-CN';
  return new Date(ms).toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

export function buildReportMarkdown(input: ReportExportInput): string {
  const { topThemes, domainScores, aiReport, language, model, generatedAt, t } = input;

  const themeName = (name: string) =>
    t(`strengths:themes.${name}.name` as any, { defaultValue: name }) as string;
  const domainName = (domain: string) =>
    t(`common:domains.${domain}` as any, { defaultValue: domain }) as string;

  const generatedAtMs = generatedAt ?? Date.now();

  const lines: string[] = [];
  lines.push(`# ${t('results:exportDocTitle')}`);
  lines.push('');
  lines.push(`**${t('results:exportFieldGeneratedAt')}**: ${formatTimestamp(generatedAtMs, language)}`);
  lines.push(`**${t('results:exportFieldLanguage')}**: ${language}`);
  if (model) {
    lines.push(`**${t('results:exportFieldModel')}**: ${model}`);
  }
  lines.push('');

  lines.push(`## ${t('results:exportSectionTopThemes')}`);
  lines.push('');
  lines.push(
    `| ${t('results:exportTableRank')} | ${t('results:exportTableTheme')} | ${t('results:exportTableDomain')} |`,
  );
  lines.push('| --- | --- | --- |');
  topThemes.forEach((theme, index) => {
    lines.push(
      `| ${index + 1} | ${escapeCell(themeName(theme.name))} | ${escapeCell(domainName(theme.domain))} |`,
    );
  });
  lines.push('');

  lines.push(`## ${t('results:exportSectionDomainScores')}`);
  lines.push('');
  lines.push(
    `| ${t('results:exportTableDomain')} | ${t('results:exportTableScore')} | ${t('results:exportTableMax')} |`,
  );
  lines.push('| --- | --- | --- |');
  domainScores.forEach((row) => {
    lines.push(
      `| ${escapeCell(domainName(row.domain))} | ${row.value.toFixed(1)} | ${row.full} |`,
    );
  });
  lines.push('');

  lines.push(`## ${t('results:exportSectionAdvisorReport')}`);
  lines.push('');
  if (aiReport && aiReport.trim().length > 0) {
    lines.push(aiReport.trim());
  } else {
    lines.push(`_${t('results:exportNoAiReport')}_`);
  }
  lines.push('');

  return lines.join('\n');
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function downloadReportMarkdown(input: ReportExportInput): void {
  const markdown = buildReportMarkdown(input);
  // 加 UTF-8 BOM：部分移动端阅读器（微信内置/文件管理器）不识别 MIME charset，
  // 无 BOM 时会按 GBK 解码导致中文乱码。
  const blob = new Blob(['﻿', markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `strengths-report-${todayIsoDate()}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
