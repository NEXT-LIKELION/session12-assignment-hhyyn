// src/pages/Result/Result.jsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import styles from './Result.module.css';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableRow,
} from '@/components/ui/table';
import { Input } from "@/components/ui/input";
import { fetchScores, registerScore as apiRegisterScore } from '../../api/rankingApi';

function Result({ score, restart, goHome }) {
  const [playerName, setPlayerName] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showTitle, setShowTitle] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scores, setScores] = useState([]);
  const [apiError, setApiError] = useState(null);
  
  // 컴포넌트 마운트 시 랭킹 데이터 로드 및 애니메이션 설정
  useEffect(() => {
    const loadScores = async () => {
      try {
        setIsLoading(true);
        const data = await fetchScores();
        setScores(data || []);
        setApiError(null);
      } catch (error) {
        console.error("Failed to load scores:", error);
        setApiError("랭킹 데이터를 불러오는데 실패했습니다.");
        // 오류 시에도 기본 데이터 설정
        setScores([
          { name: '예시1', score: '300' },
          { name: '예시2', score: '400' },
          { name: '예시3', score: '280' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadScores();
    
    // 순차적으로 애니메이션 표시
    setTimeout(() => setShowTitle(true), 300);
    setTimeout(() => setShowRanking(true), 800);
    setTimeout(() => setShowButtons(true), 1300);
  }, []);
  
  // 이름 입력 처리
  const handleNameChange = (e) => {
    const value = e.target.value;
    if (value.length <= 6) {
      setPlayerName(value);
      setErrorMessage('');
    } else {
      setErrorMessage('이름은 6자 이내로 입력해주세요.');
    }
  };

  // 랭킹 등록 처리
  const registerScore = async () => {
    if (!playerName.trim()) {
      setErrorMessage('이름을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      // API를 통해 점수 등록
      await apiRegisterScore(playerName, score);
      
      // 등록 후 최신 랭킹 다시 불러오기
      const updatedScores = await fetchScores();
      setScores(updatedScores || []);
      
      setIsRegistered(true);
      setApiError(null);
    } catch (error) {
      console.error("Failed to register score:", error);
      setErrorMessage("랭킹 등록에 실패했습니다. 다시 시도해주세요.");
      setApiError("랭킹 등록에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 순위 배경색을 위한 클래스 결정 함수
  const getRankClass = (index) => {
    if (index === 0) return styles.firstRank;
    if (index === 1) return styles.secondRank;
    if (index === 2) return styles.thirdRank;
    return '';
  };

  // 현재 플레이어의 순위 찾기 - 등록 전이어도 순위 계산
  const getPlayerRank = () => {
    if (!isRegistered) {
      // 등록하지 않았을 때, 현재 점수가 어느 위치에 들어갈지 계산
      const position = scores.findIndex(item => parseInt(item.score) < score);
      return position === -1 ? scores.length + 1 : position + 1;
    }
    
    // 등록 후에는 정확한 위치 찾기
    const playerIndex = scores.findIndex(item => 
      item.name === playerName && parseInt(item.score) === score
    );
    
    return playerIndex !== -1 ? playerIndex + 1 : null;
  };

  const playerRank = getPlayerRank();

  return (
    <div className={styles.container}>
      <div className={`${styles.title} ${showTitle ? styles.showElement : ''}`}>
        <h1>내 점수</h1>
        <h2>{score}점</h2>
      </div>

      <div className={`${styles.rankingBox} ${showRanking ? styles.showElement : ''}`}>
        <div className={styles.ranking}>
          <p>Ranking</p>
          {apiError && <div className={styles.apiError}>{apiError}</div>}
          <div className={styles.tableContainer}>
            <div className={styles.tableScrollable}>
              <Table>
                <TableBody className={styles.tableBody}>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className={styles.loadingCell}>랭킹 데이터를 불러오는 중...</TableCell>
                    </TableRow>
                  ) : scores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className={styles.emptyCell}>랭킹 데이터가 없습니다.</TableCell>
                    </TableRow>
                  ) : (
                    scores.map((item, index) => (
                      <TableRow 
                        key={index} 
                        className={`${getRankClass(index)} ${isRegistered && item.name === playerName && parseInt(item.score) === score ? styles.currentPlayer : ''}`}
                      >
                        <TableCell className={styles.rankCell}>{index+1}위</TableCell>
                        <TableCell className={styles.nameCell}>
                          {item.name}
                          {isRegistered && item.name === playerName && parseInt(item.score) === score ? '(나)' : ''}
                        </TableCell>
                        <TableCell className={styles.scoreCell}>{item.score}점</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {/* 항상 하단 푸터를 표시 */}
            <div className={styles.tableFooterFixed}>
              <Table>
                <TableFooter>
                  <TableRow className={styles.footerRow}>
                    <TableCell className={styles.rankCell}>{playerRank}위</TableCell>
                    <TableCell className={styles.nameCell}>
                      {isRegistered ? `${playerName}(나)` : '나'}
                    </TableCell>
                    <TableCell className={styles.scoreCell}>{score}점</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </div>
        <div className={styles.registerForm}>
          <div className={styles.inputBox}>
            <Input 
              type="text"
              placeholder="랭킹에 등록할 이름"
              value={playerName}
              onChange={handleNameChange}
              maxLength={6}
              className={styles.nameInput}
              disabled={isRegistered || isLoading}
            />
            <Button 
              onClick={registerScore}
              className={styles.registerButton}
              disabled={isRegistered || isLoading}
            >
              {isLoading ? '처리중...' : '등록'}
            </Button>
            {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
          </div>
        </div>
      </div>
      
      <div className={`${styles.buttons} ${showButtons ? styles.showElement : ''}`}>
        <Button onClick={restart} disabled={isLoading}>
          다시하기
        </Button>
        <Button variant='neutral' onClick={goHome} disabled={isLoading}>
          처음으로
        </Button>
      </div>
    </div>
  );
}

export default Result;