# Plan 4.3: 크로스 플랫폼 빌드 (macOS)

**목표**: 앱 아이콘을 생성하고 macOS용 릴리즈 빌드를 생성하여 정상 동작을 검증한다.

## Step 1: 앱 아이콘 생성
- **작업**: 기존 `src/assets/recallsnippet_logo.png`를 사용하여 Tauri 앱 아이콘 세트 생성
- **명령어**: `pnpm tauri icon src/assets/recallsnippet_logo.png`
- **확인**: `src-tauri/icons/` 폴더 내의 `.icns`, `.ico`, `.png` 파일들이 갱신되었는지 확인

## Step 2: 빌드 설정 점검
- **파일**: `src-tauri/tauri.conf.json`
- **체크 항목**:
  - `identifier`: `com.jeffseongjunkim.recallsnippet` (현재 설정됨)
  - `version`: `0.1.0` (현재 설정됨)
  - `copyright`: 저작권 정보 추가 (없다면 추가 고려)

## Step 3: 릴리즈 빌드 실행
- **명령어**: `pnpm tauri build`
- **예상 결과**: 
  - 프론트엔드 빌드 (`dist/` 생성)
  - Rust 백엔드 릴리즈 빌드
  - macOS 번들 생성 (`.app`, `.dmg`)
- **출력 위치**: `src-tauri/target/release/bundle/macos/` 및 `dmg/`

## Step 4: 실행 및 검증
- **작업**: 생성된 `RecallSnippet.app` 실행
- **검증 시나리오**:
  1. **앱 실행**: 정상적으로 열리는지, 서명 경고 확인 (로컬 빌드라 ad-hoc 서명됨)
  2. **DB 초기화**: `~/Library/Application Support/com.jeffseongjunkim.recallsnippet/` 경로에 DB 파일 생성 확인
  3. **기능 테스트**:
     - 새 스니펫 작성 및 저장
     - Ollama 연동 상태 확인 (설정값 유지 여부)
     - 앱 종료 후 재실행 시 데이터 유지 확인

## Step 5: 문서화 (Phase 4.4 사전 작업)
- 빌드 과정에서 발생한 이슈나 해결 방법을 `docs/implementation-notes/`에 기록
