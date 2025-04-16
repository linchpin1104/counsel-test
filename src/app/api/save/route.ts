import { NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

export async function POST(request: Request) {
  try {
    const { originalText, processedText } = await request.json();

    if (!originalText || !processedText) {
      return NextResponse.json({ error: 'Both originalText and processedText are required' }, { status: 400 });
    }

    // Only initialize Firebase if we have the required config
    if (
      !process.env.FIREBASE_API_KEY ||
      !process.env.FIREBASE_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID === 'your-project-id'
    ) {
      // Return success without actually saving to Firebase
      console.log('Firebase configuration not provided. Skipping actual save.');
      return NextResponse.json({ 
        success: true,
        message: 'Firebase 설정이 없어 저장을 시뮬레이션합니다. 실제 저장되지 않았습니다.'
      });
    }

    // Initialize Firebase if config is valid
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Store processed result in Firestore
    const docRef = await addDoc(collection(db, 'counselingData'), {
      originalText,
      processedText,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true, 
      message: '데이터가 성공적으로 저장되었습니다.',
      docId: docRef.id
    });
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
} 