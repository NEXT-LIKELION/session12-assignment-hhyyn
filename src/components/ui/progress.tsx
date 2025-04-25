import * as ProgressPrimitive from "@radix-ui/react-progress"
import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  userGuess?: number;
  correctPrice?: number;
  maxDeviation?: number;
}

function Progress({
  className,
  userGuess,
  correctPrice,
  maxDeviation = 100,
  style,
  ...props
}: ProgressProps) {
  // 사용자 입력값과 실제 가격을 기반으로 근접도 계산
  const calculateProximity = () => {
    // 두 값 중 하나라도 없으면 0% 표시
    if (userGuess === undefined || correctPrice === undefined || correctPrice === 0) {
      return 0;
    }
    
    // 가격 차이의 절대값
    const difference = Math.abs(userGuess - correctPrice);
    
    // 차이가 없으면 100% 정확도
    if (difference === 0) return 100;
    
    // 차이를 정확한 가격의 비율로 계산
    const percentDifference = (difference / correctPrice) * 100;
    
    // 최대 편차를 초과하면 0%, 그렇지 않으면 근접도 계산
    if (percentDifference >= maxDeviation) return 0;
    
    // 근접도 = 100% - 편차 비율
    return Math.max(0, 100 - (percentDifference * 100 / maxDeviation));
  };

  // 실제로 표시할 값을 계산
  const valueToDisplay = userGuess !== undefined && correctPrice !== undefined
    ? calculateProximity()
    : (props.value || 0);

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-base border-2 border-border bg-secondary-background",
        className
      )}
      style={{ width: '100%', ...style }}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-main transition-all"
        style={{ 
          transform: valueToDisplay === 100 
            ? 'translateX(0%)' 
            : `translateX(-${100 - valueToDisplay}%)`,
          borderRight: valueToDisplay === 100 ? 'none' : '2px solid var(--border-color)'
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }