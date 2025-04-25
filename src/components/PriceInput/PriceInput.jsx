import React, { useState } from 'react';
import styles from '@/pages/Question/Question.module.css';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PriceInput = React.forwardRef(({
  className,
  value,
  onChange,
  placeholder = "가격을 입력하세요",
  onSubmit,  // 제출 핸들러 prop 추가
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    // 숫자만 입력 받기
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    
    // 천 단위 콤마 추가
    const formattedValue = rawValue ? parseInt(rawValue, 10).toLocaleString() : '';
    onChange(formattedValue);
  };

  const handleKeyDown = (e) => {
    // Enter 키를 누르면 제출 처리
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative">
      <Input
        ref={ref}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`pr-8 ${className} ${styles.priceInput}`}
        autoComplete="off"
        {...props}
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
        원
      </span>
    </div>
  );
});

PriceInput.displayName = "PriceInput";

export default PriceInput;