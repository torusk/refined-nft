import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl p-8 shadow-lg
        ${hover ? 'hover:shadow-xl transition-shadow' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function CardHeader({ children, icon, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      {icon && (
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          {icon}
        </div>
      )}
      <h3 className="text-2xl font-bold text-gray-900">{children}</h3>
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`text-gray-600 leading-relaxed ${className}`}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-6 ${className}`}>
      {children}
    </div>
  );
}