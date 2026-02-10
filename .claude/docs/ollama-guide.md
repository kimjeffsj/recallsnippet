# Ollama 연동 가이드

RecallSnippet은 로컬 AI(Ollama)를 사용하여 솔루션 생성, 태그 추천, 시맨틱 검색을 지원합니다.

---

## 1. Ollama 설치

### macOS
```bash
brew install ollama
```

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows
[https://ollama.com/download](https://ollama.com/download)에서 설치 파일 다운로드

---

## 2. 필수 모델 다운로드

RecallSnippet은 두 가지 모델을 사용합니다:

### LLM 모델 (솔루션 생성, 태그 추천)
```bash
ollama pull qwen2.5-coder:7b
```

### 임베딩 모델 (시맨틱 검색)
```bash
ollama pull nomic-embed-text
```

> 메모리가 8GB 이하인 경우 더 작은 모델을 사용할 수 있습니다:
> ```bash
> ollama pull qwen2.5-coder:3b
> ```

---

## 3. Ollama 서버 시작

```bash
ollama serve
```

기본 포트: `http://localhost:11434`

서버가 정상 동작하는지 확인:
```bash
curl http://localhost:11434/api/tags
```

---

## 4. RecallSnippet 연동

### 설정 (Settings)

1. 앱 우측 상단의 **Settings** (톱니바퀴) 아이콘 클릭
2. 다음 항목 설정:
   - **Ollama Base URL**: `http://localhost:11434` (기본값)
   - **LLM Model**: `qwen2.5-coder:7b`
   - **Embedding Model**: `nomic-embed-text`
3. 설정 저장 후 사이드바 하단의 **Ollama AI** 상태가 녹색으로 변경되면 연동 성공

### 기능별 사용법

#### Spotlight Chat (AI 회상 어시스턴트)
1. `⌘J` (Mac) / `Ctrl+J` (Windows/Linux)로 어디서든 Spotlight Chat 열기
2. 자연어로 질문: "Docker 네트워크 문제 어떻게 해결했더라?"
3. AI가 저장된 스니펫을 검색하여 관련 정보 기반으로 답변
4. SnippetDetail 페이지의 **Ask AI** 버튼으로 해당 스니펫 컨텍스트 포함 대화 가능

#### 태그 추천 (AI Tags)
1. Snippet 작성 화면에서 Title, Problem 등을 입력
2. Tags 섹션의 **AI Tags** 버튼 클릭
3. 기존 태그 중 관련 태그를 자동 선택

#### 시맨틱 검색
1. 상단 검색바에 3자 이상 입력
2. 키워드 매칭 + 벡터 유사도 기반으로 관련 스니펫 검색
3. 검색은 제목, 문제, 솔루션, 코드 전체를 대상으로 수행

#### 자동 임베딩
- 스니펫 생성/수정 시 백그라운드에서 자동으로 임베딩 벡터 생성
- 별도 설정 불필요

---

## 5. 트러블슈팅

### Ollama 상태가 빨간색 (연결 실패)

1. **Ollama 서버가 실행 중인지 확인**
   ```bash
   curl http://localhost:11434/api/tags
   ```
   응답이 없으면 `ollama serve` 실행

2. **포트 충돌 확인**
   ```bash
   lsof -i :11434
   ```
   다른 프로세스가 점유 중이면 종료하거나 Settings에서 Base URL 변경

3. **방화벽 확인**: 로컬 연결이 차단되지 않았는지 확인

### 모델 미설치 오류

```
model 'qwen2.5-coder:7b' not found
```

해결:
```bash
ollama pull qwen2.5-coder:7b
```

설치된 모델 확인:
```bash
ollama list
```

### 메모리 부족

증상: 모델 로딩 시 시스템 느려짐 또는 OOM 오류

해결:
- 더 작은 모델 사용: `qwen2.5-coder:3b` 또는 `qwen2.5-coder:1.5b`
- 다른 메모리 집약적 앱 종료
- 최소 권장 RAM: 8GB (7B 모델 기준)

#### 중복 스니펫 감지
- New/Edit Snippet 화면에서 Title이나 Problem 입력 시 자동으로 유사 스니펫 검색
- 유사도 50% 이상인 기존 스니펫이 있으면 배너로 알림
- 링크 클릭으로 기존 스니펫으로 바로 이동 가능

### 응답 타임아웃

증상: AI Chat 요청 후 오래 대기

원인:
- 모델 첫 로딩 시 시간 소요 (콜드 스타트)
- GPU 없이 CPU만 사용하는 경우 속도 저하

해결:
- 첫 요청은 모델 로딩 시간이 포함되므로 최대 30초~1분 대기
- GPU 가속 지원 확인: `ollama ps`
