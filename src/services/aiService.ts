import { StrengthTheme } from '../types';
import { AIConfig, loadAIConfig } from './aiConfig';
import i18n from '../i18n';

export class AIConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIConfigError';
  }
}

function buildPrompt(topThemes: StrengthTheme[], locale: string): string {
  const isEnglish = locale.toLowerCase().startsWith('en');
  const themeNames = topThemes.map((t) => t.name).join(', ');

  if (isEnglish) {
    return `Respond in English.

You are a senior Gallup-certified global strengths coach.
A user's top five strengths from our assessment are: ${themeNames}.

Based on the combination of these five strengths, write a deeply professional, inspiring, and actionable "Strengths Navigator Report" for the user.
The report should include:
1. Core Energy Profile: What unique personality or working style emerges from this combination?
2. Potential Shadows / Blind Spots: What blind spots or pitfalls might appear when these strengths are overused?
3. Workplace Application: How can the user leverage these strengths in collaboration, communication, and execution?
4. One Small Action for the Week: Give one or two concrete, simple actions the user can start applying this week.

The tone should be warm, professional, and confident.`;
  }

  return `请用中文回答。

你是一名资深的盖洛普全球认证优势教练。
有一名用户在我们的测评中得出的前五大优势是：${themeNames}。

请基于这五个优势的组合，为用户提供一份极其专业、充满启发性且具有实操价值的"优势导航报告"。
报告应包含以下几个部分：
1. 核心能量特质：这五个优势组合在一起展现出了什么样的独特人格魅力或工作风格？
2. 潜在阴影/软肋：这种组合在过度使用时可能会遇到什么盲点？
3. 职场应用建议：在团队合作、沟通以及任务执行方面，用户该如何发挥这些优势？
4. 开启下一周的小行动：给用户一两个简单具体的建议，让他本周就能开始应用。

语调要温暖、专业、坚定。`;
}

function trimBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

async function callOpenAI(config: AIConfig, prompt: string): Promise<string> {
  const url = `${trimBaseUrl(config.baseUrl)}/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI request failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') throw new Error('No message.content in response');
  return content;
}

async function callAnthropic(config: AIConfig, prompt: string): Promise<string> {
  const url = `${trimBaseUrl(config.baseUrl)}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic request failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  const content = data?.content?.[0]?.text;
  if (typeof content !== 'string') throw new Error('No content[0].text in response');
  return content;
}

export async function analyzeStrengths(topThemes: StrengthTheme[], locale?: string): Promise<string> {
  const config = loadAIConfig();
  if (!config) {
    throw new AIConfigError('AI service is not configured.');
  }
  const lng = locale ?? i18n.language ?? 'zh';
  const prompt = buildPrompt(topThemes, lng);
  if (config.provider === 'anthropic') return callAnthropic(config, prompt);
  return callOpenAI(config, prompt);
}
