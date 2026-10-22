import type { PropsWithChildren } from 'react';
import { Button, type ButtonProps } from 'tamagui';

export type CustomButtonProps = PropsWithChildren<
  Omit<ButtonProps, 'backgroundColor' | 'color' | 'pressStyle'>
>;

export function CustomButton({ children, ...props }: CustomButtonProps) {
  return (
    <Button
      backgroundColor="primary press:secondary"
      opacity="press:0.82"
      scale="press:0.98"
      {...props}
    >
      <Button.Text color="white" fontWeight="700">
        {children}
      </Button.Text>
    </Button>
  );
}

export default CustomButton;
