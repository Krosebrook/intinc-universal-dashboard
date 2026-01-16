import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { FileText, Sparkles, Download, Copy, Loader2 } from 'lucide-react';
import { blink } from '../../../lib/blink';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { aiRateLimiter } from '../../../lib/rate-limiting/api-limiter';
import type { BlinkUser } from '@blinkdotnew/sdk';

const PRD_TEMPLATE = `You are an expert technical product manager and senior full-stack developer. Generate a complete, spec-driven Product Requirements Document (PRD) based on the feature idea provided.

The PRD must be structured with the following sections:

# [Product/Feature Name]

## 1. Executive Summary
- High-level overview of the product/feature
- Business case and goals
- Target market and opportunity

## 2. Problem Statement
- Clear articulation of the problem being solved
- Who experiences this problem
- Why it's critical to solve now

## 3. Target Audience / User Personas
- Primary user roles
- User demographics and behavior
- Pain points and goals for each persona

## 4. Functional Requirements
- List of all core features
- Clearly scoped feature behavior
- Edge cases where applicable
- Priority: Must-have, Should-have, Could-have

## 5. Non-Functional Requirements
- Performance metrics (response time, throughput)
- Scalability requirements
- Uptime/availability targets
- Localization and internationalization
- Accessibility standards (WCAG 2.1 AA)
- Browser/device compatibility

## 6. User Stories & Acceptance Criteria
Use proper Gherkin-style format for each user story:

**User Story [Number]: [Title]**
- As a [persona]
- I want to [action]
- So that [benefit]

**Acceptance Criteria:**
- Given [context]
- When [action]
- Then [expected result]

(Cover all personas and use cases)

## 7. Technical Architecture Overview
- High-level system design
- Services involved (frontend, backend, APIs, databases, caching)
- Technology stack recommendations
- Sequence diagrams or flow descriptions
- Data models and relationships

## 8. API Design (if relevant)
- Endpoint specifications (REST or GraphQL)
- Request/response schemas
- Authentication/authorization requirements
- Rate limiting considerations
- Error handling patterns

## 9. UI/UX Considerations
- Page/component layout descriptions
- Interaction patterns and user flows
- Responsive design requirements
- Mobile-first considerations
- Accessibility requirements

## 10. Security & Compliance
- Data handling and privacy policies
- Role-based access control (RBAC)
- Encryption requirements (in-transit, at-rest)
- Compliance requirements (GDPR, SOC2, HIPAA if relevant)
- Security best practices (input validation, XSS prevention, CSRF protection)

## 11. Testing Strategy
- Unit test coverage targets
- Integration testing approach
- End-to-end testing scenarios
- Performance testing requirements
- Tooling and automation plan

## 12. Deployment & DevOps Plan
- Environment strategy (dev, staging, production)
- CI/CD pipeline requirements
- Deployment methodology (blue-green, canary, rolling)
- Monitoring and observability
- Rollback procedures

## 13. Assumptions, Risks & Open Questions
- Known unknowns and assumptions
- Technical risks and mitigation strategies
- External dependencies
- Open questions requiring stakeholder input
- Timeline and resource constraints

Generate a comprehensive, production-grade PRD following this structure. Be specific, detailed, and actionable. Use professional technical writing style.`;

export default function PRDGenerator() {
  const [featureIdea, setFeatureIdea] = useState('');
  const [generatedPRD, setGeneratedPRD] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentUser, setCurrentUser] = useState<BlinkUser | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setCurrentUser(state.user);
    });
    return unsubscribe;
  }, []);

  React.useEffect(() => {
    if (scrollRef.current && generatedPRD) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [generatedPRD]);

  const handleGenerate = async () => {
    if (!featureIdea.trim()) {
      toast.error('Please enter a feature idea');
      return;
    }

    if (!currentUser?.id) {
      toast.error('Please sign in to generate PRDs');
      return;
    }

    if (!aiRateLimiter.check(currentUser.id)) {
      toast.error('AI usage limit reached. Please wait a moment.');
      return;
    }

    setIsGenerating(true);
    setGeneratedPRD('');

    try {
      const prompt = `${PRD_TEMPLATE}\n\nFeature Idea:\n${featureIdea}`;

      await blink.ai.streamText({
        prompt,
        system: "You are an expert technical product manager and senior full-stack developer with extensive experience writing production-grade PRDs.",
      }, (chunk) => {
        setGeneratedPRD(prev => prev + chunk);
      });

      toast.success('PRD generated successfully!');
    } catch (error) {
      console.error('Error generating PRD:', error);
      toast.error('Failed to generate PRD. Please try again.');
      setGeneratedPRD('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPRD);
      toast.success('PRD copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    try {
      // Generate a descriptive filename based on timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `PRD-${timestamp}.md`;
      
      const blob = new Blob([generatedPRD], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PRD downloaded');
    } catch (error) {
      toast.error('Failed to download PRD');
    }
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for headings, lists, and bold
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-3xl font-bold mt-8 mb-4 text-foreground">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-2xl font-bold mt-6 mb-3 text-foreground border-b border-border pb-2">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-xl font-semibold mt-5 mb-2 text-foreground">{line.slice(4)}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={i} className="text-lg font-semibold mt-4 mb-2 text-foreground">{line.slice(5)}</h4>;
      }
      // Lists
      if (line.match(/^[\*\-]\s/)) {
        return (
          <div key={i} className="flex items-start gap-2 ml-4 mb-1">
            <span className="text-primary mt-1.5">•</span>
            <p className="text-sm text-muted-foreground flex-1">{line.slice(2)}</p>
          </div>
        );
      }
      // Bold text - parse ** markers more carefully
      if (line.includes('**')) {
        // Split by ** and track whether we're inside bold text
        const parts = line.split('**');
        // Only process if we have matched pairs
        if (parts.length > 1) {
          return (
            <p key={i} className="text-sm text-muted-foreground mb-2 leading-relaxed">
              {parts.map((part, j) => 
                j > 0 && j % 2 === 1 ? <strong key={j} className="font-bold text-foreground">{part}</strong> : part
              )}
            </p>
          );
        }
      }
      // Regular text
      if (line.trim()) {
        return <p key={i} className="text-sm text-muted-foreground mb-2 leading-relaxed">{line}</p>;
      }
      // Empty line
      return <div key={i} className="h-2" />;
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            PRD Generator
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Generate comprehensive Product Requirements Documents using AI
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="glass-card border-white/10 h-[calc(100vh-240px)]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Feature Idea
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 h-[calc(100%-80px)] flex flex-col">
            <Textarea
              value={featureIdea}
              onChange={(e) => setFeatureIdea(e.target.value)}
              placeholder="Enter your feature idea here... For example: A real-time collaboration dashboard that allows teams to work together on data visualizations with live cursors, commenting, and version control."
              className="flex-1 resize-none bg-background/50 border-white/10 focus-visible:ring-primary/50 min-h-[200px]"
              disabled={isGenerating}
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !featureIdea.trim()}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating PRD...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate PRD
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="glass-card border-white/10 h-[calc(100vh-240px)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Generated PRD
            </CardTitle>
            {generatedPRD && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCopy}
                  variant="ghost"
                  size="sm"
                  className="h-8"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="ghost"
                  size="sm"
                  className="h-8"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="h-[calc(100%-80px)]">
            <ScrollArea className="h-full pr-4" ref={scrollRef}>
              <AnimatePresence mode="wait">
                {isGenerating && !generatedPRD ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full space-y-4"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                      <Loader2 className="w-12 h-12 text-primary animate-spin relative" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium animate-pulse">
                      Generating comprehensive PRD...
                    </p>
                  </motion.div>
                ) : generatedPRD ? (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-sm prose-invert max-w-none"
                  >
                    <div className="space-y-1">
                      {renderMarkdown(generatedPRD)}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">
                        No PRD generated yet
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        Enter a feature idea and click "Generate PRD" to get started
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
