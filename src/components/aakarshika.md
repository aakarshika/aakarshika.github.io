# Aakarshika Priydarshi

**Senior Software Engineer · Full-Stack · AI Systems**

6 years building full-stack products at scale — from government platforms serving 50K+ users to AI agent pipelines and mobile apps shipped to production.

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

- Led **full-stack architecture and development** of Maryland regulatory platforms using **Node.js, Angular (TypeScript), and PostgreSQL**, deployed on **AWS (EKS, EC2, Lambda, API Gateway, S3)** supporting complex government workflows.
- Designed and implemented **scalable REST API systems and modular Angular UI components** powering multi-tenant enterprise applications handling high-volume transactional and reporting workloads.
- Architected cloud infrastructure using **AWS EKS, EC2, Lambda, and S3**, enabling containerized microservices and serverless processing pipelines across production environments.
- Improved **Amazon Aurora PostgreSQL performance by ~20%** through query optimization, schema tuning, and backend service restructuring.
- Implemented asynchronous background processing using **AWS Lambda** for document generation, notifications, and system audit workflows integrated with secure **S3 document storage**.
- Established internal engineering standards across Node.js services and database schemas while collaborating with DevOps on **CI/CD pipelines and AWS deployment workflows**.

#### Full Stack Developer — MdThink
*Apr 2019 — Aug 2022*

- Developed production features across **Angular frontends and Node.js backend services** deployed on AWS infrastructure.
- Maintained enterprise regulatory systems and optimized **PostgreSQL queries and backend APIs** for stability and performance.
- Partnered with product and DevOps teams to deliver full-stack features across database, API, UI, and cloud deployment layers.

### Backend Developer — Neuron Inc
*Dec 2017 — Jan 2019*

- Developed backend systems for a **cloud-hosted AI chatbot platform** using **Spring Boot and Django** deployed on **AWS EC2, S3, and RDS PostgreSQL**.
- Designed **REST APIs for chatbot messaging, session tracking, and analytics ingestion** supporting multi-tenant application environments.
- Implemented secure authentication systems using **JWT tokens and RBAC** enabling user and admin-level platform operations.
- Optimized backend performance and request handling through validation layers, rate limiting, and scalable API design.

### Backend Java/Python Developer — Delhivery
*Dec 2016 — Sep 2017*

- Engineered large-scale **data ingestion and ETL pipelines** using **Python, Java, Spark, and AWS services** for logistics analytics.
- Processed historical and streaming operational data using **Kafka/Kinesis pipelines** into **AWS Redshift data warehouses**.
- Developed distributed Spark processing jobs on **AWS EMR** converting large JSON datasets into optimized Parquet formats.
- Automated ingestion workflows using **AWS Lambda, S3, and EC2** with scheduling via **Airflow and AWS Data Pipeline**.

### Machine Learning Research Assistant — George Mason University, Virginia
*2016 — 2018*
*Stack: OpenCV · PyTorch · Conda · NLTK*

- Developed CNN-based ML pipelines for image genre classification — **achieved 40%+ baseline accuracy** from scratch.
- Conducted sentiment analysis using NLTK and bag-of-words on restaurant review datasets.
- Prototyped Android interface for mobile consumption of ML model output.

---

## Skills

- **Frontend:** React 18, TypeScript, Angular, TailwindCSS, shadcn/ui, Vite, Framer Motion, SwiftUI
- **Backend:** Node.js, Django 5.2, FastAPI, DRF, REST, WebSockets, Pub/Sub, Microservices
- **AI / ML:** LangChain, LangGraph, pgvector, RAG pipelines, PyTorch, Hugging Face, OpenCV, NLP
- **Databases:** PostgreSQL, MySQL, Oracle, MongoDB, SQLite, PLpgSQL, Query Optimization, Aurora RDS
- **Cloud & DevOps:** AWS (Lambda, EC2, S3, Kinesis, RDS), Docker, Kubernetes, Jenkins, CI/CD, NewRelic
- **Mobile & Other:** Capacitor (iOS/Android), Kotlin Multiplatform, Unity, Blender, Agile, JIRA

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
- Moved voting integrity, deduplication, and ranking into **PLpgSQL stored procedures** — result manipulation from a compromised frontend is architecturally impossible.
- Built **8-theme design system** as a first-class architecture concern — token sets drive every component; adding a theme touches zero component code.
- Beta infrastructure: Sentry error tracking, offline support, Supabase edge functions for feedback collection.

### Brainboard
*React/TS · Django · FastAPI · LangChain · WebSocket*

Modular AI productivity dashboard with independently intelligent widgets.

- Architected **dual backend system**: Django for synchronous CRUD, FastAPI for async LLM streaming — based on each framework's actual concurrency model, not convention.
- FastAPI async runtime handles **concurrent widget WebSocket connections** with token-by-token UI streaming; Django's synchronous cycle explicitly excluded from this path.
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
