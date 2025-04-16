# 심리상담 분석 도구

심리 상담사를 위한 상담 내용 분석 웹 애플리케이션입니다. 녹음된 상담 자료의 전사(텍스트) 내용을 업로드하면 OpenAI API를 통해 분석하여 상담 노트로 정리해줍니다.

## 기능

- 로컬 파일 업로드 (텍스트 파일)
- URL을 통한 텍스트 가져오기 (구글 드라이브 등)
- 텍스트 에디터에서 직접 내용 입력/수정
- OpenAI API를 통한 상담 내용 분석
- 분석 결과 저장 및 표시
- Firebase Firestore를 통한 데이터 저장

## 기술 스택

- Next.js
- TypeScript
- Tailwind CSS
- OpenAI API
- Firebase Firestore

## 설치 및 실행

1. 프로젝트 클론:
   ```
   git clone <repository-url>
   cd <project-directory>
   ```

2. 의존성 설치:
   ```
   npm install
   ```

3. 환경 변수 설정:
   `.env.local.example` 파일을 `.env.local`로 복사한 후 OpenAI API 키와 Firebase 설정 정보를 입력하세요.

4. 개발 서버 실행:
   ```
   npm run dev
   ```

5. 브라우저에서 http://localhost:3000 으로 접속하여 애플리케이션을 확인하세요.

## 사용 방법

1. 텍스트 파일을 업로드하거나 URL을 입력하여 상담 내용을 가져옵니다.
2. 필요한 경우 텍스트 에디터에서 내용을 편집합니다.
3. "GPT로 보내기" 버튼을 클릭하여 내용을 분석합니다.
4. 분석 결과가 우측 패널에 표시됩니다.
5. 필요한 경우 결과를 PDF로 저장하거나 공유할 수 있습니다.

## 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다. 