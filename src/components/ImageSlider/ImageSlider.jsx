// src/components/ImageSlider/ImageSlider.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './ImageSlider.module.css';

function ImageSlider({ images, folderPath }) {
  const [currentImage, setCurrentImage] = useState('');
  const [nextImage, setNextImage] = useState('');
  const [isSliding, setIsSliding] = useState(false);
  const imageCache = useRef({}).current;
  const preloadedImages = useRef([]).current;
  const slideTimer = useRef(null);
  
  // 랜덤 이미지 선택 함수 - 이미 로드된 이미지 우선
  const getRandomImage = () => {
    if (!images || images.length === 0) return '';
    
    // 이미 프리로드된 이미지가 있으면 그 중에서 선택
    if (preloadedImages.length > 0) {
      const index = Math.floor(Math.random() * preloadedImages.length);
      const selected = preloadedImages[index];
      
      // 사용한 이미지는 프리로드 목록에서 제거
      preloadedImages.splice(index, 1);
      
      return selected;
    }
    
    // 프리로드된 이미지가 없으면 랜덤 선택
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  };
  
  // 앱 시작 시 여러 이미지 미리 로드
  useEffect(() => {
    if (!images || images.length === 0) return;
    
    // 초기 이미지 설정
    const initialImage = getRandomImage();
    setCurrentImage(initialImage);
    
    // 다음 이미지도 미리 선택
    const nextImg = getRandomImage();
    setNextImage(nextImg);
    
    // 최대 이미지 수와 최소 이미지 수 사이의 여러 이미지를 프리로드
    const imagesToPreload = Math.min(5, images.length);
    
    // 프리로딩 시작
    for (let i = 0; i < imagesToPreload; i++) {
      // 중복 없이 랜덤 이미지 선택
      let imgToLoad;
      do {
        const idx = Math.floor(Math.random() * images.length);
        imgToLoad = images[idx];
      } while (imgToLoad === initialImage || imgToLoad === nextImg || preloadedImages.includes(imgToLoad));
      
      // 프리로드 목록에 추가
      preloadedImages.push(imgToLoad);
      
      // 실제 프리로드 시작
      const img = new Image();
      img.onload = () => {
        imageCache[imgToLoad] = true;
      };
      img.src = `${folderPath}/${imgToLoad}`;
    }
    
    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (slideTimer.current) {
        clearInterval(slideTimer.current);
      }
    };
  }, [images]);
  
  // 슬라이드쇼 시작 (이미지가 설정된 후)
  useEffect(() => {
    if (!currentImage || !nextImage || !images || images.length <= 1) return;
    
    // 기존 타이머 정리
    if (slideTimer.current) {
      clearInterval(slideTimer.current);
    }
    
    // 새 타이머 설정 - 프리로드된 이미지 유무에 따라 간격 조정
    const slideInterval = preloadedImages.length > 0 ? 2000 : 3000;
    
    slideTimer.current = setInterval(() => {
      // 애니메이션 시작
      setIsSliding(true);
      
      // 애니메이션 완료 후 이미지 순환
      setTimeout(() => {
        setCurrentImage(nextImage);
        
        // 새로운 다음 이미지 선택
        const newNextImage = getRandomImage();
        setNextImage(newNextImage);
        
        // 애니메이션 상태 초기화
        setIsSliding(false);
        
        // 다음 이미지 추가 프리로드 (지속적으로 프리로드 유지)
        const additionalImage = images[Math.floor(Math.random() * images.length)];
        
        // 중복 이미지가 아니고 현재 표시 이미지와 다른 경우에만 프리로드
        if (additionalImage !== newNextImage && 
            additionalImage !== nextImage && 
            !preloadedImages.includes(additionalImage)) {
          preloadedImages.push(additionalImage);
          
          const img = new Image();
          img.onload = () => {
            imageCache[additionalImage] = true;
          };
          img.src = `${folderPath}/${additionalImage}`;
        }
      }, 500); // 애니메이션 시간과 일치
      
    }, slideInterval);
    
    return () => {
      if (slideTimer.current) {
        clearInterval(slideTimer.current);
      }
    };
  }, [currentImage, nextImage, images]);
  
  // 이미지가 없을 경우 처리
  if (!images || images.length === 0) {
    return <div className={styles.empty}>이미지 없음</div>;
  }
  
  return (
    <div className={styles.sliderWrapper}>
      {/* 현재 보이는 이미지 (슬라이드 아웃) */}
      <div className={`${styles.slider} ${isSliding ? styles.slideOut : ''}`}>
        {currentImage && (
          <img 
            src={`${folderPath}/${currentImage}`} 
            alt="현재 이미지" 
          />
        )}
      </div>
      
      {/* 다음 이미지 (슬라이드 인) */}
      <div className={`${styles.nextSlider} ${isSliding ? styles.slideIn : ''}`}>
        {nextImage && (
          <img 
            src={`${folderPath}/${nextImage}`} 
            alt="다음 이미지" 
          />
        )}
      </div>
      
      {/* 추가 프리로드된 이미지들 (화면에 보이지 않음) */}
      <div style={{ display: 'none' }}>
        {preloadedImages.map((img, index) => (
          <img 
            key={index}
            src={`${folderPath}/${img}`}
            alt="프리로드 이미지"
          />
        ))}
      </div>
    </div>
  );
}

export default ImageSlider;