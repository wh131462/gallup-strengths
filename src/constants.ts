import { StrengthTheme } from './types';
import { questionBank } from './data/questionBank';

export const STRENGTH_THEMES: StrengthTheme[] = [
  // Executing
  { name: 'Achiever', domain: 'Executing' },
  { name: 'Arranger', domain: 'Executing' },
  { name: 'Belief', domain: 'Executing' },
  { name: 'Consistency', domain: 'Executing' },
  { name: 'Deliberative', domain: 'Executing' },
  { name: 'Discipline', domain: 'Executing' },
  { name: 'Focus', domain: 'Executing' },
  { name: 'Responsibility', domain: 'Executing' },
  { name: 'Restorative', domain: 'Executing' },

  // Influencing
  { name: 'Activator', domain: 'Influencing' },
  { name: 'Command', domain: 'Influencing' },
  { name: 'Communication', domain: 'Influencing' },
  { name: 'Competition', domain: 'Influencing' },
  { name: 'Maximizer', domain: 'Influencing' },
  { name: 'Self-Assurance', domain: 'Influencing' },
  { name: 'Significance', domain: 'Influencing' },
  { name: 'Woo', domain: 'Influencing' },

  // Relationship Building
  { name: 'Adaptability', domain: 'Relationship Building' },
  { name: 'Connectedness', domain: 'Relationship Building' },
  { name: 'Developer', domain: 'Relationship Building' },
  { name: 'Empathy', domain: 'Relationship Building' },
  { name: 'Harmony', domain: 'Relationship Building' },
  { name: 'Includer', domain: 'Relationship Building' },
  { name: 'Individualization', domain: 'Relationship Building' },
  { name: 'Positivity', domain: 'Relationship Building' },
  { name: 'Relator', domain: 'Relationship Building' },

  // Strategic Thinking
  { name: 'Analytical', domain: 'Strategic Thinking' },
  { name: 'Context', domain: 'Strategic Thinking' },
  { name: 'Futuristic', domain: 'Strategic Thinking' },
  { name: 'Ideation', domain: 'Strategic Thinking' },
  { name: 'Input', domain: 'Strategic Thinking' },
  { name: 'Intellection', domain: 'Strategic Thinking' },
  { name: 'Learner', domain: 'Strategic Thinking' },
  { name: 'Strategic', domain: 'Strategic Thinking' },
];

/**
 * @deprecated Prefer importing from './data/questionBank' (getQuestionBank /
 * getQuestionsForLength). Kept as an alias for backward compatibility with
 * existing call sites; will be removed in a future change.
 */
export const QUESTIONS = questionBank.questions;
