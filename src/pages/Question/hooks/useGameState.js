import { useState, useEffect, useCallback } from 'react';
// valid_product_ids.json 파일 직접 임포트
import validProductIdsData from '../../../data/valid_product_ids.json';

export function useGameState({ onGameOver }) {
    const [validProductIds, setValidProductIds] = useState([]); // 전체 상품 ID 목록
    const [usedProductIds, setUsedProductIds] = useState([]); // 이미 사용한 ID 목록
    const [questionNumber, setQuestionNumber] = useState(1);
    const [life, setLife] = useState(10);
    const [maxLife] = useState(10); // 최대 생명 수 상수로 설정
    const [userInput, setUserInput] = useState('');
    const [submittedGuess, setSubmittedGuess] = useState([]);
    const [feedback, setFeedback] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [lastQuestionScore, setLastQuestionScore] = useState(0); // 마지막으로 얻은 점수
    const [isLoading, setIsLoading] = useState(true);
    const [product, setProduct] = useState(null);

    // 최대 점수 설정 (첫 시도에 맞추면 받는 점수)
    const MAX_SCORE_PER_QUESTION = 100;
    
    // 데이터 로드 - 정적 임포트 사용
    useEffect(() => {
        let isMounted = true;
    
        const loadProductData = () => {
            try {
                setIsLoading(true);
                
                // 직접 임포트한 JSON 데이터 사용
                if (validProductIdsData && validProductIdsData.validIds) {
                    if (!isMounted) return;
                    
                    setValidProductIds(validProductIdsData.validIds);
                    
                    // 첫 번째 상품 선택
                    const randomProduct = getRandomProduct(validProductIdsData.validIds, []);
                    setProduct(randomProduct);
                } else {
                    throw new Error('Invalid product data format');
                }
                
                setTimeout(() => {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                }, 500);
            } catch (error) {
                if (isMounted) {
                    console.error('Failed to load product data:', error);
                    setIsLoading(false);
                }
            }
        };
        
        loadProductData();
        
        return () => {
            isMounted = false;
        };
    }, []);
    
    // 사용하지 않은 랜덤 상품 가져오기
    const getRandomProduct = (allProducts, usedIds) => {
        // 아직 사용하지 않은 상품 ID 필터링
        const unusedProducts = allProducts.filter(
            product => !usedIds.includes(parseInt(product.id))
        );
        
        // 모든 상품을 다 사용했으면 null 반환
        if (unusedProducts.length === 0) {
            return null;
        }
        
        // 랜덤으로 상품 선택
        const randomIndex = Math.floor(Math.random() * unusedProducts.length);
        const selectedProduct = unusedProducts[randomIndex];
        
        // 상품 정보 변환 및 반환
        return {
            id: parseInt(selectedProduct.id),
            name: selectedProduct.name,
            price: parseInt(selectedProduct.price),
            image: `./images/products/${selectedProduct.id}.jpg`
        };
    };
    
    // 정답 상태에 따른 배경 변경
    useEffect(() => {
        if (isCorrect) {
            document.body.classList.add('correct-background');
        } else {
            document.body.classList.remove('correct-background');
        }
        
        return () => {
            document.body.classList.remove('correct-background');
        };
    }, [isCorrect]);
    
    // 게임 오버 핸들러
    const handleGameOver = useCallback((finalScore) => {
        onGameOver(finalScore);
    }, [onGameOver]);
    
    // 입력 제출 처리
    const handleSubmit = () => {
        if (isLoading || isCorrect || !product) return;
        
        const userGuess = parseInt(userInput.replace(/,/g, ''), 10);
        if (isNaN(userGuess)) {
            setFeedback('유효한 숫자를 입력해주세요!');
            return;
        }
        
        const correctPrice = product.price;
        
        // 피드백 메시지 결정
        let feedbackMessage;
        if (userGuess === correctPrice) {
            feedbackMessage = '정답';
        } else if (userGuess < correctPrice) {
            feedbackMessage = 'UP';
        } else {
            feedbackMessage = 'DOWN';
        }
        
        // 제출된 값 업데이트
        setSubmittedGuess(prev => [...prev, { guess: userGuess, feedback: feedbackMessage }]);
        
        if (userGuess === correctPrice) {
            setTimeout(() => {
                // 점수 계산 - 시도 횟수에 따라 차등 지급
                const attemptsUsed = submittedGuess.length + 1; // 현재 시도 포함
                const attemptsRatio = Math.max(0, (maxLife - attemptsUsed + 1) / maxLife);
                const earnedScore = Math.round(MAX_SCORE_PER_QUESTION * attemptsRatio);
                
                setLastQuestionScore(earnedScore); // 이번 문제에서 얻은 점수 저장
                setScore(prevScore => prevScore + earnedScore);
                setFeedback(`정답!`);
                setIsCorrect(true);
            }, 300);
        } else {
            const newLife = life - 1;
            setLife(newLife);
            setFeedback(feedbackMessage);
        
            if (newLife <= 0) {
                handleGameOver(score);
            }
        }
        
        setUserInput('');
    };
    
    // 상태 초기화
    const resetState = () => {
        setUserInput('');
        setSubmittedGuess([]);
        setFeedback('');
        setIsCorrect(false);
        setLastQuestionScore(0); // 점수 초기화
        setIsLoading(true);
        setLife(maxLife); // 생명력 초기화 추가
    };
    
    // 다음 문제로 이동
    const moveToNextQuestion = useCallback(() => {
        resetState();
        
        // 현재 사용한 ID 추가
        const newUsedIds = [...usedProductIds, product.id];
        setUsedProductIds(newUsedIds);
        
        setTimeout(() => {
            setQuestionNumber(prev => prev + 1);
            
            // 다음 랜덤 상품 선택
            const nextProduct = getRandomProduct(validProductIds, newUsedIds);
            
            // 모든 상품을 다 사용했으면 게임 종료
            if (!nextProduct) {
                handleGameOver(score);
                return;
            }
            
            setProduct(nextProduct);
            
            setTimeout(() => {
                setIsLoading(false);
            }, 800);
        }, 50);
    }, [usedProductIds, product, validProductIds, handleGameOver, score, maxLife]);
    
    return {
        questionNumber,
        life,
        maxLife, // maxLife 추가
        userInput,
        setUserInput,
        submittedGuess,
        feedback,
        isCorrect,
        score,
        lastQuestionScore,
        isLoading,
        product,
        handleSubmit,
        moveToNextQuestion,
        totalProducts: validProductIds.length,
        usedProducts: usedProductIds.length
    };
}