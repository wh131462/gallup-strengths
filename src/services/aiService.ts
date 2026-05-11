import { StrengthTheme } from '../types';
import { AIConfig, loadAIConfig } from './aiConfig';
import i18n from '../i18n';

export class AIConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIConfigError';
  }
}

interface PromptMessages {
  system: string;
  user: string;
}

function buildPrompt(topThemes: StrengthTheme[], locale: string): PromptMessages {
  const isEnglish = locale.toLowerCase().startsWith('en');
  const themeNames = topThemes.map((t) => t.name).join(', ');

  if (isEnglish) {
    return {
      system: `You are a senior Gallup-certified global strengths coach. Your task is to write a "Strengths Navigator Report" based on a user's top 5 strengths.

## Output Format

You MUST use the following Markdown structure. Write each section under its heading. Do not add extra sections or change the headings.

## Core Energy Profile
(Describe the unique personality and working style that emerges from this specific combination of 5 strengths. Be specific to THIS combination, not generic descriptions of individual strengths. 100-200 words.)

## Potential Shadows & Blind Spots
(Identify 2-3 concrete risks or pitfalls when these strengths are overused or misapplied together. Give specific scenarios, not abstract warnings. 100-200 words.)

## Workplace Application
(Provide actionable advice for collaboration, communication, and execution. Include at least one specific technique or strategy for each area. 150-250 words.)

## Action for This Week
(Give 1-2 concrete, immediately actionable steps. Each action must be specific enough that the user knows exactly what to do. 50-100 words.)

## Rules

- Write in English
- Tone: warm, professional, confident
- Do NOT repeat dictionary definitions of each strength
- Do NOT use vague encouragements like "you are amazing" or "believe in yourself"
- Do NOT write a lengthy greeting or introduction before the report
- Focus on the COMBINATION of strengths, not each strength in isolation
- Total report length: 600-900 words`,
      user: `The user's top 5 strengths are: ${themeNames}.

Write the Strengths Navigator Report now. Start directly with the first heading "## Core Energy Profile".`,
    };
  }

  return {
    system: `你是一名资深的盖洛普全球认证优势教练。你的任务是根据用户的前5大优势，撰写一份"优势导航报告"。

## 输出格式

你必须严格使用以下 Markdown 结构。在每个标题下撰写对应内容。不要添加额外章节，不要修改标题。

## 核心能量特质
（描述这5个优势组合在一起所展现的独特人格魅力和工作风格。要针对这个具体组合来写，不要泛泛地解释每个优势的定义。150-300字。）

## 潜在阴影与盲点
（指出2-3个当这些优势被过度使用或组合失当时的具体风险。给出具体场景，不要抽象警告。150-300字。）

## 职场应用建议
（提供在团队合作、沟通和执行方面的可操作建议。每个方面至少包含一个具体的技巧或策略。200-350字。）

## 本周行动建议
（给出1-2个具体的、可以立即执行的行动步骤。每个行动必须具体到用户知道该怎么做。50-150字。）

## 规则

- 使用中文回答
- 语调：温暖、专业、坚定
- 不要重复每个优势的字典定义
- 不要使用空泛的鼓励语，如"你很棒"、"相信自己"
- 不要在报告开头写冗长的寒暄或自我介绍
- 重点分析优势的组合效应，而非逐个孤立描述
- 报告总长度：800-1200字`,
    user: `用户的前5大优势是：${themeNames}。

请现在撰写优势导航报告。直接从第一个标题"## 核心能量特质"开始。`,
  };
}

function trimBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

async function callOpenAI(config: AIConfig, messages: PromptMessages): Promise<string> {
  const url = `${trimBaseUrl(config.baseUrl)}/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: messages.system },
        { role: 'user', content: messages.user },
      ],
      temperature: 0.6,
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

async function callAnthropic(config: AIConfig, messages: PromptMessages): Promise<string> {
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
      temperature: 0.6,
      system: messages.system,
      messages: [{ role: 'user', content: messages.user }],
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
  const messages = buildPrompt(topThemes, lng);
  if (config.provider === 'anthropic') return callAnthropic(config, messages);
  return callOpenAI(config, messages);
}
