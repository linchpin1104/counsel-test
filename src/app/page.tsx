'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UploadCloud, FileText, Send, Save, Lock, KeyRound } from 'lucide-react';

export default function Home() {
  const [transcriptText, setTranscriptText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [authError, setAuthError] = useState(false);

  // 브라우저 스토리지에서 인증 상태 확인
  useEffect(() => {
    const storedAuth = localStorage.getItem('counselingAppAuth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthentication = () => {
    if (authCode === '0925') {
      setIsAuthenticated(true);
      setAuthError(false);
      localStorage.setItem('counselingAppAuth', 'true');
    } else {
      setAuthError(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setTranscriptText(text);
      setFileUploaded(true);
      setSavedSuccess(false);
    };
    reader.readAsText(file);
  };

  const handleUrlSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = formData.get('url') as string;
    
    if (!url) return;
    
    setIsLoading(true);
    try {
      // We'll assume the URL contains text content for now
      const response = await fetch(url);
      const text = await response.text();
      setTranscriptText(text);
      setFileUploaded(true);
      setSavedSuccess(false);
    } catch (error) {
      console.error('Error fetching URL:', error);
      alert('URL에서 텍스트를 가져오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const processWithGPT = async () => {
    if (!transcriptText) return;
    
    setIsLoading(true);
    setSavedSuccess(false);
    try {
      // 타임아웃 설정이 있는 fetch 함수
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3분 타임아웃으로 연장
      
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcriptText }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // 타임아웃 제거
      
      if (!response.ok) {
        throw new Error('API 요청에 실패했습니다.');
      }
      
      const data = await response.json();
      setProcessedText(data.result);
    } catch (error) {
      console.error('Error processing with GPT:', error);
      if (error instanceof DOMException && error.name === 'AbortError') {
        alert('요청 시간이 너무 오래 걸립니다. 텍스트가 너무 길지 않은지 확인해주세요.');
      } else {
        alert('GPT 처리 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveToFirebase = async () => {
    if (!transcriptText || !processedText) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          originalText: transcriptText, 
          processedText: processedText 
        }),
      });
      
      if (!response.ok) {
        throw new Error('저장 요청에 실패했습니다.');
      }
      
      setSavedSuccess(true);
      alert('데이터가 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      alert('데이터 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 인증 화면 렌더링
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen p-6 lg:p-24 bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="flex flex-col items-center mb-6">
            <Lock className="h-16 w-16 text-blue-600 mb-2" />
            <h1 className="text-2xl font-bold text-center">상담노트 작성</h1>
            <p className="text-gray-600 text-center mt-2">접근 인증이 필요합니다</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">인증번호 입력</label>
            <div className="flex">
              <input
                type="password"
                placeholder="인증번호를 입력하세요"
                className={`w-full p-3 border ${authError ? 'border-red-500' : 'border-gray-300'} rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={authCode}
                onChange={(e) => { 
                  setAuthCode(e.target.value);
                  setAuthError(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAuthentication()}
              />
              <button 
                className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleAuthentication}
              >
                <KeyRound className="h-5 w-5" />
              </button>
            </div>
            {authError && (
              <p className="text-red-500 text-sm mt-1">인증번호가 올바르지 않습니다.</p>
            )}
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-6">
            인증된 사용자만 이 애플리케이션에 접근할 수 있습니다.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 lg:p-24 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">상담노트 작성</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Upload and Input */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">상담 내용 업로드</h2>
            
            {/* File Upload */}
            <div className="mb-6">
              <label 
                htmlFor="file-upload" 
                className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
              >
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600">파일 선택</span> 또는 여기에 드래그 앤 드롭하세요
                  </div>
                  <p className="text-xs text-gray-500">텍스트 파일 (.txt)</p>
                </div>
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  accept=".txt"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            
            {/* URL Input */}
            <div className="mb-6">
              <h3 className="text-md font-medium mb-2">또는 URL 입력</h3>
              <form onSubmit={handleUrlSubmit} className="flex items-center">
                <input 
                  type="url" 
                  name="url"
                  placeholder="구글 드라이브 링크 또는 URL" 
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="submit" 
                  className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  {isLoading ? '로딩 중...' : '가져오기'}
                </button>
              </form>
            </div>
            
            {/* Text Editor */}
            <div>
              <h3 className="text-md font-medium mb-2">상담 내용</h3>
              <textarea 
                className="w-full h-64 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="여기에 상담 내용을 입력하거나 파일/URL에서 가져온 내용이 표시됩니다."
                value={transcriptText}
                onChange={(e) => {
                  setTranscriptText(e.target.value);
                  setSavedSuccess(false);
                }}
              />
            </div>
            
            {/* Process Button */}
            <button 
              className="mt-4 w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
              onClick={processWithGPT}
              disabled={!transcriptText || isLoading}
            >
              {isLoading ? (
                '처리 중...'
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  상담노트 정리하기
                </>
              )}
            </button>
          </div>
          
          {/* Right Column: Results */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">상담노트</h2>
            
            <div className="relative min-h-64 p-3 border border-gray-300 rounded-md bg-gray-50">
              {processedText ? (
                <div className="whitespace-pre-wrap">{processedText}</div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <FileText className="h-12 w-12 mb-2" />
                  <p>상담노트가 여기에 표시됩니다.</p>
                </div>
              )}
            </div>
            
            {processedText && (
              <div className="mt-4 flex space-x-4">
                <button 
                  className="flex-1 px-4 py-2 flex items-center justify-center bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
                  onClick={saveToFirebase}
                  disabled={isSaving || savedSuccess}
                >
                  {isSaving ? (
                    '저장 중...'
                  ) : savedSuccess ? (
                    '저장됨 ✓'
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Firebase에 저장
                    </>
                  )}
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
                  공유하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 