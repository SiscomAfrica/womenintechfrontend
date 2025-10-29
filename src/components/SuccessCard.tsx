
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface SuccessCardProps {
  title: string;
  message: string;
  showImage?: boolean;
  className?: string;
}

export function SuccessCard({ 
  title, 
  message, 
  showImage = true, 
  className 
}: SuccessCardProps) {
  return (
    <Card className={`border-[#4CAF50] bg-[#E8F5E9] ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-[#4CAF50]" />
              <h3 className="text-lg font-bold text-[#333333]">{title}</h3>
            </div>
            <p className="text-[#666666]">{message}</p>
          </div>
          {showImage && (
            <div className="hidden md:block w-24 h-24">
              <img 
                src="/assets/images/success-card.png" 
                alt="Success" 
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}