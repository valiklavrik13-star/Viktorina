import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

interface StarRatingProps {
  count?: number;
  value: number;
  onChange?: (rating: number) => void;
  size?: number;
  color?: string;
  hoverColor?: string;
  inactiveColor?: string;
  isEditable?: boolean;
}

interface StarProps {
  marked: boolean;
  starId: number;
  onMouseEnter?: (starId: number) => void;
  onMouseLeave?: () => void;
  onClick?: (starId: number) => void;
  size: number;
  color: string;
  hoverColor: string;
  inactiveColor: string;
}

// FIX: Changed to React.FC<StarProps> to properly type a functional component and resolve issues with the 'key' prop.
const Star: React.FC<StarProps> = ({
  marked,
  starId,
  onMouseEnter,
  onMouseLeave,
  onClick,
  size,
  color,
  hoverColor,
  inactiveColor,
}) => {
  return (
    <span
      data-star-id={starId}
      role="button"
      onMouseEnter={() => onMouseEnter?.(starId)}
      onMouseLeave={onMouseLeave}
      onClick={() => onClick?.(starId)}
      className="cursor-pointer transition-colors"
    >
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          fill: marked ? color : inactiveColor,
          transition: 'fill 0.2s',
        }}
        className="hover:fill-[var(--hover-color)]"
      >
        <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
      </svg>
    </span>
  );
};

export const StarRating: React.FC<StarRatingProps> = ({
  count = 5,
  value = 0,
  onChange,
  size = 24,
  color = '#f5b301',
  hoverColor = '#f5b301',
  inactiveColor,
  isEditable = true,
}) => {
  const { theme } = useTheme();
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);

  const defaultInactiveColorLight = '#d1d5db'; // gray-300
  const defaultInactiveColorDark = '#4b5563'; // gray-600

  const finalInactiveColor = inactiveColor || (theme === 'dark' ? defaultInactiveColorDark : defaultInactiveColorLight);


  const handleMouseEnter = (starId: number) => {
    if (isEditable) {
      setHoverValue(starId);
    }
  };

  const handleMouseLeave = () => {
    if (isEditable) {
      setHoverValue(undefined);
    }
  };

  const handleClick = (starId: number) => {
    if (isEditable) {
      onChange?.(starId);
    }
  };
  
  const stars = Array.from({ length: count }, () => '★');

  return (
    <div className="flex items-center" style={{ '--hover-color': hoverColor } as React.CSSProperties}>
      {stars.map((_, index) => {
        const starId = index + 1;
        return (
          <Star
            key={`star_${starId}`}
            starId={starId}
            marked={(hoverValue || value) >= starId}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            size={size}
            color={color}
            hoverColor={hoverColor}
            inactiveColor={finalInactiveColor}
          />
        );
      })}
    </div>
  );
};