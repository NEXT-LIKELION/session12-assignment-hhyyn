// productImageApi.js
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

// 환경 변수 로드 확인 (디버깅용)
console.log('환경 변수 확인:');
console.log('VITE_NAVER_CLIENT_ID:', process.env.VITE_NAVER_CLIENT_ID ? '설정됨' : '설정안됨');
console.log('VITE_NAVER_CLIENT_SECRET:', process.env.VITE_NAVER_CLIENT_SECRET ? '설정됨' : '설정안됨');

// 네이버 API 키
const CLIENT_ID = process.env.VITE_NAVER_CLIENT_ID;
const CLIENT_SECRET = process.env.VITE_NAVER_CLIENT_SECRET;

// JSON 파일 직접 읽기 (require 대신 fs 사용)
const dataPath = path.resolve(rootDir, 'src/data/valid_product_ids.json');
let validProductIdsData;

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

// 네이버 이미지 검색 API 호출
async function searchImage(query) {
  try {
    // API 키가 없으면 에러
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('네이버 API 키가 설정되지 않았습니다.');
    }

    const response = await axios.get('https://openapi.naver.com/v1/search/image', {
      params: {
        query,
        display: 1,
        filter: 'medium'
      },
      headers: {
        'X-Naver-Client-Id': CLIENT_ID,
        'X-Naver-Client-Secret': CLIENT_SECRET
      }
    });

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0].link;
    }
    
    throw new Error('이미지 검색 결과가 없습니다.');
  } catch (error) {
    console.error(`이미지 검색 실패: ${query}`, error.message);
    return null;
  }
}

// 이미지 다운로드 및 저장
async function downloadImage(url, filepath) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
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
    console.log('상품 이미지 다운로드를 시작합니다...');
    console.log('이미지 저장 경로:', IMAGE_DIR);
    console.log('데이터 파일 경로:', dataPath);
    
    // JSON 파일 읽기
    try {
      const fileContent = await fs.readFile(dataPath, 'utf8');
      validProductIdsData = JSON.parse(fileContent);
      console.log('데이터 파일 로드 성공');
    } catch (error) {
      console.error('데이터 파일 로드 실패:', error.message);
      process.exit(1);
    }
    
    // 이미지 저장 디렉토리 확인/생성
    await ensureDirectoryExists(IMAGE_DIR);
    
    // 상품 데이터 확인
    const products = validProductIdsData.validIds;
    if (!products || !Array.isArray(products)) {
      throw new Error('유효한 상품 데이터를 찾을 수 없습니다.');
    }
    
    console.log(`총 ${products.length}개의 상품 이미지를 검색합니다.`);
    
    // 각 상품에 대해 이미지 검색 및 다운로드
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`[${i+1}/${products.length}] ${product.name} 처리 중...`);
      
      // 이미지 파일 경로
      const imagePath = path.join(IMAGE_DIR, `${product.id}.jpg`);
      
      // 이미 이미지가 있는지 확인
      try {
        await fs.access(imagePath);
        console.log(`이미 이미지가 존재합니다: ${imagePath} (건너뜁니다)`);
        successCount++;
        continue;
      } catch (error) {
        // 파일이 없으면 계속 진행
      }
      
      // 이미지 검색
      const imageUrl = await searchImage(product.name);
      
      if (imageUrl) {
        // 이미지 다운로드
        const success = await downloadImage(imageUrl, imagePath);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      } else {
        failCount++;
      }
      
      // 네이버 API 속도 제한 고려 (초당 10개 이하 요청 권장)
      await new Promise(resolve => setTimeout(resolve, 200));
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