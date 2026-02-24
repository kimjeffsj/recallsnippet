# README 및 포트폴리오 웹사이트 작성 계획 (plan-readme.md)

이 문서는 RecallSnippet 프로젝트의 매력적인 `README.md` 작성과 성공적인 포트폴리오 웹사이트 업로드를 위한 전략, 그리고 아키텍처 다이어그램을 담고 있습니다.

## 1. 프로젝트 아키텍처 다이어그램 (Mermaid)

포트폴리오 및 README 최상단이나 기술 스택 설명 란에 프로젝트의 구조와 데이터 흐름을 한눈에 보여주는 아래 아키텍처 다이어그램을 삽입합니다.

```mermaid
graph TD
    subgraph Frontend [Frontend (React + Tauri)]
        UI[User Interface<br>React/Tailwind/shadcn]
        State[State Management<br>TanStack Query]
        Editor[Code Editor<br>CodeMirror 6]
        
        UI --> State
        UI --> Editor
    end

    subgraph Backend [Backend (Rust Core)]
        TauriAPI[Tauri Commands API]
        DBSync[SQLite Manager]
        VectorSearch[Vector Search Engine<br>Cosine Similarity]
        AIClient[AI Client<br>Ollama API]
        
        TauriAPI --> DBSync
        TauriAPI --> VectorSearch
        TauriAPI --> AIClient
    end

    subgraph LocalData [Local Storage & AI]
        SQLite[(SQLite Database<br>Snippets & Embeddings)]
        Ollama[Local LLM<br>Ollama]
        ModelEmbed[Embedding Model<br>nomic-embed-text]
        ModelChat[Chat Model<br>qwen2.5-coder:7b]
        
        Ollama --> ModelEmbed
        Ollama --> ModelChat
    end

    %% Data Flow
    State <-->|IPC Calls| TauriAPI
    DBSync <-->|Read/Write| SQLite
    VectorSearch <-->|Query Vectors| SQLite
    AIClient <-->|HTTP REST| Ollama
    
    %% User Interaction
    User((User)) -->|Search/Save| UI
```

---

## 2. README.md 개선 및 추가 항목 (Action Items)

현재 `README.md`에 다음 항목들을 추가하여 시각적이고 설득력 있는 문서로 업그레이드합니다.

### [ ] 시각적 자료 (미디어) 추가
- **메인 스크린샷:** 앱 실행 시 보이는 첫 메인 화면 이미지 (라이트 모드 및 다크 모드 캡처).
- **핵심 기능 시연 GIF:**
  1. **의미 기반(Semantic) 검색 시연:** 자연어로 코드를 검색하고 유사한 스니펫이 도출되는 장면.
  2. **AI 태그 자동 생성 시연:** 새 스니펫을 붙여넣고 AI가 관련 태그를 자동 생성하는 장면.

### [ ] 아키텍처 및 작동 방식 섹션 추가 (`## 🏗️ Architecture`)
- 위에서 작성한 Mermaid 다이어그램을 `## 🛠️ Tech Stack` 하단에 추가하여 프론트엔드, 백엔드(Rust), 로컬 모델(Ollama) 간 상호작용 메커니즘을 시각적으로 어필합니다.

### [ ] 문제 해결 및 목적 (Problem & Solution) 섹션 추가
- 기존 서비스(Notion, GitHub Gist)와의 차별점을 명시합니다. 구체적으로 **"사내/개인 개발 보안 코드를 퍼블릭 클라우드에 두지 않고 안전하게, 동시에 AI의 이점을 살려 자연어 검색을 하기 위한 목적"**을 기재합니다.

---

## 3. 포트폴리오 웹사이트 구성 전략 가이드 (STAR 기법 활용)

개인 포트폴리오 웹사이트나 블로그에 정리할 때 가장 추천하는 페이지 구성 전략입니다. 리뷰어 및 면접관이 집중하는 기술적 도전 중심의 스토리텔링이 중요합니다.

### 🌟 Hook (캐치프레이즈)
> **"RecallSnippet: 완전한 프라이버시를 보장하는 로컬 AI와 의미 탐색(Semantic Search) 엔진을 품은 오프라인 코드 스니펫 매니저"**

### 1️⃣ Background & Problem (기획 배경 및 문제 정의)
- **문제점 파악:** 개발자는 매일 접하는 에러 원인이나 작은 코드 조각들을 관리하기 위해 구글 드라이브나 노션을 쓰지만 코드 특화 검색이 빈약하고, 사내 코드는 깃허브 등에 개방하기 어렵습니다.
- **해결책 설계:** 완전히 오프라인 기기(로컬) 환경에서만 작동하며, 코드의 '의미(Context)'를 기반으로 검색해주는 강력한 데스크톱 앱을 기획했습니다.

### 2️⃣ Key Features (핵심 기능 어필 - 동영상/GIF 권장)
- **자연어 기반 의미 검색 (Semantic Search):** 단순 키워드(exact match)가 아니라 문맥을 파악해 유사 코드를 핑해줍니다.
- **AI Assistant 자동화 로직:** 로컬 LLM을 통한 코드 문맥 요약 리뷰 및 귀찮은 태그 분류 자동화 제공.
- **완벽한 Local-First Architecture:** 네트워크 연결 없이 기능이 작동하며 데이터 주권을 사용자가 온전히 갖습니다.

### 3️⃣ Technical Challenges (기술적 도전에 대한 고민과 해결 - 하이라이트 ✨)
이 섹션은 지원자의 아웃풋 수준을 평가하는 핵심 파트입니다. 아래 내용들을 고민 흔적으로 녹여내세요.

- **왜 Electron 대신 Tauri(Rust)를 선택했는가?:** 
  - Electron의 과도한 메모리 사용량 이슈를 피하고 초경량 데스크톱 네이티브 경험을 제공하기 위해 Rust 기반인 Tauri 모델을 도입.
- **가벼운 로컬 임베딩 저장소 및 벡터 탐색 직접 구현:** 
  - 서드파티나 거대한 클라우드 Vector DB 서비스(Milvus, Pinecone 등)에 의존장을 피하기 위해, 임베딩 데이터를 **SQLite BLOB에 매핑하고 Rust 코드로 직접 Cosine Similarity(코사인 유사도) 탐색 알고리즘을 작성하여 성능을 최적화**한 여정을 기술.
- **비연결성 로컬 AI 연동 및 비용 최적화:** 
  - OpenAI와 같은 유료 외부 API 의존성을 줄이고 빠른 응답성을 위해 로컬 Ollama 모델(qwen2.5-coder & nomic-embed)을 서버/클라이언트 단에서 연계시켰던 방식.

### 4️⃣ What I Learned (성과 및 러닝 포인트)
- 단순 웹 프론트엔드 개발에 그치지 않고 인터-프로세스 커뮤니케이션(Tauri IPC)을 통한 데스크톱 프로그래밍 지식을 확립하게 됨.
- 임베딩 모델(Embedding Matrix)과 자연어 벡터 검색(Vector Search)의 내부 파이프라인 원리를 이해하는 계기가 됨.

## 4. 즉시 실행할 Next Steps
- [ ] 깃허브 `Releases`에 데모 테스트용 MacOS(`.dmg`) 빌드 및 Windows용 바이너리 업로드하여, "이 앱 다운로드해서 클릭 한 번에 테스트 해보세요"라는 접근성 제공하기.
- [ ] 데몬 연동 부분과 검색 테스트 영상을 1~2개 캡처해서 Readme에 바로 붙여넣기.
