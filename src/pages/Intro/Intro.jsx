// src/pages/Intro/Intro.jsx
import React from 'react';
import styles from './Intro.module.css';
import { Button } from "@/components/ui/button";
import ImageSlider from '../../components/ImageSlider/ImageSlider';
import productImages from '../../data/productImages';

function Intro({ onStart }) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <h1 className={styles.h1}>가격 감각 테스트</h1>
        <p className={styles.p}>당신의 이번 주 물가 감각은<br/>얼마나 정확할까요?</p>
      </div>
      <div className={styles.thumbnailWrapper}>
        <ImageSlider 
          images={productImages} 
          folderPath="./images/products" 
        />
      </div>
      <Button className={styles.Button} onClick={onStart}>
        Start!
      </Button>
      <div className={styles.footer}>
        한국소비자원 및 네이버 이미지 검색 API를 활용했습니다.
      </div>
    </div>
  );
}

export default Intro;