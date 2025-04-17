import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Prepare prompt for OpenAI
    const systemPrompt = '당신은 육아상담사를 위한 전문 조수입니다. 상담 내용을 분석하여 양육자에게 전달할 상담 노트를 작성합니다. 분석은 객관적이고 실용적인 조언을 포함해야 합니다.';
    
    const userPrompt = `상담사와 양육자의 육아상담 내용에 기반하여 상담노트를 작성해주세요.

## 육아상담 결과 상담노트 작성 안내

### 상담노트 작성 시 유의사항
- 아동과 양육자의 실명, 구체적 신상정보(주소, 학교 등)는 절대 기재하지 않습니다.
- 아동은 '아이', 양육자는 '양육자' 또는 '부모'로만 호칭합니다.
- 상담 내용은 사실, 해석, 제안을 구분하여 객관적으로 작성합니다.
- 각 항목의 소제목이나 주요 메시지에는 긍정적 이모지(🌱, 💡, ❤️, 😊 등)를 적절히 사용하되, 과도한 사용은 지양합니다.
- 문체는 따뜻하고 공감 어린 톤을 유지하되, 간결하고 핵심이 잘 드러나도록 작성합니다.
- 실천 전략과 예시는 현실적이고 구체적으로 제시합니다.

### 상담노트 작성 양식
1. 양육자 칭찬 및 격려 메시지(도입부) 😊
   - 상담에 참여해주셔서 감사합니다. 아이의 성장과 행복을 위해 꾸준히 고민하고 노력해오신 점, 그리고 오늘 상담에 시간을 내주신 것만으로도 이미 훌륭한 부모님이십니다.

2. 상담 개요 📝
   - 상담일시, 상담자, 내담자, 대상 아동(나이), 주요 상담 주제 등

3. 아이의 기질 및 성향 분석 🌱
   - 아이의 구체적 기질 및 특성 설명

4. 상담에서 다룬 주요 사례 분석 💡
   - 사례 요약, 해석, 부모 대응 등 (개인정보가 드러나지 않도록 주의)

5. 효과적인 양육 접근법 ❤️
   - 감정 공감, 행동 지도, 구체적 대화 예시 등

6. 실천 가능한 구체적 양육 전략 🛠️
   - 일상에서 적용 가능한 방법, 놀이·관계 형성 방안, 부모 자기돌봄 등

7. 향후 발달 과정에 대한 안내 🔎
   - 예상 변화, 다음 단계 준비, 지속적 관찰 포인트 등

8. 양육자 응원 메시지(마무리) 🌷
   - 부모로서 매일 최선을 다하고 계신 점을 꼭 기억해주세요. 완벽한 부모가 아니라, 아이와 함께 성장하고자 노력하는 부모가 아이에게 가장 큰 선물입니다.

마지막에는 반드시 다음 문구를 포함해 주세요:
"이 노트는 가정에서 참고용으로 활용해 주세요.
추가 상담이 필요하시면 언제든 문의해 주세요."

결과는 마크다운 형식이 아닌 일반 텍스트로 표시되어야 합니다(##, ** 등의 마크다운 기호 없이).

상담 내용:
${text}`;

    console.log('Making request to OpenAI API...');
    console.log('Text length:', text.length);
    
    // Call OpenAI API with the gpt-4-turbo model that has larger context window
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4-turbo', // 변경: 더 큰 컨텍스트 길이(128k 토큰)를 지원하는 최신 모델로 변경
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000, // 응답 토큰 수
    });

    const result = chatCompletion.choices[0].message.content;
    console.log('OpenAI API response received');
    
    return NextResponse.json({ result, originalText: text });
  } catch (error) {
    console.error('Error processing with OpenAI:', error);
    
    // 자세한 오류 정보 반환
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetail = error instanceof Error && 'cause' in error ? JSON.stringify(error.cause) : '';
    
    return NextResponse.json(
      { 
        error: 'Failed to process text', 
        message: errorMessage,
        detail: errorDetail
      },
      { status: 500 }
    );
  }
} 