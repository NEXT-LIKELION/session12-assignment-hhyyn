import React from 'react';
import styles from '@/pages/Question/Question.module.css';
import LifeCounter from '@/components/LifeCounter/LifeCounter';
import { Progress } from '@/components/ui/progress';

function QuestionHeader({ questionNumber, score, submittedGuess, correctPrice, life }) {
  return (
    <div className={styles.header}>
      <div className={styles.headerText}>
        <div className="question-number">
          <h2>문제 {questionNumber}</h2>
        </div>
        <div className="score">
          <span className="score-label">점수: </span>
          <span className="score-value">{score}</span>
          <span className="score-label">점</span>
        </div>
      </div>
      
      <Progress 
        userGuess={submittedGuess.length > 0 ? submittedGuess[submittedGuess.length - 1].guess : undefined} 
        correctPrice={correctPrice} 
        maxDeviation={100}
        className="w-[60%]" 
      />
      
      <LifeCounter life={life} maxLife={8} />
    </div>
  );
}

export default QuestionHeader;