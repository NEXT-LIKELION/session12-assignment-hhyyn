import { useState, useCallback } from 'react';
import styles from '../Question.module.css';

export function useTransition() {
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    // 트랜지션 시작
    const startTransition = useCallback((callback) => {
        setIsTransitioning(true);
        
        const containerEl = document.querySelector(`.${styles.container}`);
        if (containerEl) {
            containerEl.classList.add(styles.fadeOut);
        }
        
        setTimeout(() => {
            if (callback) {
                callback();
            }
            if (containerEl) {
                containerEl.classList.remove(styles.fadeOut);
            }
            setTimeout(() => {
                setIsTransitioning(false);
            }, 300);
        }, 300);
    }, []);

    return {
        isTransitioning,
        startTransition
    };
}