// rankingApi.jsx
// Google Apps Script 웹앱 URL
const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL;

/**
 * 랭킹 데이터 가져오기
 * @returns {Promise} 점수 목록
 */
export const fetchScores = async () => {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getScores&t=${new Date().getTime()}`, {
      method: 'GET',
      redirect: "follow",
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.status === "error") {
      throw new Error(result.message);
    }
    
    return result.data || [];
  } catch (error) {
    throw new Error("랭킹 데이터를 불러오는데 실패했습니다.");
  }
};

/**
 * 새 점수 등록하기
 * @param {string} name - 플레이어 이름
 * @param {number} score - 플레이어 점수
 * @returns {Promise} 등록 결과
 */
export const registerScore = async (name, score) => {
  try {
    // 값 유효성 검사
    if (!name || name.trim() === '') {
      throw new Error("이름을 입력해주세요");
    }
    
    if (score === undefined || score === null) {
      throw new Error("점수가 유효하지 않습니다");
    }
    
    // URL에 action, name, score 파라미터 모두 추가
    const scoreStr = String(score);
    const url = `${SCRIPT_URL}?action=addScore&name=${encodeURIComponent(name)}&score=${encodeURIComponent(scoreStr)}`;
    
    const response = await fetch(url, {
      redirect: "follow",
      method: "POST",
      body: JSON.stringify({
        action: "addScore",
        name: name,
        score: scoreStr
      }),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.status === "error") {
      throw new Error(result.message || "점수 등록 실패");
    }
    
    return result;
  } catch (error) {
    throw new Error("점수 등록에 실패했습니다. 다시 시도해주세요.");
  }
};