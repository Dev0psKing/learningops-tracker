import React from 'react';

interface SimpleMarkdownProps {
    content: string;
}

/**
 * A zero-dependency Markdown renderer for the Journal.
 * Supports: Bold (**), Code (`), Headers (#), Lists (-), and Links [].
 */
export const SimpleMarkdown: React.FC<SimpleMarkdownProps> = ({ content }) => {
    if (!content) return null;

    // Split by newlines to handle block-level elements
    const lines = content.split('\n');

    return (
        <div className="markdown-body space-y-1.5 font-sans">
            {lines.map((line, i) => {
                const trimmed = line.trim();

                // Header (h1-h3) - e.g. "# Key Takeaways"
                if (trimmed.startsWith('#')) {
                    const text = trimmed.replace(/^#+\s*/, '');
                    return <h3 key={i} className="text-sm font-bold mt-3 mb-1 text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">{parseInline(text)}</h3>;
                }

                // List Item - e.g. "- Learned SQL"
                if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                    return (
                        <div key={i} className="flex items-start gap-2 pl-2">
                            <span className="text-indigo-500 mt-1.5 text-[6px] flex-shrink-0">●</span>
                            <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{parseInline(trimmed.substring(2))}</span>
                        </div>
                    );
                }

                // Blockquote - e.g. "> Important note"
                if (trimmed.startsWith('> ')) {
                    return (
                        <div key={i} className="border-l-2 border-indigo-300 dark:border-indigo-700 pl-3 py-1 my-1 italic text-slate-600 dark:text-slate-400 text-sm bg-slate-50 dark:bg-slate-900/50 rounded-r">
                            {parseInline(trimmed.substring(2))}
                        </div>
                    );
                }

                // Empty line (spacer)
                if (!trimmed) {
                    return <div key={i} className="h-1"></div>;
                }

                // Standard Paragraph
                return <p key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{parseInline(line)}</p>;
            })}
        </div>
    );
};

// Helper to parse inline styles (Bold, Code, Link)
const parseInline = (text: string): React.ReactNode[] => {
    // Tokenize by Bold (**), Code (`), and Links ([])
    // Regex captures delimiters to keep them in the array for mapping
    const regex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;

    return text.split(regex).map((part, index) => {
        // Bold
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return <strong key={index} className="font-bold text-slate-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded-sm">{part.slice(2, -2)}</strong>;
        }
        // Code
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
            return <code key={index} className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded font-mono text-[11px] text-pink-600 dark:text-pink-400 border border-slate-200 dark:border-slate-600">{part.slice(1, -1)}</code>;
        }
        // Link
        if (part.startsWith('[') && part.endsWith(')')) {
            const match = part.match(/\[(.*?)\]\((.*?)\)/);
            if (match) {
                return <a key={index} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline decoration-indigo-300 underline-offset-2 font-medium">{match[1]}</a>;
            }
        }
        return part;
    });
};
