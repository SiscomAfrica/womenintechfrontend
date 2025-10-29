

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 mb-4">
          <img 
            src="/assets/images/afriinovation512.png" 
            alt="Afriinovation Logo" 
            className="w-full h-full object-contain animate-pulse"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#FF6B35] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-[#FF6B35] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-[#FF6B35] rounded-full animate-bounce"></div>
        </div>
        <p className="text-[#666666] font-medium">{message}</p>
      </div>
    </div>
  );
}