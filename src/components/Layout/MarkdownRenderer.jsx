import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // 1. Formatear los bloques de código (Criterio de aceptación 1)
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        // 2. Darle diseño a las tablas (Criterio de aceptación 2)
        table({ children }) {
          return (
            <div style={{ overflowX: 'auto', margin: '10px 0' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid var(--border-color, #ccc)' }}>
                {children}
              </table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th style={{ border: '1px solid var(--border-color, #ccc)', padding: '8px', backgroundColor: 'rgba(0,0,0,0.05)', fontWeight: 'bold' }}>
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td style={{ border: '1px solid var(--border-color, #ccc)', padding: '8px' }}>
              {children}
            </td>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}