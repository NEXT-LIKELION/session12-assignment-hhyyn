import { useState } from 'react';
import Intro from './pages/Intro/Intro';
import Question from './pages/Question/Question';
import Result from './pages/Result/Result';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('intro');
  const [score, setScore] = useState(0);
  
  return (
    <div className='container'>
      {currentPage === 'intro' && (
        <Intro onStart={() => setCurrentPage('question')} />
      )}
      {currentPage === 'question' && (
        <Question 
          onGameOver={(finalScore) => {
            setScore(finalScore);
            setCurrentPage('result');
          }}
        />
      )}
      {currentPage === 'result' && (
        <Result 
          score={score} 
          restart={() => {
            setScore(0);
            setCurrentPage('question');
          }}
          goHome={() => {
            setScore(0);
            setCurrentPage('intro');
          }}
        />
      )}
    </div>
  );
}

export default App;