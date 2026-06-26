# Projects

---

### WriterVerse — https://writerverse.info
*Django · REST APIs · LangGraph · pgvector · Redis · Docker*

- **AI writing platform for long-form fiction**, built on a **Django backend** with a **multi-agent LangGraph architecture** (ContinueAgent, ConsistencyAgent, OutlineAlignAgent) — each agent runs deterministic tools first and calls the LLM only when local checks are insufficient, cutting token cost.

- Designed a **hybrid RAG retrieval pipeline** — **pgvector** cosine similarity + **Okapi BM25** keyword scoring + **cross-encoder LLM reranking** — with config-tunable fusion weights; pure vector search fails on fiction's proper nouns and invented terms.

- Built **stateful, memory-aware async workflows** with per-call AI usage instrumentation, enforcing **factual and narrative consistency** across multi-thousand-word documents.

- Architected a **provider-agnostic AI layer** with **role-based model abstraction** (draft / small / expert) — drop-in model switching between **OpenAI and Anthropic** via one config line, with a hard boundary between Django story data (`ai_bridge`) and the inference engine (`ai_engine`).

---

### Brainboard
*React · TypeScript · Django · FastAPI · LangChain · WebSockets*

- Architected a **dual-backend system**: **Django for synchronous CRUD**, **FastAPI for async LLM streaming** — chosen on each framework's real concurrency model, not convention.

- Built a **React frontend** with a fully extensible **widget system** — self-contained, config-driven widgets where new widget types require **zero changes to the dashboard layer**.

- Implemented **WebSocket streaming** for real-time widget updates and live LLM responses.

---

### Outgoing
*React · TypeScript · Django · PostgreSQL · JWT*

- Built an **event discovery & skill-based ticketing platform** end-to-end on **React + Django + PostgreSQL** — a chip-in ticketing model with an auto-generated social graph from shared attendance history.

- Designed a **context-aware card layout system** — one component promotes different fields to hero across **6 browse modes** with zero layout duplication.

- Enforced a **full quality pipeline** (Pylint 10/10, Black, isort, ESLint, TypeScript strict) via pre-push hooks.

---

### Twirly — https://twirlyapp.com
*React · TypeScript · Supabase · PLpgSQL · Capacitor*

- **Sole engineer on a live, deployed product** — ships from a single **React/TypeScript** codebase to web, iOS, and Android via Capacitor.

- Moved **voting integrity, deduplication, and ranking into PLpgSQL stored procedures** to enforce consistency and prevent client-side manipulation.

- Built an **8-theme, token-driven design system** where adding a theme touches zero component code; integrated Sentry, offline support, and Supabase edge functions.

---

### Daywise
*Kotlin Multiplatform · Compose · GPT · Hugging Face*

- Built a **cross-platform mobile app** with shared business logic across Android and iOS via Kotlin Multiplatform.

- Integrated **LLM-powered predictive scheduling** — personalized task suggestions generated from user behavioral patterns.
