import React from 'react';
import styles from '@/pages/Question/Question.module.css';
import PriceInput from '@/components/PriceInput/PriceInput';
import { Button } from "@/components/ui/button";

function GuessInput({ userInput, setUserInput, handleSubmit, isTransitioning }) {
  return (
    <div className={styles.inputbox}>
      <PriceInput
        value={userInput}
        onChange={setUserInput}
        onSubmit={handleSubmit}
      />
      <Button 
        variant="noShadow" 
        onClick={handleSubmit} 
        disabled={isTransitioning}
      >
        제출
      </Button>
    </div>
  );
}

export default GuessInput;