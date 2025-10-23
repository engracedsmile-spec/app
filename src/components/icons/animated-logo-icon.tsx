
import { cn } from "@/lib/utils";
import * as React from "react";

export const AnimatedLogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlSpace="preserve"
    width="0.447933in"
    height="0.636752in"
    version="1.1"
    style={{
      shapeRendering: "geometricPrecision",
      textRendering: "geometricPrecision",
      imageRendering: "optimizeQuality",
      fillRule: "evenodd",
      clipRule: "evenodd",
    }}
    viewBox="0 0 10.74 15.26"
    {...props}
  >
    <defs>
      <style type="text/css">
        {`
          .fil0 {
            fill: none;
            stroke: hsl(var(--primary));
            stroke-width: 0.2;
          }
          .path1 {
            stroke-dasharray: 200;
            stroke-dashoffset: 200;
            animation: draw-in 2.5s ease-in-out forwards;
          }
          .path2 {
            stroke-dasharray: 50;
            stroke-dashoffset: 50;
            animation: draw-in 1.5s ease-in-out forwards 0.5s;
          }
          @keyframes draw-in {
            to {
              stroke-dashoffset: 0;
            }
          }
        `}
      </style>
    </defs>
    <g id="Layer_x0020_1">
      <metadata id="CorelCorpID_0Corel-Layer" />
      <path
        className="fil0 path1"
        d="M4.55 15.26c0.35,-0.46 0.72,-0.99 1.08,-1.55l-1.2 0.27 -0.01 -0.45 1.6 -0.43 0.1 -0.16 -1.65 0.41 -0.01 -1.02 2.42 -0.72 -0.01 0.04c0.06,-0.11 0.12,-0.22 0.18,-0.34l-1.75 0.44 -0.03 -0.65 2.21 -0.67c0.04,-0.07 0.07,-0.15 0.1,-0.22l-2.27 0.64 -0.06 -1.48 3.09 -1.01c0.43,-1.23 0.69,-2.45 0.69,-3.55 0,-0.17 -0.01,-0.33 -0.03,-0.49 -0.08,0.01 -0.16,0.01 -0.27,-0 0,0.07 0.01,0.15 0.01,0.22 0,2.14 -1.73,3.87 -3.87,3.87 -2.14,0 -3.87,-1.73 -3.87,-3.87 0,-2.14 1.73,-3.87 3.87,-3.87 0.47,0 0.93,0.09 1.35,0.24 0,-0.09 -0,-0.19 -0.01,-0.28 -0.52,-0.21 -1.09,-0.33 -1.69,-0.33 -2.23,0 -4.07,1.61 -4.45,3.73 -0.29,1.63 0.58,4.03 1.69,6.29l3.3 -0.91 0.04 0.6 -2.88 0.83 0.1 0.28 2.78 -0.83 0.04 0.65 -2.69 0.72c0.04,0.08 0.09,0.16 0.13,0.24l2.56 -0.74 0.03 0.62 -2.28 0.68 0.13 0.22 1.32 -0.32 0.02 0.42 -1.12 0.29 0.1 0.17 1.01 -0.27 0.01 0.45 -0.8 0.19 0.09 0.14 0.72 -0.19 0.01 0.43 -0.5 0.13c0.26,0.43 0.5,0.81 0.7,1.14zm1.86 -2.81c0.04,-0.08 0.09,-0.15 0.13,-0.23l-1.54 0.39 -0 0.19 1.4 -0.37 0 0.02zm1.48 -2.96c0.04,-0.1 0.08,-0.19 0.12,-0.29l-1.96 0.56 0.01 0.27 1.83 -0.53z"
      />
      <path
        className="fil0 path2"
        d="M6.97 0c0.34,2.4 1.79,3.13 3.77,3.08 -2.41,0.17 -3.76,1.11 -3.77,3.08 0.27,-2.3 -1.58,-2.82 -3.77,-3.08 2.2,0.15 3.44,-0.88 3.77,-3.08z"
      />
    </g>
  </svg>
);
