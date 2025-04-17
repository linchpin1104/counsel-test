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
- 입력된 내용을 기반으로 해서 상담노트를 정리
- 대화한 내용을 가급적 상세하게 정리해서 표시해줍니다.
- 각 항목의 소제목이나 주요 메시지에는 긍정적 이모지(🌱, 💡, ❤️, 😊 등)를 적절히 사용하되, 과도한 사용은 지양합니다.
- 문체는 따뜻하고 공감 어린 톤을 유지하되, 간결하고 핵심이 잘 드러나도록 작성합니다.
- 결과는 마크다운 형식이 아닌 일반 텍스트로 표시되어야 합니다(##, ###, ** 등의 마크다운 기호 없이).
- 결과에서 ** 표시 되지 않도록 주의

- 아동은 '아이', 양육자는 '양육자' 또는 '부모'로만 호칭합니다.
- 실천 전략과 예시는 현실적이고 구체적으로 제시합니다.
- "~니다" 라는 표현보다는 "~이에요" 라는 부드러운 표현을 사용합니다
- 상담에서 다룬 주요 사례와 상담사가 제안한 내용들을 이해하기 쉽도록 잘 정리해서 표시해줍니다. 
- 시작/마무리에는 양육자를 위한 응원 및 인사 메시지가 포함되어야 합니다.

마지막에는 반드시 다음 문구를 포함해 주세요:
"이 노트는 가정에서 참고용으로 활용해 주세요.
추가 상담이 필요하시면 언제든 문의해 주세요."


상담 내용:
${text}`;

    console.log('Making request to OpenAI API...');
    console.log('Text length:', text.length);
    
    // Call OpenAI API with the gpt-4o model
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o', // 변경: gpt-4o는 빠른 응답 속도와 128k 토큰의 컨텍스트 길이를 지원
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