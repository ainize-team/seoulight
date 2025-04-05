import React from "react";

interface StopIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const StopIcon: React.FC<StopIconProps> = ({
  width = 16,
  height = 16,
  color = "white"
}) => {
  return (
    <div data-svg-wrapper className="relative">
      <svg
        width={width}
        height={height}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="4" y="4" width="12" height="12" rx="2" fill={color} />
      </svg>
    </div>
  );
};

export default StopIcon;
