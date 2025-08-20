'use server';
/**
 * @fileOverview A time complexity analyzer AI agent.
 *
 * - analyzeTimeComplexity - A function that handles the time complexity analysis process.
 * - TimeComplexityAnalyzerInput - The input type for the analyzeTimeComplexity function.
 * - TimeComplexityAnalyzerOutput - The return type for the analyzeTimeComplexity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TimeComplexityAnalyzerInputSchema = z.object({
  code: z.string().describe('The code to be analyzed.'),
  language: z.string().describe('The programming language of the code.'),
});
export type TimeComplexityAnalyzerInput = z.infer<typeof TimeComplexityAnalyzerInputSchema>;

const TimeComplexityAnalyzerOutputSchema = z.object({
  analysis: z.string().describe('The time complexity analysis of the code, formatted as Markdown.'),
});
export type TimeComplexityAnalyzerOutput = z.infer<typeof TimeComplexityAnalyzerOutputSchema>;

export async function analyzeTimeComplexity(input: TimeComplexityAnalyzerInput): Promise<TimeComplexityAnalyzerOutput> {
  return timeComplexityAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'timeComplexityAnalyzerPrompt',
  input: {schema: TimeComplexityAnalyzerInputSchema},
  output: {schema: TimeComplexityAnalyzerOutputSchema},
  prompt: `You are an expert computer science professor specializing in algorithm analysis.

Analyze the time and space complexity of the following code snippet. Provide a clear, concise explanation of the complexity, identifying the Big O notation for the best, average, and worst cases if applicable.

Format your response in Markdown.

Language: {{{language}}}
Code:
\`\`\`{{{language}}}
{{{code}}}
\`\`\`
`,
});

const timeComplexityAnalyzerFlow = ai.defineFlow(
  {
    name: 'timeComplexityAnalyzerFlow',
    inputSchema: TimeComplexityAnalyzerInputSchema,
    outputSchema: TimeComplexityAnalyzerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
