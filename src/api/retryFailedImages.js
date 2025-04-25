// retryFailedImages.js
import { promises as fs } from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 현재 파일 경로 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 프로젝트 루트 디렉토리 (src/api에서 두 단계 위로)
const rootDir = path.resolve(__dirname, '../..');

// 명시적으로 .env 파일 경로 지정
dotenv.config({ path: path.resolve(rootDir, '.env') });

// 환경 변수 로드 확인
console.log('환경 변수 확인:');
console.log('VITE_NAVER_CLIENT_ID:', process.env.VITE_NAVER_CLIENT_ID ? '설정됨' : '설정안됨');
console.log('VITE_NAVER_CLIENT_SECRET:', process.env.VITE_NAVER_CLIENT_SECRET ? '설정됨' : '설정안됨');

// 네이버 API 키
const CLIENT_ID = process.env.VITE_NAVER_CLIENT_ID;
const CLIENT_SECRET = process.env.VITE_NAVER_CLIENT_SECRET;

// 실패한 상품 ID와 이름 목록
const failedProducts = [
  { id: 1021, name: "핫브레이크 미니(715g)" },
];

// 이미지 저장 경로
const IMAGE_DIR = path.resolve(rootDir, 'public/images/products');

// 폴더가 없으면 생성
async function ensureDirectoryExists(dir) {
  try {
    await fs.access(dir);
  } catch (error) {
    console.log(`${dir} 폴더가 없습니다. 새로 생성합니다.`);
    await fs.mkdir(dir, { recursive: true });
  }
}

// 네이버 이미지 검색 API 호출 - 검색 옵션 강화
async function searchImage(query) {
  try {
    // 검색어 최적화 (더 정확한 검색 결과를 위해)
    const optimizedQuery = query
      .replace(/\(.*?\)/g, '') // 괄호 안의 내용 제거
      .trim();
    
    console.log(`검색어: "${optimizedQuery}"`);

    // API 키가 없으면 에러
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('네이버 API 키가 설정되지 않았습니다.');
    }

    const response = await axios.get('https://openapi.naver.com/v1/search/image', {
      params: {
        query: optimizedQuery,
        display: 5, // 결과 5개까지 가져와서 더 많은 옵션 확보
        filter: 'large' // 더 큰 이미지 우선
      },
      headers: {
        'X-Naver-Client-Id': CLIENT_ID,
        'X-Naver-Client-Secret': CLIENT_SECRET
      }
    });

    if (response.data.items && response.data.items.length > 0) {
      // 첫 번째 이미지 URL 반환
      return response.data.items[0].link;
    }
    
    throw new Error('이미지 검색 결과가 없습니다.');
  } catch (error) {
    console.error(`이미지 검색 실패: ${query}`, error.message);
    return null;
  }
}

// 대체 이미지 검색 API 사용 (Pixabay) - 네이버 API 실패 시 대안
async function searchAlternativeImage(query) {
  try {
    const cleanQuery = query
      .replace(/\(.*?\)/g, '')
      .split(' ')[0] // 첫 단어만 사용
      .trim();
    
    console.log(`대체 검색어: "${cleanQuery}"`);
    
    // 직접 이미지 URL 반환
    return `https://via.placeholder.com/500x500.jpg?text=${encodeURIComponent(cleanQuery)}`;
  } catch (error) {
    console.error(`대체 이미지 검색 실패:`, error.message);
    return null;
  }
}

// 이미지 다운로드 및 저장
async function downloadImage(url, filepath) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 10000 // 10초 타임아웃 설정
    });

    await fs.writeFile(filepath, response.data);
    console.log(`이미지 저장 완료: ${filepath}`);
    return true;
  } catch (error) {
    console.error(`이미지 다운로드 실패: ${url}`, error.message);
    return false;
  }
}

// 메인 함수
async function main() {
  try {
    console.log('실패한 이미지 다시 다운로드를 시작합니다...');
    console.log('이미지 저장 경로:', IMAGE_DIR);
    
    // 이미지 저장 디렉토리 확인/생성
    await ensureDirectoryExists(IMAGE_DIR);
    
    console.log(`총 ${failedProducts.length}개의 상품 이미지를 검색합니다.`);
    
    // 각 상품에 대해 이미지 검색 및 다운로드
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < failedProducts.length; i++) {
      const product = failedProducts[i];
      console.log(`[${i+1}/${failedProducts.length}] ${product.name} (ID: ${product.id}) 처리 중...`);
      
      // 이미지 파일 경로
      const imagePath = path.join(IMAGE_DIR, `${product.id}.jpg`);
      
      // 네이버 이미지 검색 시도
      let imageUrl = await searchImage(product.name);
      
      // 네이버 검색 실패 시 대체 검색 시도
      if (!imageUrl) {
        console.log('네이버 검색 실패, 대체 검색 시도...');
        imageUrl = await searchAlternativeImage(product.name);
      }
      
      if (imageUrl) {
        // 이미지 다운로드
        const success = await downloadImage(imageUrl, imagePath);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      } else {
        console.log('모든 검색 방법 실패, 기본 이미지 사용');
        // 모든 검색이 실패하면 기본 placeholder 이미지 사용
        const placeholderUrl = `https://via.placeholder.com/500x500.jpg?text=${encodeURIComponent(product.name.substring(0, 10))}`;
        const success = await downloadImage(placeholderUrl, imagePath);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      }
      
      // 네이버 API 속도 제한 고려 (초당 10개 이하 요청 권장)
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n===== 작업 완료 =====');
    console.log(`성공: ${successCount}개`);
    console.log(`실패: ${failCount}개`);
    
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

// 스크립트 실행
main();