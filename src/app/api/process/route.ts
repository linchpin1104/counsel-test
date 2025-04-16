import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 할당량 초과 문제로 API 호출 대신 샘플 응답을 반환하는 함수
const getMockResponse = (text: string) => {
  // 텍스트 길이에 따라 다른 응답을 생성
  const shortText = text.length < 100;
  
  if (shortText) {
    return `# 상담 내용 요약

## 주요 호소 내용 📝
- 🧠 내담자는 집중력 저하와 학업 스트레스를 호소하고 있습니다.
- 😔 불안감과 자신감 부족을 느끼고 있습니다.

## 주요 내용 정리 📋
- 💫 아이는 학업에 대한 부담감을 크게 느끼고 있습니다.
- 🏫 학교에서 또래관계에 어려움을 겪고 있습니다.
- 👨‍👩‍👧 부모님의 기대에 부응하지 못한다는 부담감이 있습니다.

## 구체적인 실천 방안 🌱
1. 🕰️ 일일 계획표를 만들어 작은 목표부터 달성하기
2. 🧘‍♀️ 하루 10분씩 명상하며 불안감 다스리기
3. 👫 또래 모임에 참여하여 대인관계 확장하기
4. 💬 부모님과 정기적으로 대화하는 시간 갖기
5. 🎯 성취 가능한 목표 설정 및 달성 시 자기 보상하기`;
  } else {
    return `# 상담 내용 요약

## 주요 호소 내용 📝
- 🧠 내담자는 학업 스트레스와 친구 관계에서의 어려움을 호소합니다.
- 😔 불안감과 우울감이 지속되고 있으며, 가끔 수면 장애도 경험합니다.
- 💔 최근 친한 친구와의 갈등으로 더욱 힘들어하고 있습니다.

## 주요 내용 정리 📋

### 1. 학업 관련 이슈 📚
- 💫 아이는 성적에 대한 압박감을 크게 느끼고 있습니다.
- 📊 특히 수학 과목에서 자신감이 많이 떨어져 있습니다.
- 🤔 집중력이 떨어져 공부 효율이 낮아진 것을 본인도 인지하고 있습니다.

### 2. 대인관계 이슈 👫
- 🏫 교우관계에서 소외감을 느끼고 있습니다.
- 🗣️ 본인의 의견을 표현하는 데 어려움을 겪고 있습니다.
- 👥 친한 친구 그룹 내에서 갈등이 생겨 스트레스가 가중되었습니다.

### 3. 가족 관계 👨‍👩‍👧
- 👨‍👩‍👧 부모님의 높은 기대에 부응하지 못한다는 압박감이 있습니다.
- 🏠 집에서는 감정 표현이 제한되어 있다고 느낍니다.
- 💬 부모님과의 소통이 원활하지 않아 고민을 나누지 못합니다.

## 구체적인 실천 방안 🌱

### 학업 향상을 위한 방안 📝
1. 🕰️ 25분 집중, 5분 휴식의 뽀모도로 기법을 활용한 공부법 시도하기
2. 📊 수학 과목은 기초부터 차근차근 복습하며 자신감 회복하기
3. 🏆 작은 목표를 세우고 달성할 때마다 보상 시스템 만들기

### 대인관계 개선을 위한 방안 👥
1. 🗣️ '나 전달법'을 연습하여 자신의 감정과 생각을 효과적으로 전달하기
2. 👫 관심사가 비슷한 동아리나 모임에 참여하여 새로운 관계 형성하기
3. 🤝 갈등이 있는 친구와 대화할 때 중립적인 시각으로 접근하기

### 정서 관리를 위한 방안 🧘‍♀️
1. 📔 매일 저녁 감정 일기 작성하기
2. 🧘‍♀️ 하루 10분씩 명상하며 불안감 다스리기
3. 🚶‍♀️ 매일 30분 이상 걷기 등 가벼운 신체 활동하기
4. 💤 취침 전 전자기기 사용을 줄이고 일정한 수면 시간 유지하기

### 가족 관계 개선을 위한 방안 👨‍👩‍👧
1. 💬 일주일에 한 번 '가족 대화의 날'을 정해 솔직한 대화 시간 갖기
2. 📱 부모님께 본인의 상황과 감정을 편지나 메시지로 표현해보기
3. 🎯 부모님과 함께 현실적인 목표 설정하고 단계적으로 달성해나가기

아이가 위의 실천 방안을 하나씩 시도해보면서, 자신에게 맞는 방법을 찾아가길 바랍니다. 모든 변화는 시간이 필요하므로 천천히 진행하며, 작은 성공에도 자신을 칭찬하는 습관을 들이는 것이 중요합니다. 함께 응원하겠습니다. 💪`;
  }
};

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // OpenAI API 호출 대신 모의 응답 사용
    const result = getMockResponse(text);

    // API 호출 로직 (현재는 주석 처리)
    /*
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: '당신은 심리상담사를 위한 조수입니다. 상담 내용을 분석하여 내담자에게 전달할 상담 노트를 작성합니다.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const result = chatCompletion.choices[0].message.content;
    */

    return NextResponse.json({ result, originalText: text });
  } catch (error) {
    console.error('Error processing text:', error);
    return NextResponse.json(
      { error: 'Failed to process text' },
      { status: 500 }
    );
  }
} 