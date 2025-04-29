// src/components/ImageSlider/ImageSlider.jsx
import React, { useState, useEffect } from 'react';
import styles from './ImageSlider.module.css';

function ImageSlider({ images, folderPath }) {
  const [currentImage, setCurrentImage] = useState('');
  const [isSliding, setIsSliding] = useState(false);

  // 랜덤 이미지 선택 함수
  const getRandomImage = () => {
    if (!images || images.length === 0) return '';
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  };
  
  // 초기 이미지 설정
  useEffect(() => {
    setCurrentImage(getRandomImage());
  }, [images]);

  // 이미지 슬라이드 효과
  useEffect(() => {
    if (!currentImage || !images || images.length <= 1) return;
    
    const slideInterval = setInterval(() => {
      // 슬라이드 애니메이션 시작
      setIsSliding(true);
      
      // 애니메이션 완료 후 새 이미지 설정
      setTimeout(() => {
        const newImage = getRandomImage();
        setCurrentImage(newImage);
        setIsSliding(false);
      }, 500);
      
    }, 2000);
    
    return () => clearInterval(slideInterval);
  }, [currentImage, images]);

  if (!images || images.length === 0) {
    return <div className={styles.empty}>이미지 없음</div>;
  }

  return (
    <div className={styles.sliderWrapper}>
      <div className={`${styles.slider} ${isSliding ? styles.slideOut : ''}`}>
        {currentImage && (
          <img 
            src={`${folderPath}/${currentImage}`} 
            alt="슬라이드 이미지" 
          />
        )}
      </div>
    </div>
  );
}

export default ImageSlider;