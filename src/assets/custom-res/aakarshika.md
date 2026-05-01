# Aakarshika Priydarshi

**Lead Full-Stack Engineer · Cloud & AI Systems**

9+ years building and owning production systems at scale — 50K+ users, cloud-native architectures, and AI-driven applications.

## Contact

- Phone: +1 (571) 418-1458
- Email: aakarshika93@gmail.com
- GitHub: [github.com/aakarshika](https://github.com/aakarshika)
- LinkedIn: [linkedin.com/in/aakarshika](https://linkedin.com/in/aakarshika)
- Website: [aakarshika.com](https://aakarshika.com)

---

## Experience

### Senior Software Developer — MdThink, Maryland
*2022 — Present*
*Stack: Node.js · PostgreSQL · Python · Angular · AWS · React · Java*

- Led **end-to-end development and architecture** of multi-tenant government regulatory platforms serving **~50K users and ~5K daily requests** across Angular, Node.js, and Aurora PostgreSQL.
- Designed and owned **critical platform modules** including **reporting, notifications, real-time chat (WebSockets), RBAC authorization, large file uploads (S3), and compliance workflows.**
- Architected and delivered a **reporting system (on-demand + scheduled)** using API-triggered and scheduled pipelines, **improving developer velocity and isolating heavy workloads** from core application flows.
- Improved **database performance (~20%)** by optimizing complex PostgreSQL queries, restructuring schemas, and eliminating inefficient joins and aggregations.
- Built **reusable Angular component systems** and implemented **lazy loading + DOM restructuring**, significantly improving **frontend startup performance and maintainability.**
- Implemented **JWT + session-based authentication** and platform-wide **RBAC**, strengthening security across multi-tenant workflows.
- Introduced **integration testing into CI/CD pipelines**, improving release stability and reducing production regressions.
- Led **cross-functional collaboration** with QA, product, and DevOps, including **sprint planning, code reviews, and architectural decisions.**
- Debugged and resolved **production issues across frontend, backend, and database layers**, including critical **data consistency issues affecting audit workflows.**
- Owned **design, delivery, and production stability** of multiple critical modules across frontend, backend, and cloud layers.

#### Full Stack Developer — MdThink
*Apr 2019 — Aug 2022*

- Developed production features across **Angular frontends and Node.js backend services** deployed on AWS infrastructure.
- Maintained enterprise regulatory systems and optimized **PostgreSQL queries and backend APIs** for stability and performance.
- Partnered with product and DevOps teams to deliver full-stack features across database, API, UI, and cloud deployment layers.

### Backend Developer — Neuron Inc
*Dec 2017 — Jan 2019*

- Developed backend systems for a **cloud-hosted AI chatbot platform using Django**, deployed on **AWS EC2, S3, and RDS PostgreSQL.**
- Designed **REST APIs for chatbot messaging, session tracking, and analytics ingestion** supporting multi-tenant application environments.
- Implemented secure authentication systems using **JWT tokens and RBAC** enabling user and admin-level platform operations.
- Optimized backend performance and request handling through validation layers, rate limiting, and scalable API design.

### Backend Java/Python Developer — Delhivery
*Dec 2016 — Sep 2017*

- Engineered **large-scale data pipelines processing TB-scale datasets** using Python, Java, and Spark on AWS EMR for their ETL Pipeline.
- Built and optimized **distributed Spark jobs** for data transformation (**JSON → Parquet**) and analytics ingestion into Amazon Redshift.
- Developed **streaming and batch ingestion pipelines** using Kinesis and queue-based architectures.
- Improved **pipeline reliability** by introducing fault-tolerant processing, eliminating **6-hour restart cycles** from S3-based batch failures.

### Machine Learning Research Assistant — George Mason University, Virginia
*2016 — 2018*
*Stack: OpenCV · PyTorch · Conda · NLTK*

- Developed CNN-based ML pipelines for image genre classification — **achieved 40%+ baseline accuracy** from scratch.
- Conducted sentiment analysis using NLTK and bag-of-words on restaurant review datasets.
- Prototyped Android interface for mobile consumption of ML model output.

---

## Skills

- **Languages & Backend:** Node.js, Python (Django, FastAPI), REST APIs, WebSockets, Microservices  
- **Frontend:** React, TypeScript, Angular, TailwindCSS  
- **Cloud & DevOps:** AWS (Lambda, EC2, S3, Kinesis, RDS), Docker, Kubernetes, CI/CD, Jenkins  
- **Databases:** PostgreSQL, Aurora, MySQL, MongoDB, PLpgSQL  
- **AI / ML:** LangChain, LangGraph, RAG pipelines, PyTorch, Hugging Face  
---

## Education

- **Master of Science — Computer Science**, George Mason University, Virginia *(2016 — 2018)*
- **B.Tech — Computer Science & Engineering**, JSS Academy of Technical Education, India *(2012 — 2016)*

---

## Projects

### Outgoing
*React/TS · Django · PostgreSQL · JWT*

Event discovery & skill-based ticketing platform for urban India.

- Built end-to-end: **chip-in ticketing model** where attendees contribute a skill for discounted entry; auto-generated social graph from shared attendance history.
- Designed context-aware card layout system — same component promotes different fields to hero across **6 browse modes** (Tonight, Free, Network, etc.) with zero layout duplication.
- Full quality pipeline: **Pylint 10/10**, Black, isort, ESLint, TypeScript strict — enforced via pre-push hooks, not CI.

### WriterVerse
*Django · LangGraph · pgvector · Redis · Docker*

AI writing agent for fiction that knows your story.

- Built **LangGraph multi-agent system**: ContinueAgent, ConsistencyAgent, OutlineAlignAgent — each runs deterministic tools first, calls LLM only when local checks are insufficient.
- Designed **hybrid RAG pipeline**: pgvector similarity + BM25 keyword scoring + MiniLM cross-encoder reranking — pure vector search fails on fiction's proper nouns and invented terms.
- Abstracted model selection behind role system swapping by slash command — the entire model stack is one line in config.
- Hard boundary between `ai_bridge` (Django, story data) and `ai_engine` (provider-agnostic) — LLM providers are swappable without touching agent code.

### Twirly — [twirlyapp.com](https://twirlyapp.com)
*React · Supabase · PLpgSQL · Capacitor*

Live comparison platform — deployed to web, iOS, and Android.

- Sole engineer on a **live deployed product**; ships from a single React codebase to web + iOS + Android via Capacitor.
- Moved **voting integrity, deduplication, and ranking logic into PLpgSQL stored procedures** to enforce consistency and prevent client-side manipulation.
- Built **8-theme design system** as a first-class architecture concern — token sets drive every component; adding a theme touches zero component code.
- Beta infrastructure: Sentry error tracking, offline support, Supabase edge functions for feedback collection.

### Brainboard
*React/TS · Django · FastAPI · LangChain · WebSocket*

Modular AI productivity dashboard with independently intelligent widgets.

- Architected **dual backend system**: Django for synchronous CRUD, FastAPI for async LLM streaming — based on each framework's actual concurrency model, not convention.
- Built **FastAPI-based backend with async WebSocket support** for real-time widget updates and streaming responses.
- Widget system is fully extensible — self-contained widgets, config-driven layout; **new widget types require zero changes to the dashboard layer**.

### Daywise
*Kotlin Multiplatform · Compose · GPT · Hugging Face*

ADHD-friendly mobile task manager with LLM-powered predictive scheduling.

- Architected shared business logic for **Android and iOS using Kotlin Multiplatform** — single codebase, native performance on both platforms.
- LLM integration for predictive, personalized task suggestions based on behavioural patterns.

---

## Additional

- **Architecture:** Dual-backend separation, API envelope design, ephemeral DB patterns, agent pipelines
- **AI / RAG:** Hybrid retrieval (vector + BM25 + rerank), LangGraph agents, cost-aware LLM orchestration
- **Engineering Craft:** Pre-push quality gates, Pylint 10/10, TypeScript strict, React Scan, Django Silk profiling
- **Availability:** Open to senior contract or FTE roles — full-stack, frontend, or AI-integrated products
