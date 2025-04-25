// src/pages/Intro/Intro.jsx
import React, { useState, useEffect } from 'react';
import styles from './Intro.module.css';
import { Button } from "@/components/ui/button";
import validProductIdsData from '../../../data/valid_product_ids.json'; // 제품 ID 데이터 가져오기

function Intro({ onStart }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [productImages, setProductImages] = useState([]);
  const [fadeIn, setFadeIn] = useState(true);
  
  // 제품 이미지 초기화
  useEffect(() => {
    // 제품 ID가 있는 경우에만 이미지 배열 생성
    if (validProductIdsData && validProductIdsData.validIds) {
      // 최대 10개의 랜덤 제품 이미지 선택
      const shuffled = [...validProductIdsData.validIds].sort(() => 0.5 - Math.random());
      const selectedProducts = shuffled.slice(0, 10);
      
      // 이미지 경로 배열 생성
      const images = selectedProducts.map(product => 
        `./images/products/${product.id}.jpg`
      );
      
      setProductImages(images);
    }
  }, []);
  
  // 이미지 순환 효과
  useEffect(() => {
    if (productImages.length === 0) return;
    
    // 2초마다 이미지 변경
    const intervalId = setInterval(() => {
      // 페이드 아웃 효과
      setFadeIn(false);
      
      // 0.5초 후 이미지 변경하고 페이드 인 효과
      setTimeout(() => {
        setCurrentImageIndex(prevIndex => 
          prevIndex === productImages.length - 1 ? 0 : prevIndex + 1
        );
        setFadeIn(true);
      }, 500);
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [productImages]);
  
  // 이미지 전환을 위한 스타일 계산
  const imageStyle = {
    opacity: fadeIn ? 1 : 0,
    transition: 'opacity 0.5s ease-in-out'
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <h1 className={styles.h1}>가격 감각 테스트</h1>
        <p className={styles.p}>당신의 이번 주 물가 감각은<br/>얼마나 정확할까요?</p>
      </div>
      <div className={styles.thumbnail}>
        {productImages.length > 0 ? (
          <img 
            src={productImages[currentImageIndex]} 
            alt="제품 이미지" 
            style={imageStyle}
          />
        ) : (
          <div className={styles.loadingThumbnail}>이미지 로딩 중...</div>
        )}
      </div>
      <Button className={styles.Button} onClick={onStart}>
        Start!
      </Button>
    </div>
  );
}

export default Intro;