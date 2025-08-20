'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BrainCircuit } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { analyzeTimeComplexity } from '@/ai/flows/time-complexity-analyzer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Card, CardContent } from './ui/card';

interface TimeComplexityAnalyzerProps {
  code: string;
  language: string;
}

export function TimeComplexityAnalyzer({ code, language }: TimeComplexityAnalyzerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [accordionValue, setAccordionValue] = useState<string | undefined>();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty Content',
        description: 'Cannot analyze the complexity of an empty paste.',
      });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);
    try {
      const result = await analyzeTimeComplexity({ code, language });
      if (result.analysis) {
        setAnalysis(result.analysis);
        setAccordionValue('item-1'); // Open the accordion
        toast({
          title: 'Analysis Complete',
          description: 'AI has analyzed the time complexity of your code.',
        });
      } else {
        throw new Error('AI did not return an analysis.');
      }
    } catch (error) {
      console.error('Time complexity analysis failed:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not analyze complexity. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <Button onClick={handleAnalyze} disabled={isLoading} variant="outline">
        <BrainCircuit className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Analyzing...' : 'Analyze Time Complexity'}
      </Button>

      {analysis && (
        <Accordion type="single" collapsible value={accordionValue} onValueChange={setAccordionValue} className="w-full mt-4">
          <AccordionItem value="item-1">
            <AccordionTrigger>Complexity Analysis</AccordionTrigger>
            <AccordionContent>
              <Card className="bg-background/50">
                <CardContent className="p-4">
                  <ReactMarkdown
                    className="prose prose-invert prose-sm max-w-none"
                    components={{
                      h1: ({node, ...props}) => <h3 className="text-lg font-semibold" {...props} />,
                      h2: ({node, ...props}) => <h4 className="text-md font-semibold" {...props} />,
                      pre: ({node, ...props}) => <pre className="bg-black/50 p-2 rounded-md" {...props} />,
                      code: ({node, ...props}) => <code className="font-code text-primary" {...props} />,
                    }}
                  >
                    {analysis}
                  </ReactMarkdown>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
