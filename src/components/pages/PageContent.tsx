import type { ReactNode } from "react";

import { toInternationalDigits } from "@/lib/utils";

/**
 * Render admin-authored page content written in a tiny markup:
 *   - `## Heading`          -> h2
 *   - `### Sub-heading`     -> h3
 *   - `- item` lines        -> bulleted list (consecutive lines group together)
 *   - anything else         -> paragraph text (blank line separates paragraphs)
 *
 * Emails, phone numbers, and web URLs inside the text are auto-linked:
 *   - emails -> mailto:
 *   - numbers on a "WhatsApp" line -> wa.me (opens a chat)
 *   - any other phone number -> tel: (dials the call)
 *   - http(s) URLs -> open in a new tab
 */
export function PageContent({ content }: { content: string }) {
  const nodes: ReactNode[] = [];
  let bullets: string[] = [];
  let para: string[] = [];

  const pushBullets = () => {
    if (bullets.length === 0) return;
    nodes.push(
      <ul
        key={`ul-${nodes.length}`}
        className="flex flex-col gap-3"
      >
        {bullets.map((line, i) => (
          <li
            key={i}
            className="flex items-start gap-3 leading-relaxed text-muted-foreground"
          >
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{linkifyText(line)}</span>
          </li>
        ))}
      </ul>
    );
    bullets = [];
  };

  const pushPara = () => {
    if (para.length === 0) return;
    nodes.push(
      <p key={`p-${nodes.length}`} className="leading-relaxed text-muted-foreground">
        {linkifyText(para.join(" "))}
      </p>
    );
    para = [];
  };

  const flush = () => {
    pushPara();
    pushBullets();
  };

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();

    if (line.startsWith("### ")) {
      flush();
      nodes.push(
        <h3 key={`h3-${nodes.length}`} className="text-base font-semibold tracking-tight">
          {line.replace(/^###\s+/, "")}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      flush();
      nodes.push(
        <h2 key={`h2-${nodes.length}`} className="text-xl font-bold tracking-tight">
          {line.replace(/^##\s+/, "")}
        </h2>
      );
    } else if (line.startsWith("- ")) {
      pushPara();
      bullets.push(line.replace(/^\-\s+/, ""));
    } else if (line === "") {
      flush();
    } else {
      pushBullets();
      para.push(line);
    }
  }
  flush();

  return <div className="flex flex-col gap-6">{nodes}</div>;
}

/** Detect whether a line mentions WhatsApp so its number opens a chat. */
function isWhatsAppLine(text: string) {
  return /whatsapp/i.test(text);
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const URL_RE = /https?:\/\/[^\s]+/;
const PHONE_RE = /\+?[0-9][0-9\s\-()]{7,14}[0-9]/;

const LINK_CLASS =
  "font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80";

/**
 * Turn emails, phone numbers, and URLs inside a text string into links.
 * Numbers are dialed via tel: unless their line is a WhatsApp one.
 */
function linkifyText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  const push = (from: number, to: number, node: ReactNode) => {
    if (from > cursor) {
      nodes.push(<span key={key++}>{text.slice(cursor, from)}</span>);
    }
    nodes.push(node);
    cursor = to;
  };

  const whatsapp = isWhatsAppLine(text);
  const message = encodeURIComponent("Hi, I would like to get in touch.");

  while (cursor < text.length) {
    const rest = text.slice(cursor);

    const candidates: {
      index: number;
      length: number;
      make: () => ReactNode;
    }[] = [];

    const email = EMAIL_RE.exec(rest);
    if (email) {
      candidates.push({
        index: email.index,
        length: email[0].length,
        make: () => (
          <a key={key++} href={`mailto:${email[0]}`} className={LINK_CLASS}>
            {email[0]}
          </a>
        ),
      });
    }

    const url = URL_RE.exec(rest);
    if (url) {
      candidates.push({
        index: url.index,
        length: url[0].length,
        make: () => (
          <a
            key={key++}
            href={url[0]}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_CLASS}
          >
            {url[0]}
          </a>
        ),
      });
    }

    const phone = PHONE_RE.exec(rest);
    if (phone) {
      const digits = toInternationalDigits(phone[0]);
      if (digits) {
        const href = whatsapp
          ? `https://wa.me/${digits}?text=${message}`
          : `tel:+${digits}`;
        candidates.push({
          index: phone.index,
          length: phone[0].length,
          make: () => (
            <a
              key={key++}
              href={href}
              {...(whatsapp ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={LINK_CLASS}
            >
              {phone[0]}
            </a>
          ),
        });
      }
    }

    if (candidates.length === 0) break;
    const match = candidates.reduce((a, b) => (b.index < a.index ? b : a));
    push(match.index, match.index + match.length, match.make());
  }

  if (cursor < text.length) {
    nodes.push(<span key={key++}>{text.slice(cursor)}</span>);
  }

  return nodes;
}

export default PageContent;