import React from 'react';
import styles from '@/pages/Question/Question.module.css';
import { Button } from "@/components/ui/button";

function ProductDisplay({ product, isCorrect, handleNextQuestion, lastQuestionScore }) {
  return (
    <>
      <div className={styles.title}>
        <h3>{product.name}</h3>
        <p>얼마일까요?</p>
      </div>
      
      <div className={styles.image}>
        {product.image && (
          <img 
            src={product.image}
            alt={product.name}
            className={isCorrect ? styles.blurredImage : ''}
          />
        )}
        
        {isCorrect && (
          <div className={styles.correctAnswerOverlay}>
            <h2>정답입니다!</h2>
            <p className={styles.score}>+{lastQuestionScore}점</p>
            <Button
              variant="noShadow"
              className={styles.nextButton}
              onClick={handleNextQuestion}
            >
              다음 문제
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default ProductDisplay;