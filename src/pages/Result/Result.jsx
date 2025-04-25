// src/pages/Result/Result.jsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import styles from './Result.module.css';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableRow,
} from '@/components/ui/table'
import { Input } from "@/components/ui/input"

function Result({ score, restart, goHome }) {
  const [playerName, setPlayerName] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showTitle, setShowTitle] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [scores, setScores] = useState([
    {
      name: '예시1',
      score: '300',
    },
    {
      name: '예시2',
      score: '400',
    },
    {
      name: '예시3',
      score: '280',
    },
  ]);
  
  // 컴포넌트 마운트 시 초기 점수 정렬 및 애니메이션 설정
  useEffect(() => {
    const sortedScores = [...scores].sort((a, b) => parseInt(b.score) - parseInt(a.score));
    setScores(sortedScores);
    
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
  const registerScore = () => {
    if (!playerName.trim()) {
      setErrorMessage('이름을 입력해주세요.');
      return;
    }

    // 새로운 점수 항목 생성
    const newScoreItem = {
      name: playerName,
      score: String(score)
    };

    // 새 점수를 포함하여 모든 점수를 정렬
    const updatedScores = [...scores, newScoreItem].sort((a, b) => 
      parseInt(b.score) - parseInt(a.score)
    );

    setScores(updatedScores);
    setIsRegistered(true);
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
      item.name === playerName && item.score === String(score)
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
          <div className={styles.tableContainer}>
            <div className={styles.tableScrollable}>
              <Table>
                <TableBody className={styles.tableBody}>
                  {scores.map((item, index) => (
                    <TableRow 
                      key={index} 
                      className={`${getRankClass(index)} ${isRegistered && item.name === playerName && item.score === String(score) ? styles.currentPlayer : ''}`}
                    >
                      <TableCell className={styles.rankCell}>{index+1}위</TableCell>
                      <TableCell className={styles.nameCell}>
                        {item.name}
                        {isRegistered && item.name === playerName && item.score === String(score) ? '(나)' : ''}
                      </TableCell>
                      <TableCell className={styles.scoreCell}>{item.score}점</TableCell>
                    </TableRow>
                  ))}
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
              disabled={isRegistered}
            />
            <Button 
              onClick={registerScore}
              className={styles.registerButton}
              disabled={isRegistered}
            >등록</Button>
            {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
          </div>
        </div>
      </div>
      
      <div className={`${styles.buttons} ${showButtons ? styles.showElement : ''}`}>
        <Button onClick={restart}>
          다시하기
        </Button>
        <Button variant='neutral' onClick={goHome}>
          처음으로
        </Button>
      </div>
    </div>
  );
}

export default Result;