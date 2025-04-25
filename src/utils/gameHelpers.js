// src/utils/gameHelpers.js

/**
 * 사용자 입력값을 유효한 정수로 변환
 * @param {string} input - 사용자 입력값 (예: "1,000")
 * @returns {number|null} - 변환된 정수 또는 유효하지 않은 경우 null
 */
export function parseUserGuess(input) {
    const userGuess = parseInt(input.replace(/,/g, ''), 10);
    return isNaN(userGuess) ? null : userGuess;
  }
  
  /**
   * 추측 결과에 대한 피드백 생성
   * @param {number} guess - 사용자 추측 값
   * @param {number} correctPrice - 정답 가격
   * @returns {string} - 피드백 메시지 ('정답', 'UP', 'DOWN')
   */
  export function generateFeedback(guess, correctPrice) {
    if (guess === correctPrice) return '정답';
    return guess < correctPrice ? 'UP' : 'DOWN';
  }
  
  /**
   * 숫자에 쉼표 추가 (천 단위)
   * @param {number} num - 쉼표를 추가할 숫자
   * @returns {string} - 쉼표가 추가된 문자열
   */
  export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }