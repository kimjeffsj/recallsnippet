# React/Vite에서 assets 폴더의 이미지를 로고로 사용하기

## 문제

assets 폴더에 있는 로고 이미지 파일(`recallsnippet_logo.png`)을 헤더 컴포넌트에서 로고로 표시하고 싶었음.

## 해결방법

1. **이미지 import**: Vite는 import를 통해 정적 자산을 자동으로 처리함
2. **img 태그 사용**: import한 경로를 `src` prop에 전달
3. **스타일 적용**: Tailwind CSS로 크기와 모양 조정

## 코드 스니펫

```tsx
// 1. 이미지 import
import logo from "@/assets/recallsnippet_logo.png";

// 2. 컴포넌트에서 사용
export function AppHeader() {
  return (
    <header>
      <div className="flex items-center gap-2.5">
        <img
          src={logo}
          alt="RecallSnippet Logo"
          className="h-8 w-8 rounded-lg object-contain"
        />
        <span className="font-bold text-lg">RecallSnippet</span>
      </div>
    </header>
  );
}
```

## 주요 포인트

- Vite/React에서는 이미지를 import하면 빌드 시 최적화된 경로로 변환됨
- `object-contain`으로 비율을 유지하며 크기 조정
- `@/assets` 경로는 tsconfig의 path alias 설정을 따름
