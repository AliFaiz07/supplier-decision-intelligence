import React, { useEffect, useState } from 'react';

interface ProcessingIndicatorProps {
  message?: string;
  operation?: 'analyze' | 'what_if' | 'supplier_360' | 'general' | 'price' | 'delivery' | 'quality' | 'contract' | 'risk' | 'anomalies' | 'forecast' | 'stress_test' | 'memory';
}

const STEP_MESSAGES: Record<string, string[]> = {
  analyze: [
    'Validating SAP vendor master & plant relevance...',
    'Analyzing 24-month purchase order & goods receipt history...',
    'Evaluating delivery deviation and on-time performance (OTD)...',
    'Checking purchasing outline agreements & contractual rebates...',
    'Computing effective procurement landed cost...',
    'Evaluating quality inspection lots and defect PPM...',
    'Synthesizing decision evidence & strategic recommendation...'
  ],
  what_if: [
    'Updating multi-criteria priority weight matrices...',
    'Recalculating normalized dimension scores...',
    'Evaluating rank shifts and trade-off differentials...'
  ],
  supplier_360: [
    'Loading supplier 360 master profile...',
    'Aggregating 24-month spend and volume distribution...',
    'Retrieving quality inspection lots and risk signals...'
  ],
  price: [
    'Evaluating historical price bands and standard deviation...',
    'Calculating price volatility coefficient and spread...',
    'Analyzing contract vs spot purchase price variances...'
  ],
  delivery: [
    'Auditing verified Goods Receipts and scheduled dates...',
    'Computing lead time variance and delay distributions...',
    'Evaluating OTIF reliability against landed cost...'
  ],
  quality: [
    'Analyzing inspection lot records and usage decisions...',
    'Categorizing defect root causes across inspection lots...',
    'Computing supplier defect PPM and rejection rates...'
  ],
  contract: [
    'Auditing purchasing outline agreements...',
    'Evaluating expiry timeline and contracted spend coverage...',
    'Calculating commercial synergy advantages...'
  ],
  risk: [
    'Auditing operational supplier risk ratings...',
    'Evaluating single-source material vulnerability...',
    'Computing spend concentration exposure...'
  ],
  anomalies: [
    'Scanning telemetry for purchase price variances (>10%)...',
    'Evaluating 3-month rolling OTIF deterioration signals...',
    'Inspecting recurring defect rate deviations...',
    'Detecting approaching contract expiries & concentration breaches...'
  ],
  forecast: [
    'Fitting exponential smoothing & linear regression curves...',
    'Calculating 95% statistical confidence error bounds...',
    'Generating 6-month material price and spend projections...'
  ],
  stress_test: [
    'Executing 8 adverse supply chain shock simulations...',
    'Testing price escalation (+10%, +20%) & delay (+2d, +5d)...',
    'Simulating vendor outage and alternative quota absorption...',
    'Computing deterministic decision robustness rating...'
  ],
  memory: [
    'Comparing award-time expected metrics against post-award telemetry...',
    'Computing OTIF, price, and quality variance deltas...',
    'Synthesizing empirical lessons learned for future decisions...'
  ],
  general: [
    'Accessing canonical procurement data layer...',
    'Running deterministic calculations...'
  ]
};

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  message,
  operation = 'analyze'
}) => {
  const steps = STEP_MESSAGES[operation] || STEP_MESSAGES.general;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % steps.length);
    }, 280);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="bg-[#f8fafc] border border-[#d5dbe1] p-5 my-4 text-center">
      <div className="flex items-center justify-center space-x-3 mb-2">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-[#0a6ed1] rounded-full animate-spin"></div>
        <span className="text-xs font-semibold text-slate-800 tracking-wide uppercase">
          Enterprise Processing Engine
        </span>
      </div>
      <p className="text-xs text-slate-600 font-mono transition-all duration-150">
        {message || steps[currentStepIndex]}
      </p>
      <div className="w-48 bg-slate-200 h-1 mx-auto mt-3 overflow-hidden rounded-[1px]">
        <div className="bg-[#0a6ed1] h-full w-2/3 animate-pulse"></div>
      </div>
    </div>
  );
};
