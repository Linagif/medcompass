import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Model output is UNTRUSTED. react-markdown turns Markdown into React elements and does
 * NOT render raw HTML (no rehype-raw plugin is installed), so <script>, <img onerror=...>
 * and similar are shown as plain text or dropped. Unsafe URL schemes such as javascript:
 * are removed by react-markdown's default urlTransform. We additionally:
 *  - drop images (they could load remote tracking content),
 *  - open links in a new tab with rel="noopener noreferrer nofollow".
 */
export default function MarkdownContent({ text }: { text: string }) {
  return (
    <div className="prose-med">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          img: () => null,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer nofollow">
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
