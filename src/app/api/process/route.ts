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
    const systemPrompt = '당신은 심리상담사를 위한 조수입니다. 상담 내용을 분석하여 내담자에게 전달할 상담 노트를 작성합니다.';
    
    const userPrompt = `상담사와 내담자의 상담내용이야.
내담자에게 전달할 상담노트로 정리해줘. 주요호소내용 / 각 이슈별로 내용정리 / 구체적인 실천방안을 각각 정리해주는게 필요해. 
주요 내용에서는 이모지를 사용해주고 따뜻함을 유지하면서도 핵심이 잘 드러나고 정성스럽게 작성해줘. 아이이름은 넣지 말고 그냥 아이라고 호칭해.

상담 내용:
${text}`;

    console.log('Making request to OpenAI API...');
    console.log('Text length:', text.length);
    
    // Call OpenAI API with the gpt-4-32k model that has larger context window
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4-32k', // 변경: 더 큰 컨텍스트 길이(32k 토큰)를 지원하는 모델로 변경
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000, // 응답 토큰 수를 증가
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