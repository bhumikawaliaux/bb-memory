# BB Memory

A speculative internal product concept for Bakken & Bæck: a collective memory that helps a distributed creative team discover what it has already learned.

Describe a problem in your own words. BB Memory retrieves related learnings, explains why they appeared, and points to the people and projects behind them.

## Run

```bash
npm install
npm run dev
```

The first semantic search downloads `Xenova/all-MiniLM-L6-v2` in the browser via Transformers.js. After that, the model is cached locally. No API key is required. Queries are not sent to an external LLM.

## What is real

- **Semantic retrieval** — MiniLM embeddings, cosine similarity, plus a small lexical and concept boost.
- **Public BB projects** — Machine Windows, Everyday Experiments, Sanity, Sierra, På(fyll), used as environments with links to public case pages.

## What is prototype fiction

People are fictional composites. Memories are fictionalised learnings *inspired by* public BB writing, each labelled and sourced. This is not internal BB information, and it does not claim BB currently has this problem.

## Search pipeline

```text
User query
   → related concepts (deterministic lexicon)
   → MiniLM embedding
   → compare with memory embeddings
   → rank (cosine + small lexical/concept signal)
   → human-language relevance note
   → results, or an honest low-confidence state
```

AI recommends. Humans interpret. There is no chatbot.
