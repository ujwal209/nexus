import smtplib
import time
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from datetime import datetime

logger = logging.getLogger("nexus.gmail_tool")


class GmailSendOutput(BaseModel):
    status: str
    sender_email: str
    recipients: List[str]
    subject: str
    html_body_preview: str
    latency_ms: float
    message_id: Optional[str] = None
    execution_audit: Dict[str, Any]


import re

def _markdown_to_html(text: str) -> str:
    """Converts standard markdown tags to clean semantic HTML with matching website fonts & colors."""
    if not text:
        return ""

    # Clean escape basic tags to prevent malformed email HTML (except template markers)
    html = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    # 1. Code blocks (```lang ... ```)
    def repl_code(match):
        code_content = match.group(2).strip()
        return f'<pre style="background-color: #09090b; border: 1px solid #27272a; padding: 14px 18px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; color: #a78bfa; overflow-x: auto; line-height: 1.5; margin: 16px 0;">{code_content}</pre>'
    html = re.sub(r"```(.*?)\n(.*?)```", repl_code, html, flags=re.DOTALL)

    # 2. Inline code (`code`)
    html = re.sub(
        r"`([^`\n]+)`",
        r'<code style="background-color: #18181b; border: 1px solid #27272a; padding: 2px 6px; border-radius: 4px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; color: #f43f5e; font-weight: 500;">\1</code>',
        html
    )

    # 3. Headers: ### Title -> <h3>Title</h3>
    html = re.sub(
        r"^###\s+(.*?)$",
        r'<h3 style="font-size: 15px; font-weight: 700; color: #ffffff; margin-top: 20px; margin-bottom: 8px; font-family: \'Inter\', sans-serif;">\1</h3>',
        html,
        flags=re.MULTILINE
    )
    html = re.sub(
        r"^##\s+(.*?)$",
        r'<h2 style="font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #27272a; padding-bottom: 6px; font-family: \'Inter\', sans-serif;">\1</h2>',
        html,
        flags=re.MULTILINE
    )
    html = re.sub(
        r"^#\s+(.*?)$",
        r'<h1 style="font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 28px; margin-bottom: 16px; font-family: \'Inter\', sans-serif;">\1</h1>',
        html,
        flags=re.MULTILINE
    )

    # 4. Bold and Italic: **bold** / *italic*
    html = re.sub(r"\*\*([^*]+)\*\*", r'<strong style="color: #ffffff; font-weight: 600;">\1</strong>', html)
    html = re.sub(r"\*([^*]+)\*", r'<em style="color: #e4e4e7; font-style: italic;">\1</em>', html)

    # 5. Quote blocks: > quote
    def repl_quote(match):
        content = match.group(1).strip()
        return f'<blockquote style="border-left: 3px solid #7c3aed; background-color: #18181b; border-radius: 0 8px 8px 0; margin: 16px 0; padding: 12px 18px; color: #c4b5fd; font-style: italic; font-family: \'Inter\', sans-serif;">{content}</blockquote>'
    html = re.sub(r"^&gt;\s+(.*?)$", repl_quote, html, flags=re.MULTILINE)

    # 6. Unordered lists: - item or * item
    html = re.sub(
        r"^\s*[-*]\s+(.*?)$",
        r'<li style="margin-bottom: 8px; color: #d4d4d8; font-size: 14px; font-family: \'Inter\', sans-serif; line-height: 1.5;">\1</li>',
        html,
        flags=re.MULTILINE
    )
    html = re.sub(
        r"((?:<li style=\"margin-bottom: 8px; color: #d4d4d8; font-size: 14px; font-family: 'Inter', sans-serif; line-height: 1.5;\">.*?</li>\s*)+)",
        r'<ul style="padding-left: 20px; margin-top: 8px; margin-bottom: 16px;">\1</ul>',
        html,
        flags=re.DOTALL
    )

    # 7. Horizontal Rule: ---
    html = re.sub(
        r"^---$",
        r'<hr style="border: 0; border-top: 1px solid #27272a; margin: 24px 0;" />',
        html,
        flags=re.MULTILINE
    )

    # 8. Paragraphs: double newlines
    paragraphs = html.split("\n\n")
    processed_paragraphs = []
    for p in paragraphs:
        p_stripped = p.strip()
        if not p_stripped:
            continue
        if any(p_stripped.startswith(prefix) for prefix in ["<pre", "<h1", "<h2", "<h3", "<ul", "<blockquote", "<hr"]):
            processed_paragraphs.append(p_stripped)
        else:
            p_clean = p_stripped.replace("\n", " ")
            processed_paragraphs.append(f'<p style="margin: 0 0 16px; font-size: 14px; color: #d4d4d8; line-height: 1.6; font-family: \'Inter\', sans-serif;">{p_clean}</p>')

    html = "\n\n".join(processed_paragraphs)
    return html


def _extract_upstream_text(upstream_context: Dict[str, Any]) -> Dict[str, str]:
    """
    Extract named variables from upstream node outputs.
    Returns a dict of node_id -> HTML converted text for template interpolation.
    Also builds a special {{upstream_output}} aggregate.
    """
    variables: Dict[str, str] = {}
    parts: List[str] = []

    for nid, output in upstream_context.items():
        if hasattr(output, "model_dump"):
            output = output.model_dump()
        elif hasattr(output, "dict"):
            output = output.dict()

        if isinstance(output, dict):
            if output.get("summary"):
                text = str(output["summary"])
            elif output.get("answer"):
                text = str(output["answer"])
            elif output.get("results"):
                results = output["results"]
                if isinstance(results, list):
                    text = "\n".join(
                        f"• {r.get('title', '')} — {r.get('url', '')}"
                        for r in results if isinstance(r, dict)
                    )
                else:
                    text = str(results)
            elif output.get("message"):
                text = str(output["message"])
            else:
                text = str(output)
        else:
            text = str(output)

        variables[nid] = _markdown_to_html(text)
        parts.append(text)

    variables["upstream_output"] = _markdown_to_html("\n\n---\n\n".join(parts)) if parts else ""
    variables["timestamp"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    return variables


def _render_template(template: str, variables: Dict[str, str]) -> str:
    """Replace {{var}} placeholders in the template with actual values."""
    result = template
    for key, val in variables.items():
        result = result.replace(f"{{{{{key}}}}}", val)
    return result


def _build_html_email(subject: str, body_html: str, theme: str = "dark", accent_color: str = "#7c3aed") -> str:
    """Wrap body HTML in a premium customizable responsive email shell using Google Sans."""
    is_dark = theme == "dark"
    bg_color = "#0a0a0a" if is_dark else "#f4f4f5"
    card_bg = "#111111" if is_dark else "#ffffff"
    border_color = "#222222" if is_dark else "#e4e4e7"
    text_color = "#c0c0c0" if is_dark else "#3f3f46"
    title_color = "#ffffff" if is_dark else "#09090b"
    logo_color = "#666666" if is_dark else "#71717a"
    footer_text = "#444444" if is_dark else "#71717a"
    badge_bg = "#1a1a1a" if is_dark else "#f4f4f5"
    badge_border = "#333" if is_dark else "#e4e4e7"
    badge_color = "#666" if is_dark else "#71717a"
    
    font_family = "'Google Sans', 'Product Sans', 'Inter', system-ui, -apple-system, sans-serif"
    font_import = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{subject}</title>
  <style>
    {font_import}
    body {{ margin: 0; padding: 0; background: {bg_color}; font-family: {font_family}, sans-serif; }}
    .wrapper {{ background: {bg_color}; padding: 40px 16px; }}
    .card {{ background: {card_bg}; border: 1px solid {border_color}; border-radius: 12px; max-width: 600px; margin: 0 auto; overflow: hidden; }}
    .header {{ background: {card_bg}; padding: 28px 32px; border-bottom: 2px solid {accent_color}; }}
    .header-logo {{ font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: {logo_color}; margin-bottom: 8px; }}
    .header-title {{ font-size: 20px; font-weight: 700; color: {title_color}; line-height: 1.3; }}
    .body {{ padding: 28px 32px; color: {text_color}; font-size: 14px; line-height: 1.7; }}
    .footer {{ padding: 20px 32px; border-top: 1px solid {border_color}; font-size: 11px; color: {footer_text}; text-align: center; background: {badge_bg}; }}
    .badge {{ display: inline-block; background: {badge_bg}; border: 1px solid {badge_border}; border-radius: 4px; padding: 2px 8px; font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: {badge_color}; }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="header-logo">Nexus Studio · Automated Pipeline</div>
        <div class="header-title">{subject}</div>
      </div>
      <div class="body">
        {body_html}
      </div>
      <div class="footer">
        <span class="badge">Nexus Automated Email</span><br/><br/>
        This message was sent by an automated workflow pipeline. Do not reply directly.
      </div>
    </div>
  </div>
</body>
</html>"""


class GmailSenderTool:
    """
    Gmail SMTP Email Sender Tool.
    Sends rich HTML emails with dynamic visual formatting overrides.
    """

    @classmethod
    async def execute(
        cls,
        config: Dict[str, Any],
        upstream_context: Dict[str, Any],
    ) -> GmailSendOutput:
        start_time = time.time()

        sender_email = (config.get("email") or config.get("senderEmail") or "").strip()
        app_password = (config.get("password") or config.get("appPassword") or "").strip()
        recipients_raw = config.get("recipients") or config.get("toEmail") or ""
        subject_template = config.get("subject") or "Nexus Pipeline Notification"
        
        # Sourced UI layout options
        theme = config.get("theme") or "dark"
        accent_color = config.get("accentColor") or "#7c3aed"
        font_family = config.get("fontFamily") or "'Inter', sans-serif"
        additional_content = config.get("additionalContent") or ""

        # Parse recipients (comma-separated)
        recipients = [r.strip() for r in str(recipients_raw).split(",") if r.strip()]

        logs = [
            f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] INIT: Gmail SMTP sender='{sender_email}'",
            f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] RECIPIENTS: {recipients}",
        ]

        if not sender_email:
            raise ValueError("Gmail sender email address is required (config.email)")
        if not app_password:
            raise ValueError("Gmail SMTP App Password is required (config.password)")
        if not recipients:
            raise ValueError("At least one recipient email address is required (config.recipients)")

        # Extract upstream variables for template interpolation
        variables = _extract_upstream_text(upstream_context)
        logs.append(f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] CONTEXT: {len(variables)} upstream variables available: {list(variables.keys())}")

        # Render subject and custom contents templates
        rendered_subject = _render_template(subject_template, variables)

        # Style themes colors values
        is_dark = theme == "dark"
        card_bg_inner = "#1a1a1a" if is_dark else "#f9f9f9"
        border_color_inner = "#2d2d2d" if is_dark else "#e4e4e7"
        border_color_sub = "#333333" if is_dark else "#f4f4f5"
        text_color = "#c0c0c0" if is_dark else "#3f3f46"
        badge_bg = "#222222" if is_dark else "#e4e4e7"
        badge_color = "#999999" if is_dark else "#71717a"

        # Build dynamic HTML Body cards from upstream context
        node_titles = config.get("_node_titles") or {}
        body_html = ""
        if upstream_context:
            for nid, output in upstream_context.items():
                node_html_content = variables.get(nid, "")
                title_str = node_titles.get(nid, nid)
                
                body_html += f"""
                <div style="margin-bottom: 24px; padding: 18px; background-color: {card_bg_inner}; border: 1px solid {border_color_inner}; border-radius: 8px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid {border_color_sub}; padding-bottom: 8px;">
                    <span style="font-size: 11px; font-weight: 700; font-family: {font_family}; color: {accent_color}; text-transform: uppercase; letter-spacing: 0.05em;">{title_str}</span>
                    <span style="font-size: 9px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background-color: {badge_bg}; color: {badge_color}; text-transform: uppercase; font-family: {font_family};">Node Output</span>
                  </div>
                  <div style="font-size: 13px; font-family: {font_family}; line-height: 1.6; color: {text_color};">
                    {node_html_content}
                  </div>
                </div>
                """
        else:
            # Fallback if no upstream context
            body_html = f"""
            <div style="text-align: center; padding: 24px; color: {text_color}; font-family: {font_family};">
              <p>Pipeline finished executing successfully. No node data generated.</p>
            </div>
            """

        # Append additional content if provided
        if additional_content:
            rendered_additional = _render_template(additional_content, variables)
            additional_html = _markdown_to_html(rendered_additional)
            
            body_html += f"""
            <div style="margin-top: 24px; border-top: 1px solid {border_color_inner}; padding-top: 16px; font-family: {font_family};">
              <div style="font-size: 13px; line-height: 1.6; color: {text_color};">
                {additional_html}
              </div>
            </div>
            """

        # Wrap in full email shell
        full_html = _build_html_email(rendered_subject, body_html, theme, accent_color)

        logs.append(f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] TEMPLATE_RENDERED: subject='{rendered_subject}' | body={len(body_html)} chars")
        logs.append(f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] DISPATCH: Connecting to smtp.gmail.com:587 via STARTTLS")

        logger.info(f"[GMAIL] Sending to {recipients} from {sender_email}")

        # Build MIME message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = rendered_subject
        msg["From"] = f"Nexus Studio <{sender_email}>"
        msg["To"] = ", ".join(recipients)

        # Plaintext fallback (strip basic HTML tags)
        import re
        plain_text = re.sub(r"<[^>]+>", "", body_html)
        msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(MIMEText(full_html, "html"))

        # Send via SMTP
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=20) as server:
            server.ehlo()
            server.starttls()
            server.login(sender_email, app_password)
            server.sendmail(sender_email, recipients, msg.as_string())
            message_id = msg.get("Message-ID", f"msg_{int(time.time())}")

        latency = round((time.time() - start_time) * 1000, 2)
        logs.append(f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] SUCCESS: Email sent in {latency}ms | Message-ID={message_id}")
        logger.info(f"[GMAIL] ✅ Email sent in {latency}ms to {recipients}")

        return GmailSendOutput(
            status="success",
            sender_email=sender_email,
            recipients=recipients,
            subject=rendered_subject,
            html_body_preview=body_html[:300] + ("..." if len(body_html) > 300 else ""),
            latency_ms=latency,
            message_id=str(message_id),
            execution_audit={
                "smtp_host": "smtp.gmail.com",
                "smtp_port": 587,
                "encryption": "STARTTLS",
                "recipients_count": len(recipients),
                "template_variables_used": list(variables.keys()),
                "full_html_bytes": len(full_html),
                "latency_ms": latency,
                "logs": logs,
            },
        )
