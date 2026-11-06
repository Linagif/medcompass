"""Basic, conservative safety screening.

IMPORTANT LIMITATION
--------------------
This is a *prototype safeguard*, not a clinically validated triage system.
Keyword/pattern matching cannot reliably detect or exclude emergencies: it will
miss unusual wording, other languages and misspellings, and it will sometimes
fire on harmless text. It is deliberately kept in its own module so it can be
replaced by a better approach later (for example a validated triage service).

We intentionally do NOT hardcode emergency phone numbers: they differ by
country and an unverified number could be harmful.
"""
from __future__ import annotations

import re
from dataclasses import dataclass

SAFETY_NOTICE = (
    "MedCompass provides general educational information only. It is not a diagnosis, "
    "not personal medical advice, and not a substitute for a qualified healthcare "
    "professional. For personal symptoms, diagnosis or treatment decisions, please "
    "consult a clinician. In an emergency, contact your local emergency services."
)

# (category, compiled pattern). Patterns are case-insensitive and tolerate small wording changes.
_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    (
        "breathing",
        re.compile(
            r"(can'?t|cannot|unable to|struggling to|hard to|difficulty|trouble)\s+(\w+\s+){0,2}breath"
            r"|severe\s+(shortness of breath|difficulty breathing|breathing difficulty)"
            r"|gasping for (air|breath)|not breathing|stopped breathing|choking",
            re.I,
        ),
    ),
    (
        "stroke",
        re.compile(
            r"face\s+(is\s+)?(drooping|droopy)|facial droop"
            r"|(sudden|suddenly)\s+(\w+\s+){0,3}(weakness|numbness|slurred|can'?t speak|trouble speaking|confusion|loss of vision)"
            r"|(one|1)[- ]sided\s+(weakness|numbness)|slurred speech|having a stroke",
            re.I,
        ),
    ),
    (
        "chest_pain",
        re.compile(
            r"(severe|crushing|intense|bad)\s+chest\s+(pain|pressure|tightness)"
            r"|chest\s+(pain|pressure|tightness)\s+(.{0,40})(spreading|radiat|arm|jaw|sweat|short of breath|shortness of breath|faint|nausea)"
            r"|(i am|i'm|im|he is|he's|she is|she's|they are|they're|might be|may be|think .{0,20}|is|are)\s+having\s+a\s+heart attack",
            re.I,
        ),
    ),
    (
        "unconscious",
        re.compile(
            r"unconscious|unresponsive|not responding|passed out and (won'?t|not|can'?t)|won'?t wake up|collapsed and",
            re.I,
        ),
    ),
    (
        "bleeding",
        re.compile(
            r"(severe|heavy|uncontrolled|won'?t stop|will not stop)\s+(\w+\s+){0,2}bleeding"
            r"|bleeding\s+(\w+\s+){0,3}(won'?t|will not|can'?t be)\s+(stop|controlled)"
            r"|bleeding (heavily|badly|profusely)|blood\s+(is\s+)?(gushing|pouring)",
            re.I,
        ),
    ),
    (
        "overdose",
        re.compile(
            r"overdos(e|ed|ing)|took too many (pills|tablets)|swallowed (a lot of|too many) (pills|tablets)"
            r"|poison(ed|ing)\b.{0,30}(now|just|just now|swallow)",
            re.I,
        ),
    ),
    (
        "self_harm",
        re.compile(
            r"(want|going|plan(ning)?|thinking of|about) to (kill myself|end my life|take my (own )?life|die by suicide|hurt myself badly)"
            r"|kill myself|end my life|don'?t want to (live|be alive)|better off dead"
            r"|(i am|i'm|im|feel|feeling|been|thinking (of|about)|considering|contemplating)\s+(\w+\s+)?suicid(e|al)"
            r"|(hurting|harming|cutting) myself (right now|tonight|now)",
            re.I,
        ),
    ),
]

_EMERGENCY_TEXT = (
    "**This may be a medical emergency.**\n\n"
    "Please contact your local emergency services or go to the nearest emergency "
    "department **right now**. If you are with someone who is unwell, stay with them "
    "and ask someone nearby to help.\n\n"
    "MedCompass cannot assess your situation or diagnose a condition, and it should "
    "not be used to decide whether something is serious. You do not need to keep "
    "chatting here first.\n\n"
    "_This message was produced by a basic built-in safety check, not by a clinician._"
)

_SELF_HARM_TEXT = (
    "**I'm really sorry you're going through this. Your safety matters.**\n\n"
    "If you might act on thoughts of ending your life or seriously hurting yourself, "
    "please contact your local emergency services or a local crisis line **right now**, "
    "or go to the nearest emergency department. If you can, tell someone you trust "
    "where you are and ask them to stay with you.\n\n"
    "If you are in immediate danger, please try to move away from anything you could "
    "use to harm yourself.\n\n"
    "MedCompass is an educational tool and cannot provide crisis support. You do not "
    "need to keep chatting here first.\n\n"
    "_This message was produced by a basic built-in safety check, not by a clinician._"
)


@dataclass(frozen=True)
class SafetyResult:
    is_emergency: bool
    category: str | None = None
    message: str | None = None


def check_emergency(text: str) -> SafetyResult:
    """Return an emergency result if the text matches any high-risk pattern."""
    for category, pattern in _PATTERNS:
        if pattern.search(text):
            msg = _SELF_HARM_TEXT if category == "self_harm" else _EMERGENCY_TEXT
            return SafetyResult(True, category, msg)
    return SafetyResult(False)
