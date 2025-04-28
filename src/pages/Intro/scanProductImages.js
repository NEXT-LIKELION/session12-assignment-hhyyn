// scanProductImages.mjs
// ES 모듈 형식의 이미지 스캐너 (import/export 사용)
import { readdir, stat, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';  // existsSync는 fs/promises가 아닌 fs에서 가져옴
import { join, extname, dirname, resolve } from 'path';

console.log('=== 이미지 스캔 스크립트 시작 (ES 모듈 버전) ===');
console.log('현재 작업 디렉토리:', process.cwd());

// 이미지 확장자 목록
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// 폴더 경로 설정
const productsDir = join('../../../public', 'images', 'products');
const outputFile = join('../../', 'data', 'productImages.js');

// 절대 경로 출력
console.log(`스캔 대상 폴더(상대): ${productsDir}`);
console.log(`스캔 대상 폴더(절대): ${resolve(productsDir)}`);

try {
  // 폴더 존재 여부 확인
  console.log('\n1. 폴더 확인 중...');
  const stats = await stat(productsDir);
  if (!stats.isDirectory()) {
    throw new Error(`${productsDir}는 폴더가 아닙니다`);
  }
  console.log(`✓ 폴더가 존재합니다: ${productsDir}`);
  
  // 폴더 내용 읽기
  console.log('\n2. 폴더 내용 읽는 중...');
  const allFiles = await readdir(productsDir);
  console.log(`✓ 폴더에서 ${allFiles.length}개 항목 발견`);
  
  // 이미지 파일만 필터링
  const imageFiles = allFiles.filter(file => {
    const ext = extname(file).toLowerCase();
    return imageExtensions.includes(ext);
  });
  
  console.log(`✓ ${imageFiles.length}개 이미지 파일 발견`);
  
  // 이미지 파일 목록 출력
  if (imageFiles.length > 0) {
    console.log('\n발견된 이미지 파일:');
    imageFiles.forEach((file, index) => {
      console.log(`  ${index+1}. ${file}`);
    });
    
    // 결과 파일 저장
    console.log('\n3. 결과 파일 생성 중...');
    
    // 파일 내용 생성 (ES 모듈 형식)
    const fileContent = `// 자동 생성된 파일 - ${new Date().toLocaleString()}
export const productImages = ${JSON.stringify(imageFiles, null, 2)};
export default productImages;
`;
    
    // 디렉토리 확인 및 생성
    const dataDir = dirname(outputFile);
    if (!existsSync(dataDir)) {
      console.log(`! ${dataDir} 폴더가 없어 생성합니다`);
      await mkdir(dataDir, { recursive: true });
    }
    
    // 파일에 저장
    await writeFile(outputFile, fileContent);
    console.log(`✓ 파일 생성 완료: ${outputFile}`);
    console.log(`✓ ${imageFiles.length}개 이미지 정보 저장됨`);
  } else {
    console.error('✗ 오류: 이미지 파일이 발견되지 않았습니다');
    process.exit(1);
  }
} catch (error) {
  console.error(`✗ 오류 발생: ${error.message}`);
  process.exit(1);
}

console.log('\n=== 이미지 스캔 스크립트 완료 ===');