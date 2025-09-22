import React, { useState, useCallback } from 'react';
import { generateScribeResponse, explainCode } from '../services/geminiService';
import { ScribeResponse } from '../types';
import CodeBlock from './CodeBlock';
import Loader from './Loader';

// --- ICONS ---
const MagicWandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.293 2.293a1 1 0 011.414 0l.001.001a1 1 0 010 1.414l-11 11a1 1 0 01-1.415-1.415l11-11zM11 7a1 1 0 100-2 1 1 0 000 2zm-5-5a1 1 0 100-2 1 1 0 000 2zM15 11a1 1 0 100-2 1 1 0 000 2zm-5-5a1 1 0 100-2 1 1 0 000 2zM3 15a1 1 0 100-2 1 1 0 000 2z"/>
    <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.586l-1.707 1.707a1 1 0 001.414 1.414L5 6.414V8a1 1 0 102 0V6.414l1.293 1.293a1 1 0 101.414-1.414L8.414 5.586V4a1 1 0 10-2 0v1.586l-1.293-1.293A1 1 0 005 2zm10 10a1 1 0 00-1 1v1.586l-1.707 1.707a1 1 0 101.414 1.414L15 16.414V18a1 1 0 102 0v-1.586l1.293 1.293a1 1 0 101.414-1.414L18.414 15.586V14a1 1 0 00-1-1h-2z" clipRule="evenodd" />
  </svg>
);
const VisionIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>);
const BlueprintIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>);
const RealityIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2 1m0 0l-2-1m2 1V2M4 7l2 1M4 7l2-1M4 7v2.5M12 21.5V19M12 5V2.5" /></svg>);

// --- HELPER COMPONENTS ---
const PaneHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <div className="flex items-center text-lg font-semibold text-slate-300 mb-4 border-b-2 border-slate-700 pb-2 flex-shrink-0">
      {icon}
      <h2 className="ml-2">{title}</h2>
    </div>
);
const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 focus:outline-none ${
      isActive
        ? 'bg-slate-700/50 text-emerald-400 border-b-2 border-emerald-400'
        : 'text-slate-400 hover:bg-slate-700/30'
    }`}
    aria-selected={isActive}
  >
    {label}
  </button>
);
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-900/80 px-1 py-0.5 rounded text-emerald-400">$1</code>')
    .replace(/(\r\n|\n|\r)/g, '<br />');

  return <div className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedText }} />;
};

type ActiveTab = 'preview' | 'explainer';

const SovereignScribe: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [isScribeLoading, setIsScribeLoading] = useState<boolean>(false);
  const [scribeError, setScribeError] = useState<string | null>(null);
  const [scribeResult, setScribeResult] = useState<ScribeResponse | null>(null);

  const [isExplainerLoading, setIsExplainerLoading] = useState<boolean>(false);
  const [explainerError, setExplainerError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');

  const handleScribeSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userInput.trim() || isScribeLoading) return;

    setIsScribeLoading(true);
    setScribeError(null);
    setScribeResult(null);
    setExplanation(null);
    setExplainerError(null);
    setActiveTab('preview');

    try {
      const response = await generateScribeResponse(userInput);
      setScribeResult(response);
    } catch (e) {
      if (e instanceof Error) {
        setScribeError(e.message);
      } else {
        setScribeError('An unexpected error occurred.');
      }
    } finally {
      setIsScribeLoading(false);
    }
  }, [userInput, isScribeLoading]);

  const handleExplainCode = useCallback(async () => {
    if (!scribeResult || isExplainerLoading || explanation) return;

    setIsExplainerLoading(true);
    setExplainerError(null);
    try {
      const code = scribeResult.example_output.code_with_comments;
      const response = await explainCode(code);
      setExplanation(response);
    } catch (e) {
      if (e instanceof Error) {
        setExplainerError(e.message);
      } else {
        setExplainerError('An unexpected error occurred.');
      }
    } finally {
      setIsExplainerLoading(false);
    }
  }, [scribeResult, isExplainerLoading, explanation]);

  const onTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'explainer' && scribeResult && !explanation) {
      handleExplainCode();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" style={{ minHeight: '70vh' }}>
      {/* --- LEFT PANE: VISION --- */}
      <div className="lg:col-span-3 bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-slate-700 flex flex-col">
        <PaneHeader icon={<VisionIcon />} title="The Vision" />
        <form onSubmit={handleScribeSubmit} className="flex flex-col flex-grow">
          <label htmlFor="userInput" className="block text-lg font-medium text-slate-300 mb-2">
            Describe your idea...
          </label>
          <textarea
            id="userInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="e.g., 'a tetris game'"
            className="w-full flex-grow p-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 resize-none"
            disabled={isScribeLoading}
            rows={10}
          />
          <button
            type="submit"
            disabled={isScribeLoading || !userInput.trim()}
            className="mt-4 w-full flex items-center justify-center bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300"
          >
            {isScribeLoading ? <Loader /> : <><MagicWandIcon /> Weave my Vision</>}
          </button>
        </form>
      </div>

      {/* --- MIDDLE PANE: BLUEPRINT --- */}
      <div className="lg:col-span-5 bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-slate-700 flex flex-col min-h-[400px] lg:min-h-0">
        <PaneHeader icon={<BlueprintIcon />} title="The Blueprint" />
        <div className="flex-grow overflow-y-auto space-y-6">
          {isScribeLoading && <div className="flex justify-center items-center h-full"><Loader /></div>}
          {scribeError && <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg"><p className="font-bold">Error:</p><p>{scribeError}</p></div>}
          {!isScribeLoading && !scribeResult && <div className="text-slate-500 text-center pt-16">The AI's generated prompt and code will appear here.</div>}
          {scribeResult && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-300 mb-2">Generated AI Prompt</h3>
                <CodeBlock code={scribeResult.generated_prompt_for_ai} language="prompt" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-300 mb-2">Example Output</h3>
                <CodeBlock code={scribeResult.example_output.code_with_comments} language={scribeResult.example_output.language} />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* --- RIGHT PANE: REALITY --- */}
      <div className="lg:col-span-4 bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-slate-700 flex flex-col min-h-[400px] lg:min-h-0">
        <PaneHeader icon={<RealityIcon />} title="The Reality" />
        {!scribeResult && <div className="text-slate-500 text-center pt-16">Your live preview and code explanation will appear here once you weave a vision.</div>}
        {scribeResult && (
          <div className="flex flex-col flex-grow">
            <div className="flex-shrink-0 border-b border-slate-700">
              <TabButton label="Live Preview" isActive={activeTab === 'preview'} onClick={() => onTabChange('preview')} />
              <TabButton label="Code Explainer" isActive={activeTab === 'explainer'} onClick={() => onTabChange('explainer')} />
            </div>
            <div className="flex-grow mt-4 overflow-hidden">
              {activeTab === 'preview' && (
                <iframe
                  srcDoc={scribeResult.example_output.code_with_comments}
                  title="Live Preview"
                  className="w-full h-full bg-white rounded-lg border border-slate-600"
                  sandbox="allow-scripts"
                />
              )}
              {activeTab === 'explainer' && (
                <div className="h-full overflow-y-auto text-slate-300 p-2">
                  {isExplainerLoading && <div className="flex justify-center items-center h-full"><Loader /></div>}
                  {explainerError && <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg"><p className="font-bold">Error:</p><p>{explainerError}</p></div>}
                  {explanation && <SimpleMarkdown text={explanation} />}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SovereignScribe;
