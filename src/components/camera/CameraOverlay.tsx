import React from 'react';

export interface CameraStatus {
  state: 'initializing' | 'scanning' | 'auto_snapping' | 'processing_ocr' | 'confirming' | 'error';
  detection: { coverage: number; alignment: number } | null;
  snapSignals: {
    documentDetected: boolean;
    frameStable: boolean;
    imageSharp: boolean;
    consecutiveReady: number;
  } | null;
  error: string | null;
}

export interface CameraOverlayProps {
  status: CameraStatus;
  videoWidth: number;
  videoHeight: number;
}

export const CameraOverlay: React.FC<CameraOverlayProps> = ({ status, videoWidth, videoHeight }) => {
  const guideWidth = videoWidth * 0.9;
  const guideHeight = videoHeight * 0.7;
  const offsetX = (videoWidth - guideWidth) / 2;
  const offsetY = (videoHeight - guideHeight) / 2;

  const documentDetected = status.detection && status.detection.coverage > 0.3 && status.detection.alignment > 0.5;
  const guideColor = documentDetected ? '#4ade80' : '#ef4444';
  const guideDasharray = documentDetected ? 'none' : '5,5';

  const consecutiveReady = status.snapSignals?.consecutiveReady ?? 0;
  const snapProgress = (consecutiveReady / 5) * 100;

  return (
    <svg
      viewBox={`0 0 ${videoWidth} ${videoHeight}`}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    >
      {/* Darkened corners (vignette) */}
      <defs>
        <mask id="guide-mask">
          <rect width={videoWidth} height={videoHeight} fill="white" />
          <rect x={offsetX} y={offsetY} width={guideWidth} height={guideHeight} fill="black" />
        </mask>
      </defs>

      <rect
        width={videoWidth}
        height={videoHeight}
        fill="rgba(0, 0, 0, 0.4)"
        mask="url(#guide-mask)"
      />

      {/* Guide box border */}
      <rect
        x={offsetX}
        y={offsetY}
        width={guideWidth}
        height={guideHeight}
        fill="none"
        stroke={guideColor}
        strokeWidth="3"
        strokeDasharray={guideDasharray}
        opacity="0.8"
      />

      {/* Corner markers */}
      {[
        { x: offsetX, y: offsetY },
        { x: offsetX + guideWidth, y: offsetY },
        { x: offsetX + guideWidth, y: offsetY + guideHeight },
        { x: offsetX, y: offsetY + guideHeight },
      ].map((corner, i) => (
        <circle
          key={i}
          cx={corner.x}
          cy={corner.y}
          r="8"
          fill={guideColor}
          opacity="0.7"
        />
      ))}

      {/* Signal dots (Document / Stable / Sharp) */}
      <g transform={`translate(${videoWidth * 0.05}, ${videoHeight * 0.05})`}>
        {/* Document detected */}
        <circle
          cx="0"
          cy="0"
          r="8"
          fill={status.snapSignals?.documentDetected ? '#4ade80' : '#94a3b8'}
          opacity="0.9"
        />
        <text x="20" y="5" fill="white" fontSize="14" fontFamily="monospace">
          Doc
        </text>

        {/* Frame stable */}
        <circle
          cx="0"
          cy="30"
          r="8"
          fill={status.snapSignals?.frameStable ? '#4ade80' : '#94a3b8'}
          opacity="0.9"
        />
        <text x="20" y="35" fill="white" fontSize="14" fontFamily="monospace">
          Stable
        </text>

        {/* Image sharp */}
        <circle
          cx="0"
          cy="60"
          r="8"
          fill={status.snapSignals?.imageSharp ? '#4ade80' : '#94a3b8'}
          opacity="0.9"
        />
        <text x="20" y="65" fill="white" fontSize="14" fontFamily="monospace">
          Sharp
        </text>
      </g>

      {/* Auto-snap progress bar */}
      {status.snapSignals && status.snapSignals.consecutiveReady > 0 && (
        <g transform={`translate(${videoWidth * 0.5}, ${videoHeight * 0.05})`}>
          {/* Background */}
          <rect x="-60" y="0" width="120" height="8" fill="rgba(0, 0, 0, 0.5)" rx="4" />
          {/* Progress */}
          <rect
            x="-60"
            y="0"
            width={(snapProgress / 100) * 120}
            height="8"
            fill="#fbbf24"
            rx="4"
          />
          {/* Label */}
          <text
            x="0"
            y="22"
            fill="white"
            fontSize="12"
            textAnchor="middle"
            fontFamily="monospace"
          >
            {consecutiveReady}/5
          </text>
        </g>
      )}

      {/* Status text */}
      <text
        x={videoWidth * 0.5}
        y={videoHeight - 40}
        fill="white"
        fontSize="16"
        textAnchor="middle"
        fontFamily="monospace"
        opacity="0.9"
      >
        {status.state === 'initializing' && 'Initializing camera...'}
        {status.state === 'scanning' && 'Position paper in guide box'}
        {status.state === 'auto_snapping' && 'Capturing...'}
        {status.state === 'processing_ocr' && 'Extracting text...'}
        {status.state === 'confirming' && 'Review form below'}
        {status.state === 'error' && `Error: ${status.error}`}
      </text>

      {/* Hint text */}
      {documentDetected && (
        <text
          x={videoWidth * 0.5}
          y={videoHeight - 10}
          fill="#4ade80"
          fontSize="12"
          textAnchor="middle"
          fontFamily="monospace"
          opacity="0.8"
        >
          ✓ Document detected — keep steady
        </text>
      )}
    </svg>
  );
};
