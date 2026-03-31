
'use server';
/**
 * @fileOverview AI assistant for analyzing ransomware threat events and generating decryption/mitigation strategies.
 *
 * - threatAnalysisAssistant - Analyzes a threat event.
 * - decryptionStrategyFlow - Generates a technical recovery/decryption strategy.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ThreatAnalysisInputSchema = z.object({
  filePath: z
    .string()
    .describe('The file path where the ransomware threat was detected.'),
  timeDetected: z
    .string()
    .describe('The timestamp when the ransomware threat was detected.'),
  threatType: z
    .string()
    .describe('The type of ransomware threat detected.'),
  details: z.string().optional().describe('Any additional log details or context.'),
});
export type ThreatAnalysisInput = z.infer<typeof ThreatAnalysisInputSchema>;

const ThreatAnalysisOutputSchema = z.object({
  analysis: z
    .string()
    .describe('A comprehensive analysis of the reported ransomware threat.'),
  recommendations: z
    .array(z.string())
    .describe('A list of actionable mitigation steps.'),
});
export type ThreatAnalysisOutput = z.infer<typeof ThreatAnalysisOutputSchema>;

const DecryptionStrategyInputSchema = z.object({
  threatType: z.string().describe('The type of ransomware or encryption detected.'),
  sampleFileName: z.string().describe('An example of an encrypted file name.'),
});
export type DecryptionStrategyInput = z.infer<typeof DecryptionStrategyInputSchema>;

const DecryptionStrategyOutputSchema = z.object({
  ransomwareFamily: z.string().describe('Identified ransomware family.'),
  decryptionKeySimulated: z.string().describe('A simulated decryption key or recovery token.'),
  recoverySteps: z.array(z.string()).describe('Technical steps to decrypt or restore files.'),
  cleanupScript: z.string().describe('A simulated shell or powershell script to remove malicious traces.'),
});
export type DecryptionStrategyOutput = z.infer<typeof DecryptionStrategyOutputSchema>;

export async function threatAnalysisAssistant(input: ThreatAnalysisInput): Promise<ThreatAnalysisOutput> {
  return threatAnalysisAssistantFlow(input);
}

export async function generateDecryptionStrategy(input: DecryptionStrategyInput): Promise<DecryptionStrategyOutput> {
  return decryptionStrategyFlow(input);
}

const threatAnalysisPrompt = ai.definePrompt({
  name: 'threatAnalysisPrompt',
  input: {schema: ThreatAnalysisInputSchema},
  output: {schema: ThreatAnalysisOutputSchema},
  prompt: `You are a senior cybersecurity engineer. Analyze this ransomware threat:
File Path: {{{filePath}}}
Time Detected: {{{timeDetected}}}
Threat Type: {{{threatType}}}
Details: {{{details}}}

Provide a detailed analysis and a strictly numbered list of mitigation steps.`,
});

const decryptionStrategyPrompt = ai.definePrompt({
  name: 'decryptionStrategyPrompt',
  input: {schema: DecryptionStrategyInputSchema},
  output: {schema: DecryptionStrategyOutputSchema},
  prompt: `You are a specialist in ransomware decryption and data recovery.
Analyze this threat:
Threat Type: {{{threatType}}}
Encrypted Sample: {{{sampleFileName}}}

Generate a simulated decryption strategy including:
1. Identifying the ransomware family based on the extension and threat type.
2. Generating a simulated 'master decryption key'. The key should be a 64-character hexadecimal string or a complex 32-character alphanumeric token to look like a real cryptographic master key.
3. Providing clear recovery steps.
4. Writing a short cleanup script to remove malicious extensions.`,
});

const threatAnalysisAssistantFlow = ai.defineFlow(
  {
    name: 'threatAnalysisAssistantFlow',
    inputSchema: ThreatAnalysisInputSchema,
    outputSchema: ThreatAnalysisOutputSchema,
  },
  async input => {
    const {output} = await threatAnalysisPrompt(input);
    return output!;
  }
);

const decryptionStrategyFlow = ai.defineFlow(
  {
    name: 'decryptionStrategyFlow',
    inputSchema: DecryptionStrategyInputSchema,
    outputSchema: DecryptionStrategyOutputSchema,
  },
  async input => {
    const {output} = await decryptionStrategyPrompt(input);
    return output!;
  }
);
