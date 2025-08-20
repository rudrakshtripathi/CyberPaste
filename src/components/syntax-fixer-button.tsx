'use client';

import { useState } from 'react';
import { WandSparkles } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { syntaxAiFixer } from '@/ai/flows/syntax-ai-fixer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface SyntaxFixerButtonProps {
  code: string;
  language: string;
  onFixed: (fixedCode: string) => void;
}

export function SyntaxFixerButton({ code, language, onFixed }: SyntaxFixerButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFixSyntax = async () => {
    if (!code.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty Content',
        description: 'Cannot fix syntax of an empty paste.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await syntaxAiFixer({ code, language });
      if (result.fixedCode) {
        onFixed(result.fixedCode);
        toast({
          title: 'Syntax Fixed',
          description: 'AI has corrected the syntax of your code.',
        });
      } else {
        throw new Error('AI did not return fixed code.');
      }
    } catch (error) {
      console.error('Syntax fixing failed:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not fix syntax. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleFixSyntax}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            <WandSparkles className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Analyzing...' : 'Fix with AI'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Use Generative AI to automatically fix syntax errors.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
