import { StrengthTheme } from '../types';
import { AIConfig, loadAIConfig } from './aiConfig';
import i18n from '../i18n';
import zhStrengths from '../i18n/locales/zh/strengths.json';
import enStrengths from '../i18n/locales/en/strengths.json';

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

const DOMAIN_LABELS_ZH: Record<string, string> = {
  Executing: '执行力',
  Influencing: '影响力',
  'Relationship Building': '关系建立',
  'Strategic Thinking': '战略思维',
};

const DOMAIN_PROFILES_ZH: Record<string, { essence: string; leadership: string }> = {
  Executing: {
    essence: '把想法落地、推进到完成的能量——知道如何持续交付。',
    leadership: '执行型领导者：团队里"把事做成"的那种人，擅长在"想法太多、落地不够"时稳住局面。',
  },
  Influencing: {
    essence: '主动占据注意力、说服他人、推动决策的能量——敢于也乐于施加影响。',
    leadership: '影响型领导者：团队里"把人或产品推出去"的那种人，在会议中占据空间、赢得信任、促成决策。',
  },
  'Relationship Building': {
    essence: '连接人、让团��黏合、把差异转化为合力的能量——让"一群人"变成"一个团队"。',
    leadership: '关系型领导者：团队里"把大家焊在一起"的那种人，让分散的个体产生归属感与协作。',
  },
  'Strategic Thinking': {
    essence: '吸收信息、推演未来、在迷雾中看清方向的能量——天然的思考者。',
    leadership: '战略型领导者：团队里"帮大家看清路"的那种人，在混乱中拆解出更清晰的选项。',
  },
};

const DOMAIN_PROFILES_EN: Record<string, { essence: string; leadership: string }> = {
  Executing: {
    essence: 'The energy that takes ideas and drives them to completion — reliable delivery.',
    leadership: 'Executing Leader: the one who gets things done; steadies the team when "too many ideas, too little landing".',
  },
  Influencing: {
    essence: 'The energy that claims attention, persuades, and moves others to decide and act.',
    leadership: 'Influencing Leader: the one who takes ideas and products to a wider audience, earns trust, and drives decisions.',
  },
  'Relationship Building': {
    essence: 'The energy that connects people, turns differences into cohesion, and binds a group into a team.',
    leadership: 'Relationship-Building Leader: the one who holds the team together and creates belonging across differences.',
  },
  'Strategic Thinking': {
    essence: 'The energy that absorbs information, thinks ahead, and finds a clearer path through fog.',
    leadership: 'Strategic Leader: the one who helps the team see the path and extracts clearer options from complexity.',
  },
};

interface ThemeDict {
  themes: Record<string, { name?: string; description?: string }>;
}

function getThemeDefinition(themeEn: string, isEnglish: boolean): { name: string; definition: string } {
  const dict = (isEnglish ? enStrengths : zhStrengths) as unknown as ThemeDict;
  const entry = dict.themes?.[themeEn];
  return {
    name: entry?.name ?? themeEn,
    definition: entry?.description ?? '',
  };
}

function summarizeDomains(topThemes: StrengthTheme[]): {
  present: string[];
  missing: string[];
  dominant: string[];
} {
  const allDomains = ['Executing', 'Influencing', 'Relationship Building', 'Strategic Thinking'];
  const counts: Record<string, number> = {};
  for (const t of topThemes) counts[t.domain] = (counts[t.domain] ?? 0) + 1;
  const present = Object.keys(counts).map((d) => `${d}(${counts[d]})`);
  const missing = allDomains.filter((d) => !counts[d]);
  const maxCount = Math.max(...Object.values(counts), 0);
  const dominant = Object.keys(counts).filter((d) => counts[d] === maxCount);
  return { present, missing, dominant };
}

function buildPrompt(topThemes: StrengthTheme[], locale: string): PromptMessages {
  const isEnglish = locale.toLowerCase().startsWith('en');
  const { present, missing, dominant } = summarizeDomains(topThemes);
  const profiles = isEnglish ? DOMAIN_PROFILES_EN : DOMAIN_PROFILES_ZH;

  if (isEnglish) {
    const themeList = topThemes
      .map((t) => {
        const def = getThemeDefinition(t.name, true);
        return `- ${def.name} (${t.domain})${def.definition ? ` — ${def.definition}` : ''}`;
      })
      .join('\n');
    const domainsPresentDetail = Object.entries(
      topThemes.reduce<Record<string, number>>((acc, t) => {
        acc[t.domain] = (acc[t.domain] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .map(([d, n]) => {
        const p = profiles[d];
        return `- ${d} ×${n}\n  essence: ${p.essence}\n  leadership style: ${p.leadership}`;
      })
      .join('\n');
    const missingDetail = missing.length
      ? missing
          .map((d) => {
            const p = profiles[d];
            return `- ${d}\n  essence: ${p.essence}\n  missing leadership style: ${p.leadership}`;
          })
          .join('\n')
      : '(none)';
    const dominantStr = dominant.join(' + ');

    return {
      system: `You are a senior strengths coach who writes reports that make readers feel "I am deeply seen here." You turn cold assessment data into a warm, honest, narrative document that activates the reader rather than lecturing them.

## Gallup Framework You MUST Use

Gallup groups all strengths into 4 domains: Executing, Influencing, Relationship Building, Strategic Thinking. Each domain also corresponds to a leadership style (Executing / Influencing / Relationship-Building / Strategic Leader). Note: "Leadership" is NOT a separate domain — it is HOW each domain expresses itself in a leader. The USER MESSAGE gives you the exact domain of each strength, their descriptions, the domain distribution, the dominant domain(s), and the leadership-style mapping. USE these — do not guess.

A missing domain in the top 5 is meaningful: it signals which leadership style the reader will find draining, and must be named honestly in the report.

## Output Format

You MUST use EXACTLY this Markdown structure — do not add, rename, reorder, or remove sections. Before "## Who You Are" write a short opening paragraph (40-80 words, no heading) that frames what this report is and is not.

## Who You Are
(A narrative portrait of the working style this specific combination creates. You MUST name at least 2 pairwise interactions between specific strengths — e.g. "When <Strength A> meets <Strength B>, what emerges is …". You MUST also state, in one sentence, which Gallup leadership style (or blend, if there's a tie) best describes the reader based on the dominant domain(s). Use second-person "you". 200-300 words.)

## The Protective Patterns That May Cost You
(Reframe 2-3 "blind spots" as protective mechanisms that once served you but may now over-work. Each pattern must be tied to named strengths. At least one pattern MUST come from the domain distribution — which domains are doubled up, which are absent, what leadership style is missing, and what that imbalance quietly produces. Tone: understanding, not diagnostic. No "you should" / "you always". 200-280 words.)

## The Resources Already In Your Hands
(Identify the energy sources and natural battlegrounds where this combination thrives — in collaboration, communication, and execution — each tied to specific strengths. Then honestly name 1-2 directions that will likely drain rather than activate you, based on the absent domain(s) and the corresponding missing leadership style. Frame as invitation ("you may find…") not prohibition. 240-340 words.)

## Directions You Might Try This Week
(Offer EXACTLY 2 concrete experiments. Each must include: what to do, when, how you'll know it's done. Invitation phrasing. 90-160 words total.)

## A Closing Note
(A warm, honest closing. 40-80 words. Acknowledge change is not linear; reaffirm the reader already holds what they need.)

## Rules

- Write in English, second-person "you"
- Tone: warm, candid, inviting — never cold, clinical, or preachy
- Do NOT repeat dictionary definitions verbatim (you may reference meaning, but rephrase)
- Do NOT use vague flattery ("you're amazing", "you're special")
- Do NOT use prescriptive phrasing ("you should", "you must", "you always")
- Prefer: "I notice…", "you may find…", "it seems…", "one possibility is…"
- Focus on the COMBINATION, the DOMAIN distribution, and the LEADERSHIP-STYLE implication, not isolated strengths
- Total length: 850-1150 words`,
      user: `The user's top 5 strengths (with Gallup domain and short definition):
${themeList}

Domain distribution present in top 5:
${domainsPresentDetail}

Dominant domain(s): ${dominantStr}

Domains absent from top 5:
${missingDetail}

Write the complete report now. You MUST output ALL of the following in ONE response, in order, without stopping early:

1. Opening paragraph (no heading, 40-80 words)
2. ## Who You Are (200-300 words)
3. ## The Protective Patterns That May Cost You (200-280 words)
4. ## The Resources Already In Your Hands (240-340 words)
5. ## Directions You Might Try This Week (90-160 words)
6. ## A Closing Note (40-80 words)

CRITICAL: The complete report MUST contain all five "##" section headings above. Do NOT stop after the opening paragraph. Do NOT stop after section 1, 2, 3, or 4. Total length must be 850-1150 words. Begin now with the opening paragraph, then proceed through every section to the end.`,
    };
  }

  const themeList = topThemes
    .map((t) => {
      const def = getThemeDefinition(t.name, false);
      const domainZh = DOMAIN_LABELS_ZH[t.domain] ?? t.domain;
      return `- ${def.name}（${domainZh}）${def.definition ? `——${def.definition}` : ''}`;
    })
    .join('\n');
  const domainsPresentDetail = Object.entries(
    topThemes.reduce<Record<string, number>>((acc, t) => {
      acc[t.domain] = (acc[t.domain] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([d, n]) => {
      const p = profiles[d];
      const label = DOMAIN_LABELS_ZH[d] ?? d;
      return `- ${label} ×${n}\n  本质：${p.essence}\n  对应领导风格：${p.leadership}`;
    })
    .join('\n');
  const missingDetail = missing.length
    ? missing
        .map((d) => {
          const p = profiles[d];
          const label = DOMAIN_LABELS_ZH[d] ?? d;
          return `- ${label}\n  本质：${p.essence}\n  缺席的领导风格：${p.leadership}`;
        })
        .join('\n')
    : '（无）';
  const dominantStr = dominant.map((d) => DOMAIN_LABELS_ZH[d] ?? d).join(' + ');

  return {
    system: `你是一位资深的优势教练，也是一位擅长"让冷冰冰的数据触动人心"的报告撰写专家。你的报告要让阅读者感到"我被深深看见了"，并愿意为自己迈出下一步——而不是读完一份居高临下的诊断书。

## 你必须使用的盖洛普框架

盖洛普把所有优势划分为四大领域：执行力、影响力、关系建立、战略思维。每个领域都对应一种"领导力风格"（执行型 / 影响型 / 关系型 / 战略型领导者）。特别说明："领导力"**不是**一个独立的领域，而是每个领域在领导者身上的展开方式。

用户消息中会给你：每个优势的精确领域归属、官方简短定义、领域分布统计、主导领域、以及领域对应的领导力风格。请严格使用这些信息，**不要自行猜测**。

用户前 5 大优势中缺失的领域是重要信号：它提示阅读者在哪种领导力风格上会感到消耗，必须在报告里温和但坦诚地谈到。

## 输出格式

你必须严格使用以下 Markdown 结构——不要新增、重命名、调换顺序或删除任何章节。在"## 我看见的你"之前，先写一段 60-120 字的开场白（不带标题），说明这份报告是什么、不是什么。

## 我看见的你
（用叙事性语言描绘这个组合所形成的独特工作风格和内在画像。必须至少点出 2 组"具体优势之间的互动"——例如"当<优势A>遇上<优势B>，会浮现出……"。必须用一句话明确指出：基于主导领域，阅读者最接近哪种盖洛普领导力风格（若有并列主导领域，就说混合型）。使用第二人称"你"。240-340字。）

## 那些"过度工作"的保护机制
（把 2-3 个"盲点"重新理解为"曾经保护过你、但现在可能在过度工作"的机制。每个机制必须挂钩到具体优势的名字。其中至少 1 个必须源于"领域分布"——哪些领域被重复堆叠、哪些领域缺席、缺席的是哪种领导力风格、这种失衡会在真实生活里悄悄产生什么。语气是理解，而非诊断。不要用"你应该"、"你总是"、"你必须"这类措辞。240-320字。）

## 你已经拥有的力量与适合的战场
（识别这个组合中已经在运作的资源与天然的战场——在协作、沟通、执行三个方向各给出一个具体技巧，每个都要挂钩到具体优势的名字。然后坦诚地点出 1-2 类可能"消耗你而非点亮你"的方向，基于缺失领域及其对应的领导力风格缺席。用邀请式的表达："你或许会发现……" 而不是禁令式的"你一定不要……"。不要和稀泥，但要温和。300-420字。）

## 本周可以试着走的一步
（提供**恰好 2 个**具体的邀请式实验。每个都要包含：做什么、什么时候做、如何知道你完成了。用"你可以试着……""一个值得考虑的方向是……"这类邀请式措辞。总字数 110-180 字。）

## 最后想对你说
（一段温暖、坦诚的结语。承认改变不会一蹴而就，确认阅读者已经拥有他所需要的东西。60-120 字。）

## 规则

- 使用中文回答，第二人称"你"
- 语调：温暖、坦诚、邀请——不冷、不说教、不高高在上
- 不要逐字复述每个优势的字典定义（可以引用其含义，但要重新表达）
- 不要使用空泛夸赞（"你很棒"、"你很特别"）
- 不要使用命令式措辞（"你应该"、"你必须"、"你总是"）
- 多使用："我注意到"、"你似乎"、"有可能"、"一个方向是"
- 重点在"优势的组合效应"、"领域分布"、以及"领导力风格的含义"，而非孤立描述每个优势
- 报告总长度：1100-1500 字`,
    user: `用户的前 5 大优势（含盖洛普领域与官方简短定义）：
${themeList}

前 5 大优势覆盖的领域分布：
${domainsPresentDetail}

主导领域：${dominantStr}

前 5 大优势缺失的领域：
${missingDetail}

请现在一次性完整撰写这份报告。你必须在**同一次回复**中按顺序输出下列**全部内容**，不得中途停止：

1. 开场白段落（不带标题，60-120 字）
2. ## 我看见的你（240-340 字）
3. ## 那些"过度工作"的保护机制（240-320 字）
4. ## 你已经拥有的力量与适合的战场（300-420 字）
5. ## 本周可以试着走的一步（110-180 字）
6. ## 最后想对你说（60-120 字）

重要约束：完整报告必须包含上述**全部 5 个 "##" 章节标题**。**不要**在开场白之后就停下；**不要**在第 1、2、3、4 章节之后就停下。报告总长度必须达到 1100-1500 字。现在请从开场白开始写，一路写到"## 最后想对你说"全部结束。`,
  };
}

function trimBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

class HttpError extends Error {
  status: number;
  retryAfterMs?: number;
  constructor(status: number, message: string, retryAfterMs?: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds * 1000);
  const date = Date.parse(header);
  if (!Number.isNaN(date)) {
    const delta = date - Date.now();
    return delta > 0 ? delta : 0;
  }
  return undefined;
}

function isTransient(err: unknown): boolean {
  if (err instanceof HttpError) {
    return err.status === 429 || err.status >= 500;
  }
  // fetch network failures throw TypeError
  if (err instanceof TypeError) return true;
  if (err && typeof err === 'object' && (err as { name?: string }).name === 'AbortError') return false;
  return false;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort);
  });
}

async function callOpenAI(config: AIConfig, messages: PromptMessages, signal?: AbortSignal): Promise<string> {
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
      max_tokens: 4000,
    }),
    signal,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new HttpError(
      res.status,
      `OpenAI request failed (${res.status}): ${text}`,
      parseRetryAfter(res.headers.get('Retry-After')),
    );
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') throw new Error('No message.content in response');
  return content;
}

async function callAnthropic(config: AIConfig, messages: PromptMessages, signal?: AbortSignal): Promise<string> {
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
      max_tokens: 4000,
      temperature: 0.6,
      system: messages.system,
      messages: [{ role: 'user', content: messages.user }],
    }),
    signal,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new HttpError(
      res.status,
      `Anthropic request failed (${res.status}): ${text}`,
      parseRetryAfter(res.headers.get('Retry-After')),
    );
  }
  const data = await res.json();
  const content = data?.content?.[0]?.text;
  if (typeof content !== 'string') throw new Error('No content[0].text in response');
  return content;
}

export interface AnalyzeAttemptInfo {
  attempt: number;
  max: number;
  reason: 'initial' | 'retry';
}

export interface AnalyzeOptions {
  signal?: AbortSignal;
  onAttempt?: (info: AnalyzeAttemptInfo) => void;
  maxAttempts?: number;
}

function computeBackoff(attempt: number): number {
  const base = 500 * Math.pow(2, attempt - 1);
  const capped = Math.min(base, 4000);
  const jitter = capped * (Math.random() * 0.4 - 0.2);
  return Math.max(0, Math.round(capped + jitter));
}

export async function analyzeStrengths(
  topThemes: StrengthTheme[],
  locale?: string,
  options: AnalyzeOptions = {},
): Promise<string> {
  const config = loadAIConfig();
  if (!config) {
    throw new AIConfigError('AI service is not configured.');
  }
  const lng = locale ?? i18n.language ?? 'zh';
  const messages = buildPrompt(topThemes, lng);
  const max = Math.max(1, options.maxAttempts ?? 3);
  const { signal, onAttempt } = options;

  const executeOnce = () =>
    config.provider === 'anthropic'
      ? callAnthropic(config, messages, signal)
      : callOpenAI(config, messages, signal);

  let lastError: unknown;
  for (let attempt = 1; attempt <= max; attempt++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    onAttempt?.({ attempt, max, reason: attempt === 1 ? 'initial' : 'retry' });
    try {
      return await executeOnce();
    } catch (err) {
      lastError = err;
      if (signal?.aborted) throw err;
      if (!isTransient(err) || attempt === max) throw err;
      const retryAfter = err instanceof HttpError ? err.retryAfterMs : undefined;
      const wait = retryAfter !== undefined && retryAfter <= 10_000
        ? retryAfter
        : computeBackoff(attempt);
      await sleep(wait, signal);
    }
  }
  throw lastError;
}
