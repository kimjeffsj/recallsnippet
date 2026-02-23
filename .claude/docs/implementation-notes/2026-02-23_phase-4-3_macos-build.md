# Phase 4.3: 크로스 플랫폼 빌드 (macOS)

**날짜**: 2026-02-23
**Phase**: 4.3
**범위**: 앱 아이콘 생성, 설정 점검, macOS 릴리즈 빌드

---

## 변경된 파일

| 파일 | 작업 |
|------|------|
| `src-tauri/tauri.conf.json` | `copyright` 정보 추가 |
| `src-tauri/icons/*` | `pnpm tauri icon` 명령으로 아이콘 리소스 갱신 |
| `src-tauri/target/release/bundle/macos/RecallSnippet.app` | 빌드 결과물 생성 |
| `src-tauri/target/release/bundle/dmg/RecallSnippet_0.1.0_aarch64.dmg` | DMG 설치 파일 생성 |

## 빌드 결과

- **명령어**: `pnpm tauri build`
- **소요 시간**: 약 2분
- **결과물**:
  - App Bundle: `src-tauri/target/release/bundle/macos/RecallSnippet.app`
  - DMG: `src-tauri/target/release/bundle/dmg/RecallSnippet_0.1.0_aarch64.dmg`

---

## 구현 설명

### 아이콘 생성
- `src/assets/recallsnippet_logo.png`를 원본으로 사용하여 `pnpm tauri icon` 명령 실행
- iOS, Android, macOS, Windows용 아이콘 자동 생성됨

### 빌드 설정
- `tauri.conf.json`에 `copyright` 필드 추가 ("Copyright © 2026 Jeff Seongjun Kim. All rights reserved.")
- `identifier`: `com.jeffseongjunkim.recallsnippet` 유지

### Rust 컴파일 경고 (Warnings)
빌드 중 다음과 같은 `dead_code` 경고가 발생했으나, 로직에는 영향 없음:
- `DEFAULT_EMBEDDING_MODEL` (unused constant)
- `delete_embedding` (unused function)
- `DEFAULT_OLLAMA_BASE_URL` (unused constant)
- `Database::new_in_memory` (test-only function)

이들은 주로 테스트 코드에서 사용되거나, 설정값으로 대체되면서 사용되지 않게 된 상수들임. 추후 리팩토링 시 정리 가능.

## 검증 포인트 (사용자 확인 필요)
1. 생성된 `.app` 실행 시 정상 구동 여부
2. `~/Library/Application Support/com.jeffseongjunkim.recallsnippet/` 경로에 데이터베이스 파일 생성 여부
3. Ollama 기능 정상 동작 여부
