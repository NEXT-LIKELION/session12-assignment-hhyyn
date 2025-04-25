// ValidatorScript.jsx
import React, { useState, useEffect } from 'react';

// 환경 변수에서 설정값 가져오기
const START_ID = import.meta.env.VITE_API_START_ID || 1;
const END_ID = import.meta.env.VITE_API_END_ID || 1182;
const BATCH_SIZE = import.meta.env.VITE_API_BATCH_SIZE || 10;
const DELAY_MS = import.meta.env.VITE_API_DELAY_MS || 100;

const ProductValidator = () => {
  const [results, setResults] = useState({
    validIds: [],
    invalidIds: [],
    errors: []
  });
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [currentBatch, setCurrentBatch] = useState(null);
  
  // 환경 변수에서 API 키와 조회 날짜 가져오기
  const serviceKey = import.meta.env.VITE_PRODUCT_API_KEY;
  const goodInspectDay = import.meta.env.VITE_GOOD_INSPECT_DAY || '20250404';
  
  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  async function validateId(id) {
    try {
      addLog(`ID ${id} 검증 시작...`);
      
      // 1. 상품명 조회
      const productInfoUrl = `/api/openApiImpl/ProductPriceInfoService/getProductInfoSvc.do?goodId=${id}&ServiceKey=${serviceKey}`;
      const nameRes = await fetch(productInfoUrl);
      
      if (!nameRes.ok) {
        throw new Error(`상품명 조회 실패: HTTP ${nameRes.status}`);
      }
      
      const nameXmlText = await nameRes.text();
      const parser = new DOMParser();
      const nameXmlDoc = parser.parseFromString(nameXmlText, "text/xml");
      const name = nameXmlDoc.querySelector("result > item > goodName")?.textContent;
      
      if (!name) {
        addLog(`ID ${id} - 상품명 없음`);
        setResults(prev => ({
          ...prev,
          invalidIds: [...prev.invalidIds, id]
        }));
        return false;
      }
      
      addLog(`ID ${id} - 상품명: ${name}`);
      
      // 2. 가격 정보 조회
      const priceUrl = `/api/openApiImpl/ProductPriceInfoService/getProductPriceInfoSvc.do?goodInspectDay=${goodInspectDay}&goodId=${id}&ServiceKey=${serviceKey}`;
      const priceRes = await fetch(priceUrl);
      
      if (!priceRes.ok) {
        throw new Error(`가격 정보 조회 실패: HTTP ${priceRes.status}`);
      }
      
      const priceXmlText = await priceRes.text();
      const priceXmlDoc = parser.parseFromString(priceXmlText, "text/xml");
      const price = priceXmlDoc.querySelector("result > iros\\.openapi\\.service\\.vo\\.goodPriceVO > goodPrice")?.textContent;
      
      if (!price) {
        addLog(`ID ${id} - 가격 정보 없음 (상품명: ${name})`);
        setResults(prev => ({
          ...prev,
          invalidIds: [...prev.invalidIds, id]
        }));
        return false;
      }
      
      // 유효한 ID
      addLog(`ID ${id} - 유효 (상품명: ${name}, 가격: ${price})`);
      setResults(prev => ({
        ...prev,
        validIds: [...prev.validIds, { id, name, price }]
      }));
      return true;
    } catch (error) {
      addLog(`ID ${id} - 오류: ${error.message}`);
      setResults(prev => ({
        ...prev,
        errors: [...prev.errors, { id, error: error.message }],
        invalidIds: [...prev.invalidIds, id]
      }));
      return false;
    }
  }
  
  async function processBatch(startIdx, endIdx) {
    setCurrentBatch({ start: startIdx, end: endIdx });
    
    for (let id = startIdx; id <= endIdx; id++) {
      await validateId(id);
      // 각 요청 사이에 짧은 지연 추가
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setCurrentBatch(null);
  }
  
  async function runValidation() {
    if (isRunning) return;
    
    setIsRunning(true);
    addLog(`상품 ID 유효성 검증 시작 (${START_ID} ~ ${END_ID})`);
    
    const totalIds = END_ID - START_ID + 1;
    let processedIds = 0;
    
    try {
      // 배치 단위로 처리
      for (let i = START_ID; i <= END_ID; i += BATCH_SIZE) {
        const batchEnd = Math.min(i + BATCH_SIZE - 1, END_ID);
        await processBatch(i, batchEnd);
        
        // 진행 상황 업데이트
        processedIds += (batchEnd - i + 1);
        const progressPercent = Math.floor((processedIds / totalIds) * 100);
        setProgress(progressPercent);
        
        // 서버 부하 방지를 위한 지연
        if (i + BATCH_SIZE <= END_ID) {
          addLog(`다음 배치 전 ${DELAY_MS}ms 대기 중...`);
          await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
      }
      
      addLog('검증 완료!');
      addLog(`유효한 ID: ${results.validIds.length}개`);
      addLog(`무효한 ID: ${results.invalidIds.length}개`);
      addLog(`오류 발생: ${results.errors.length}개`);
      
    } catch (error) {
      addLog(`실행 중 오류 발생: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  }
  
  function downloadResults() {
    const data = {
      timestamp: new Date().toISOString(),
      validIds: results.validIds,
      totalValid: results.validIds.length,
      totalInvalid: results.invalidIds.length,
      totalErrors: results.errors.length
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'valid_product_ids.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">상품 ID 유효성 검증 도구</h1>
      
      <div className="mb-4">
        <button 
          onClick={runValidation}
          disabled={isRunning}
          className={`px-4 py-2 rounded ${isRunning ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white mr-2`}
        >
          {isRunning ? '실행 중...' : '검증 시작'}
        </button>
        
        <button 
          onClick={downloadResults}
          disabled={results.validIds.length === 0}
          className={`px-4 py-2 rounded ${results.validIds.length === 0 ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white`}
        >
          결과 다운로드
        </button>
      </div>
      
      {/* 진행 상황 표시 */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-right mt-1">{progress}% 완료</div>
        
        {currentBatch && (
          <div className="mt-2">
            현재 처리 중: ID {currentBatch.start} ~ {currentBatch.end}
          </div>
        )}
      </div>
      
      {/* 결과 요약 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-bold">유효한 ID</h2>
          <p className="text-2xl">{results.validIds.length}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="font-bold">무효한 ID</h2>
          <p className="text-2xl">{results.invalidIds.length}</p>
        </div>
        <div className="bg-red-100 p-4 rounded">
          <h2 className="font-bold">오류 발생</h2>
          <p className="text-2xl">{results.errors.length}</p>
        </div>
      </div>
      
      {/* 로그 출력 */}
      <div className="mb-6">
        <h2 className="font-bold mb-2">실행 로그</h2>
        <div className="bg-gray-100 p-4 rounded h-64 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))}
        </div>
      </div>
      
      {/* 유효한 ID 목록 */}
      {results.validIds.length > 0 && (
        <div>
          <h2 className="font-bold mb-2">유효한 ID 목록</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">상품명</th>
                  <th className="py-2 px-4 border-b">가격</th>
                </tr>
              </thead>
              <tbody>
                {results.validIds.map(item => (
                  <tr key={item.id}>
                    <td className="py-2 px-4 border-b">{item.id}</td>
                    <td className="py-2 px-4 border-b">{item.name}</td>
                    <td className="py-2 px-4 border-b">{item.price}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductValidator;