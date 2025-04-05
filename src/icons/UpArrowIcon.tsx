import React from "react";

interface ArrowIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const UpArrowIcon: React.FC<ArrowIconProps> = ({
  width = 20,
  height = 19,
  color = "white"
}) => {
  return (
    <div data-svg-wrapper className="relative">
      <svg
        width={width}
        height={height}
        viewBox="0 0 20 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 14.6255V4.5293"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.61523 9.57737L9.99985 4.5293L15.3845 9.57737"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default UpArrowIcon;
