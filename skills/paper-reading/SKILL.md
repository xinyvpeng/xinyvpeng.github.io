---
name: paper-reading
description: Use when reading academic papers, analyzing research publications, generating structured summaries, creating paper interpretation blog posts, or producing deep reading notes
---

# 论文深度阅读与分析技能

## Overview

Transform academic papers from passive reading to active understanding through a systematic 2-pass reading strategy with 6 analysis dimensions. This skill helps you build a mental model of any paper, critically evaluate its claims, and produce structured outputs (summary, notes, blog post) that cement understanding.

**Core principle:** Understanding a paper is not about summarizing — it's about building a structured mental model through systematic deconstruction and critical engagement.

**语言要求:** summary.json 和 notes.md 中的所有字段、描述、表格内容均使用中文。仅保留英文术语原文（如 MANO、SfM、NeRF 等专业名词）。博客文章（blog post）也使用中文写作。

## When to Use

- Reading any academic paper (CV, ML, robotics, etc.)
- Before writing a paper interpretation blog post
- When you need deep understanding of a paper for a project
- Evaluating whether to implement or build upon a paper
- Preparing for a paper reading group or presentation

**Do NOT use for:** Quick skimming (use abstract + conclusion only), arXiv sanity checks, non-academic articles.

## Workflow Overview

```
Enter paper name
    │
    ▼
Phase 1: PDF Text Extraction ────→ extracted-text.txt
    │
    ▼
Phase 2: Pass 1 — Context & Structure
    │  ├─ Read: title, abstract, figures, tables, conclusion
    │  ├─ Output: elevator pitch + readability assessment
    │  └─ Decision: proceed or stop?
    │
    ▼
Phase 3: Pass 2 — Deep Reading (6 Dimensions)
    │  ├─ Dimension 1: Concept Map
    │  ├─ Dimension 2: Method Deconstruction
    │  ├─ Dimension 3: Claim-Evidence Audit
    │  ├─ Dimension 4: Reproducibility Check
    │  ├─ Dimension 5: Literature Context
    │  └─ Dimension 6: Personal Engagement
    │
    ▼
Phase 4: Synthesis ────→ summary.json + notes.md + blog post
```

## Phase 1: Text Extraction

Run the extraction tool and read extracted text:

```bash
node tools/process-paper.js "<Paper Folder Name>"
```

Read `extracted-text.txt` to verify quality before proceeding.

## Phase 2: Pass 1 — Context & Structure

Read these sections from the extracted text:
1. **Title + Abstract** — Core claim and contribution
2. **Figures/Tables** — Key results visually (describe what figures show)
3. **Introduction** — Problem setup, motivation, contributions
4. **Conclusion** — What they achieved

**Output: 1-paragraph elevator pitch. Answer these questions:**

```
What problem does this paper solve?
Why is this problem important? 
What is the key insight/claim?
What is the single most impressive result?
```

**Readability check** — how hard is this paper?
- Prior knowledge required (what do I need to know first?)
- Sections I expect to struggle with

**Go/no-go decision:** Is this paper worth the deep read?

## Phase 3: Pass 2 — Deep Reading (6 Dimensions)

Read the remaining sections (Method, Experiments, Analysis) systematically. For each dimension, answer all questions.

### Dimension 1: Concept Map

Extract the paper's vocabulary and formalisms:

| Question | Answer |
|----------|--------|
| New/specialized terms defined? | List each with definition |
| Mathematical notation? | List key symbols and their meanings |
| Core equations? | Number and significance of each |
| Architecture components? | Name + role of each module |
| Key hyperparameters? | Values that matter |

### Dimension 2: Method Deconstruction

```
Problem Formulation:
  - Input / Output / Task definition
  - Assumptions made
  - Scope (what's included/excluded)

Architecture:
  - How does data flow?
  - What are the key design choices?
  - Why these choices? (ablation justification)

Training:
  - Loss functions (mathematical form + intuition)
  - Optimization (optimizer, LR, schedule, epochs)
  - Data (datasets, preprocessing, augmentation)
  - Compute (GPU hours, model size, inference speed)

Key Baselines:
  - What methods do they compare against?
  - Are the baselines fairly implemented?
```

### Dimension 3: Claim-Evidence Audit

Map every claim to its supporting evidence:

| Claim (from intro/conclusion) | Evidence Location | Evidence Quality | Verdict |
|-------------------------------|-------------------|------------------|---------|
| "... achieves SOTA" | Table X, dataset Y | ±σ reported? Statistical test? | Pass/Fail/Unclear |
| "... generalizes to..." | Ablation Z, scenario W | Is the test distribution truly different? | Pass/Fail/Unclear |

**Critical checks:**
- Are metrics appropriate for the problem?
- Are comparisons fair (same compute, same data)?
- Is there cherry-picking of results?
- Are failure cases/limitations honestly discussed?

### Dimension 4: Reproducibility Check

| Item | Status |
|------|--------|
| Code publicly available? | Yes/No/Partial |
| Datasets all public? | Yes/No |
| Training hyperparameters fully specified? | Yes/Partial/No |
| Random seeds reported? | Yes/No |
| Key implementation details clear? | Yes/No |
| Estimated effort to reproduce | Easy/Medium/Hard |

**Practical bottom line:** Could I implement this paper? What would be the hardest part?

### Dimension 5: Literature Context

- **Prerequisites:** What prior work MUST I understand to follow this?
- **Related methods:** What's the closest alternative approach?
- **Positioning:** Does this open a new direction, or is it an incremental improvement?
- **Follow-up work:** What does this enable? What's the obvious next step?

### Dimension 6: Personal Engagement

- **Questions:** What's still unclear after reading?
- **Analogies:** What's this similar to in another domain?
- **Critique:** What would I do differently?
- **Application:** How could I use this? What would it take?
- **Surprises:** What contradicted my expectations?
- **Mental model:** How do I explain this paper to a colleague in 2 minutes?

## Phase 4: Synthesis — Generate Outputs

### Output 1: summary.json

Structured, machine-readable summary for quick reference:

```json
{
  "title": "Paper title",
  "meta": {
    "venue": "CVPR 2024",
    "authors": "Lead author (Affiliation)",
    "code": "https://github.com/...",
    "project": "https://project.page/"
  },
  "research_question": "2-3 sentence description of the problem and why it matters",
  "methodology": "Concise description of the approach (3-5 sentences covering architecture, objective, key design)",
  "key_findings": [
    "Quantitative result 1 with absolute numbers",
    "Ablation insight: what matters and why",
    "Qualitative finding about behavior or limitations"
  ],
  "claim_audit": [
    {"claim": "Main claim from paper", "evidence": "Table/Figure X", "verdict": "supported|partial|unsupported"}
  ],
  "prior_knowledge_needed": [
    "Concept 1 (e.g., Attention mechanism)",
    "Concept 2 (e.g., MANO model)"
  ],
  "reproducibility": {
    "code_available": true,
    "datasets_public": true,
    "training_details_specified": "Full|Partial|Minimal",
    "estimated_difficulty": "Easy|Medium|Hard",
    "notes": "What would be tricky to reproduce"
  },
  "limitations": [
    "Limitation 1 acknowledged by authors",
    "Limitation 2 I identified during reading"
  ],
  "my_questions": [
    "Question 1 that remains unanswered",
    "Question 2 about design choices"
  ],
  "reading_time_minutes": 45,
  "overall_assessment": "Novelty (1-5) / Soundness (1-5) / Clarity (1-5)"
}
```

### Output 2: notes.md

Detailed reading notes following the 6 dimensions:

```
# [Paper Title] — Reading Notes

## Meta
- Title, venue, year, authors, links (code, project, paper)

## Elevator Pitch
[1-paragraph from Phase 2]

## 1. Concept Map
- Key terms with definitions
- Notation table
- Core equations (numbered, with explanations)
- Architecture diagram (textual description)

## 2. Method Deconstruction
### Problem Formulation
Input → Output, assumptions, scope

### Architecture
Component breakdown, data flow, key design choices

### Training
Loss functions, optimization, data, compute

### Baselines Compared
List with brief description of each

## 3. Claim-Evidence Audit
| Claim | Evidence | Quality | Verdict |

## 4. Reproducibility
Code, data, hyperparameters, missing details

## 5. Literature Context
Prerequisites, related work distinction, positioning, follow-up directions

## 6. Personal Engagement
- Questions unanswered
- Analogies that clicked
- Critique
- Application ideas
- Mental model explanation

## Key Results Table
| Dataset | Metric | Ours | Best Baseline | Delta |
|---------|--------|------|---------------|-------|

## References
```

### Output 3: Blog Post

Public-facing article for the blog (`source/_posts/`). Target audience: ML practitioners familiar with basics but not the specific subfield.

Structure:
```
---
title: [Title]论文深度解析：[Subtitle]
date: YYYY-MM-DD HH:MM:SS
categories: [Area1, Area2]
tags: [Tag1, Tag2, ...]
toc: true
mathjax: true
comments: true
---

# [Title]论文深度解析：[Subtitle]

## 引言
- Problem they solve, why it matters
- Core contribution in plain language
- <!-- more --> (excerpt marker)

## Background
- What knowledge do readers need?
- Why is this problem hard?

## Core Idea / Method
- Architecture overview (ASCII diagram if helpful)
- Key insight explained with intuition
- Tables for comparison

## Experiments
- Key results in tables
- What each experiment proves

## Key Takeaways
- 3-5 major findings

## Limitations & Future Work
- As acknowledged by authors + my additions

## Personal Reflection
- What I found most interesting
- Questions it raised for me
- Connections to other work

## References
```

## Verification Checklist

Before finishing, verify:

- [ ] All 6 dimensions covered in notes.md
- [ ] summary.json has all required fields
- [ ] summary.json 和 notes.md 全部使用中文（专业术语原文保留）
- [ ] Blog post has front matter (date, categories, tags)
- [ ] Quantitative results include comparison baselines (not just absolute)
- [ ] Claim-audit identifies at least one unsupported/partial claim (if none, re-check)
- [ ] At least 3 personal questions documented
- [ ] Elevator pitch passes "explain to a colleague" test
- [ ] Read extracted text once more to ensure no misinterpretation

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Skipping Pass 1, going straight to deep read | Always skim first — build the map before filling details |
| Trusting claims without checking evidence | Force yourself to find supporting evidence for each claim |
| Writing notes in reading order instead of by dimension | Use the 6-dimension structure — it's designed for understanding, not chronology |
| Generating blog before notes | Notes are for understanding, blog is for communicating. Do understanding first. |
| Not tracking what's unclear | Questions are as important as answers. Always capture uncertainties. |
| Ignoring figures/tables | Text-only analysis misses 50% of the paper. Describe every figure and table. |
| Overly positive blog (no criticism) | The best papers have limitations. Acknowledging them shows deeper understanding. |
| Missing prerequisites | If you can't explain a key concept, the paper analysis will be shallow. Identify what you need to learn first. |
| 英文输出 | 用户需要中文阅读辅助。summary.json 和 notes.md 全部内容使用中文。 |

## Key Insight

> A paper is not understood until you can explain it to someone else,
> critique its weaknesses, and imagine its next steps.
> The 6 dimensions ensure you do all three.
