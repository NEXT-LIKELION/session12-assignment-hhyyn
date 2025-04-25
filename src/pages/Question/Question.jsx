import styles from './Question.module.css';
import { PulseLoader } from "react-spinners";

// 커스텀 훅 import
import { useGameState } from './hooks/useGameState';
import { useTransition } from './hooks/useTransition';

// 컴포넌트 import
import QuestionHeader from '@/components/QuestionHeader';
import ProductDisplay from '@/components/ProductDisplay';
import GuessInput from '@/components/GuessInput';
import GuessList from '@/components/GuessList';

function Question({ onGameOver }) {
  // 게임 상태 관리 로직
  const gameState = useGameState({ onGameOver });
  
  // 트랜지션 효과 관리
  const { isTransitioning, startTransition } = useTransition();
  
  // 다음 문제로 이동
  const handleNextQuestion = () => {
    startTransition(() => {
      gameState.moveToNextQuestion();
    });
  };
  
  // 로딩 중인 경우
  if (gameState.isLoading) {
    return <div className={styles.pulseLoader}><PulseLoader /></div>
  }
  
  // 상품 데이터를 불러오지 못한 경우
  if (!gameState.product) {
    return <div>상품 정보를 불러올 수 없습니다</div>;
  }
  
  return (
    <div className={`${styles.container} ${isTransitioning ? styles.transitioning : ''}`}>
      <QuestionHeader 
        questionNumber={gameState.questionNumber} 
        score={gameState.score} 
        submittedGuess={gameState.submittedGuess}
        correctPrice={gameState.product?.price}
        life={gameState.life}
      />
      
      <div>
        <ProductDisplay 
          product={gameState.product} 
          isCorrect={gameState.isCorrect} 
          handleNextQuestion={handleNextQuestion}
          lastQuestionScore={gameState.lastQuestionScore}
        />
        
        <GuessInput 
          userInput={gameState.userInput} 
          setUserInput={gameState.setUserInput} 
          handleSubmit={gameState.handleSubmit}
          isTransitioning={isTransitioning}
        />
        
        <GuessList 
          submittedGuess={gameState.submittedGuess}
          feedback={gameState.feedback}
        />
      </div>
    </div>
  );
}

export default Question;