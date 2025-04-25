import React, { useState, useEffect } from 'react';
import styles from './LifeCounter.module.css';

function LifeCounter({ life, maxLife }) {
  // 실제로 애니메이션을 보여줄 하트 인덱스를 저장
  const [animatingHearts, setAnimatingHearts] = useState([]);
  // 애니메이션이 끝난 후 보여줄 현재 생명력 상태
  const [displayedLife, setDisplayedLife] = useState(life);
  
  useEffect(() => {
    // 생명력이 감소했을 때만 애니메이션 적용
    if (life < displayedLife) {
      // 현재 사라져야 할 하트만 애니메이션 적용 (방금 감소한 것들만)
      const heartsToAnimate = [];
      for (let i = life; i < displayedLife; i++) {
        heartsToAnimate.push(i);
      }
      
      setAnimatingHearts(heartsToAnimate);
      
      // 애니메이션 시간 후에 실제 생명력으로 업데이트
      const timer = setTimeout(() => {
        setDisplayedLife(life);
        setAnimatingHearts([]);
      }, 500); // 애니메이션 시간과 맞춤
      
      return () => clearTimeout(timer);
    } else {
      // 생명력이 증가하거나 같을 때는 바로 업데이트
      setDisplayedLife(life);
    }
  }, [life]);

  // 하트 렌더링 - 현재 생명력과 애니메이션 중인 하트만 표시
  const hearts = Array.from({ length: maxLife }, (_, i) => {
    // 현재 애니메이션 중인 하트인지 확인
    const isAnimating = animatingHearts.includes(i);
    
    // 표시할 하트 상태 결정
    // - 애니메이션 중인 하트는 표시하되 사라지는 효과 적용
    // - 현재 생명력보다 작은 인덱스의 하트만 표시
    const shouldShow = isAnimating || i < displayedLife;
    
    if (!shouldShow) {
      // 표시하지 않을 하트는 빈 요소 반환
      return <span key={i} className={styles.emptySlot}></span>;
    }
    
    return (
      <span 
        key={i} 
        className={`${styles.heart} ${isAnimating ? styles.fadeOutHeart : ''}`}
      >
        {/* 채워진 가격표 svg */}
        <svg width="25" height="25" viewBox="0 0 25 25" stroke="#000000" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.5 3H14C13.6 3 13.2 3.2 13 3.4L4 12.4C3.6 12.8 3.6 13.4 4 13.8L11.2 21C11.6 21.4 12.2 21.4 12.6 21L21.6 12C21.8 11.8 22 11.4 22 11V5.5C22 4.1 20.9 3 19.5 3Z" fill="#5294FF"/>
          <circle cx="17" cy="8" r="2" fill="white" stroke="#000000"/>
        </svg>
      </span>
    );
  });

  return (
    <div className={styles.lifeCounter}>
      <div className={styles.hearts}>{hearts}</div>
    </div>
  );
}

export default LifeCounter;