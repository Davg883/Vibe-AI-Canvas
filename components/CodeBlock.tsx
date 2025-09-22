import React, { useState, useMemo } from 'react';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copyText, setCopyText] = useState('Copy');

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopyText('Copied!');
      setTimeout(() => setCopyText('Copy'), 2000);
    });
  };

  const highlightedCode = useMemo(() => {
    if (!code) return '';
    let processedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Comments (HTML, CSS, JS)
    processedCode = processedCode.replace(/(&lt;!--.*?--&gt;)/gs, '<span class="text-slate-500">$1</span>');
    processedCode = processedCode.replace(/(\/\*.*?\*\/)/gs, '<span class="text-slate-500">$1</span>');
    processedCode = processedCode.replace(/(\/\/.*)/g, '<span class="text-slate-500">$1</span>');

    // HTML Tags
    processedCode = processedCode.replace(/(&lt;\/?[\w\d_:-]+)/g, '<span class="text-pink-400">$1</span>');
    
    // Attributes
    processedCode = processedCode.replace(/([\w\d_:-]+)=/g, '<span class="text-cyan-400">$1</span>=');

    // Strings (double and single quotes)
    processedCode = processedCode.replace(/(".*?")/g, '<span class="text-emerald-400">$1</span>');
    processedCode = processedCode.replace(/('.*?')/g, '<span class="text-emerald-400">$1</span>');

    const lang = language.toLowerCase();
    
    if (lang === 'css' || (lang === 'html' && processedCode.includes('<style>'))) {
      processedCode = processedCode.replace(/([\w-]+)\s*:/g, '<span class="text-cyan-400">$1</span>:'); // CSS properties
      processedCode = processedCode.replace(/(:\s*[\w\d\s#()%-.]+;)/g, '<span class="text-orange-400">$1</span>'); // CSS values
    }
     
    if (lang === 'javascript' || lang === 'js' || (lang === 'html' && processedCode.includes('<script>'))) {
        const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'new', 'import', 'export', 'default', 'from', 'async', 'await', 'try', 'catch', 'class'];
        const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
        processedCode = processedCode.replace(keywordRegex, '<span class="text-purple-400">$1</span>');
    }
    
    return processedCode;
  }, [code, language]);

  const lines = code ? code.split('\n') : [''];
  
  const CopyIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
     </svg>
  );

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 relative group text-sm font-mono max-h-96 overflow-auto">
      <div className="sticky top-0 z-10 flex justify-between items-center px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-t-lg border-b border-slate-700">
        <span className="text-xs font-semibold uppercase text-cyan-400">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-1 px-2 rounded-md transition-all duration-200 opacity-50 group-hover:opacity-100"
        >
          <CopyIcon />
          {copyText}
        </button>
      </div>
      <div className="flex p-4">
        <div className="pr-4 text-slate-600 select-none text-right flex-shrink-0" aria-hidden="true">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="text-slate-300 w-full">
          <code className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
