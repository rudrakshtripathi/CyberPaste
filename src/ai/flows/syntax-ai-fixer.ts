'use server';
/**
 * @fileOverview A syntax fixer AI agent.
 *
 * - syntaxAiFixer - A function that handles the syntax fixing process.
 * - SyntaxAiFixerInput - The input type for the syntaxAiFixer function.
 * - SyntaxAiFixerOutput - The return type for the syntaxAiFixer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SyntaxAiFixerInputSchema = z.object({
  code: z.string().describe('The code to be fixed.'),
  language: z.string().describe('The programming language of the code.'),
});
export type SyntaxAiFixerInput = z.infer<typeof SyntaxAiFixerInputSchema>;

const SyntaxAiFixerOutputSchema = z.object({
  fixedCode: z.string().describe('The code with syntax errors fixed.'),
});
export type SyntaxAiFixerOutput = z.infer<typeof SyntaxAiFixerOutputSchema>;

export async function syntaxAiFixer(input: SyntaxAiFixerInput): Promise<SyntaxAiFixerOutput> {
  return syntaxAiFixerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'syntaxAiFixerPrompt',
  input: {schema: SyntaxAiFixerInputSchema},
  output: {schema: SyntaxAiFixerOutputSchema},
  prompt: `You are a helpful AI assistant that helps fix syntax errors in code.

You will receive code and the programming language it is written in.
Your task is to analyze the provided code and correct any syntax errors you find.

Your response MUST be a valid JSON object that strictly adheres to the provided output schema.
Do NOT include any extra conversational text, explanations, or markdown formatting in your response.
The 'fixedCode' field in your JSON output should contain the corrected code as a single, valid JSON string.

Language: {{{language}}}
Code:
\`\`\`{{{language}}}
{{{code}}}
\`\`\`
`,
});

const syntaxAiFixerFlow = ai.defineFlow(
  {
    name: 'syntaxAiFixerFlow',
    inputSchema: SyntaxAiFixerInputSchema,
    outputSchema: SyntaxAiFixerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
