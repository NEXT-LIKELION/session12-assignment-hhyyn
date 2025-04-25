import React from 'react';
import styles from '@/pages/Question/Question.module.css';
function GuessList({ submittedGuess, feedback }) {
  return (
    <div className={styles.guessList}>
      {submittedGuess.slice().reverse().map((item, index) => (
        <div key={index} className={styles.guessItem}>
          <span>{item.guess.toLocaleString()}원</span>
          <span className={styles.feedbackBadge} data-feedback={item.feedback}>
            {item.feedback}
          </span>
        </div>
      ))}
      
      {feedback && submittedGuess.length === 0 && <p>{feedback}</p>}
    </div>
  );
}

export default GuessList;