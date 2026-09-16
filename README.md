# BB Memory V2

A speculative internal product concept for Bakken & Bæck: a collective memory that helps a distributed creative team discover what it has already learned.

## What's new in V2

- **Real semantic search in the browser** using `Xenova/all-MiniLM-L6-v2` via Hugging Face Transformers.js.
- Search is based on vector similarity, not a predefined keyword/result map.
- Each memory is embedded from its title, summary, context, experiments, findings, decisions and tags.
- Query and memory vectors are normalized and ranked using cosine similarity (dot product after normalization).
- A small lexical boost preserves useful exact-term matches.
- The UI shows when semantic indexing is loading, ready, or has fallen back to keyword search.
- AI search can be toggled off to compare semantic retrieval with conventional keyword search.
- Memory contribution remains local to the prototype; new memories are included in subsequent semantic searches.

## Run in Cursor

```bash
npm install
npm run dev
```

The first semantic search downloads the MiniLM model in the browser. Depending on connection speed, this can take a little while. Transformers.js uses the browser cache after the first load.

## Product note

The memories and people in this prototype are **fictionalised demo data** inspired by themes in BB's publicly available work. They are not presented as internal BB information.

The product is intentionally a speculative hypothesis: an external designer cannot know whether BB currently experiences this exact problem without internal research.

## AI architecture

```text
User query
   ↓
MiniLM embedding
   ↓
Compare against memory embeddings
   ↓
Cosine similarity + small lexical signal
   ↓
Ranked memories
   ↓
Contextual relevance explanation
```

The model runs client-side, so the demo does not require an API key and does not send the query to an external LLM service.
