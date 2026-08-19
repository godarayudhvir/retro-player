import React, { useMemo } from 'react';

/**
 * Standard Nintendo Mii Vector Avatar Component.
 * Dynamically renders authentic, beautiful, properly layered and proportioned Mii avatars.
 */
export default function MiiAvatar({
  miiData = {},
  size = 48,
  className = '',
  showShirt = true,
  onClick
}) {
  const {
    gender = 'male',
    faceShape = 0, // 0: round, 1: oval, 2: square, 3: soft-chubby
    skinColor = '#fed7aa', // Peach / Caucasian / Tan / Deep tones
    hairStyle = 0, // 0..5
    hairColor = '#451a03',
    eyeType = 0, // 0..3
    eyeColor = '#1e293b',
    eyebrowType = 0,
    noseType = 0,
    mouthType = 0,
    glasses = 0, // 0: none, 1: classic, 2: round, 3: shades
    mustache = 0, // 0: none, 1: classic, 2: goatee
    favoriteColor = '#ef4444' // Shirt & avatar ring color
  } = miiData;

  // Face Shapes: Centered symmetrically around (50, 48)
  const headPath = useMemo(() => {
    switch (faceShape % 4) {
      case 1: // Oval / Slender
        return "M 28 36 C 28 18, 72 18, 72 36 C 72 56, 64 74, 50 74 C 36 74, 28 56, 28 36 Z";
      case 2: // Square / Strong Jaw
        return "M 27 36 C 27 19, 73 19, 73 36 C 73 58, 68 73, 50 73 C 32 73, 27 58, 27 36 Z";
      case 3: // Chubby / Cute Baby Face
        return "M 26 38 C 26 20, 74 20, 74 38 C 76 60, 67 75, 50 75 C 33 75, 24 60, 26 38 Z";
      default: // Classic Round Head
        return "M 27 36 C 27 18, 73 18, 73 36 C 73 56, 65 73, 50 73 C 35 73, 27 56, 27 36 Z";
    }
  }, [faceShape]);

  const uniqueId = useMemo(() => Math.random().toString(36).substring(2, 9), []);

  return (
    <div 
      className={`mii-avatar-wrapper ${className}`} 
      style={{ width: size, height: size, cursor: onClick ? 'pointer' : 'default', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClick}
    >
      <svg 
        viewBox="0 0 100 100" 
        width={size} 
        height={size} 
        className="mii-avatar-svg"
      >
        <defs>
          <clipPath id={`mii-clip-${uniqueId}`}>
            <circle cx="50" cy="50" r="47" />
          </clipPath>
          <linearGradient id={`mii-bg-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor={favoriteColor} stopOpacity="0.25" />
          </linearGradient>
          <filter id={`mii-shadow-${uniqueId}`} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* Outer Circular Badge Frame */}
        <circle cx="50" cy="50" r="48" fill={`url(#mii-bg-${uniqueId})`} stroke={favoriteColor} strokeWidth="3" />

        <g clipPath={`url(#mii-clip-${uniqueId})`}>
          {/* Back Hair (Layered behind ears & head) */}
          <g className="mii-back-hair" fill={hairColor}>
            {hairStyle % 6 === 2 && (
              // Long Hair Backing
              <path d="M 22 36 C 22 14, 78 14, 78 36 C 80 58, 77 78, 74 84 C 68 84, 66 70, 50 70 C 34 70, 32 84, 26 84 C 23 78, 20 58, 22 36 Z" />
            )}
            {hairStyle % 6 === 4 && (
              // Ponytail Bun on top
              <g>
                <circle cx="50" cy="12" r="7" />
                <path d="M 46 16 L 54 16 L 52 20 L 48 20 Z" fill={hairColor} />
              </g>
            )}
          </g>

          {/* Shirt & Body (Bottom) */}
          {showShirt && (
            <g className="mii-body">
              {/* Shoulders */}
              <path 
                d="M 16 100 C 16 75, 84 75, 84 100 Z" 
                fill={favoriteColor} 
              />
              {/* Neck */}
              <rect x="44" y="68" width="12" height="12" fill={skinColor} />
              {/* White Collar Notch */}
              <path 
                d="M 42 76 C 46 83, 54 83, 58 76 C 54 79, 46 79, 42 76 Z" 
                fill="#ffffff" 
                opacity="0.9" 
              />
            </g>
          )}

          {/* Ears */}
          <g className="mii-ears" fill={skinColor}>
            <circle cx="26" cy="46" r="5.5" />
            <circle cx="74" cy="46" r="5.5" />
            <circle cx="26" cy="46" r="2.8" fill="#d97706" opacity="0.2" />
            <circle cx="74" cy="46" r="2.8" fill="#d97706" opacity="0.2" />
          </g>

          {/* Head Base */}
          <path d={headPath} fill={skinColor} filter={`url(#mii-shadow-${uniqueId})`} />

          {/* Cheeks / Blush */}
          <ellipse cx="34" cy="54" rx="4.5" ry="3" fill="#f87171" opacity="0.32" />
          <ellipse cx="66" cy="54" rx="4.5" ry="3" fill="#f87171" opacity="0.32" />

          {/* Eyebrows */}
          <g className="mii-eyebrows" stroke={hairColor} strokeWidth="2.4" strokeLinecap="round" fill="none">
            {eyebrowType % 3 === 0 && (
              <>
                <path d="M 33 37 Q 39 33 45 36" />
                <path d="M 67 37 Q 61 33 55 36" />
              </>
            )}
            {eyebrowType % 3 === 1 && (
              <>
                <path d="M 33 35 Q 39 31 45 35" strokeWidth="3.2" />
                <path d="M 67 35 Q 61 31 55 35" strokeWidth="3.2" />
              </>
            )}
            {eyebrowType % 3 === 2 && (
              <>
                <path d="M 32 38 Q 38 34 45 37" />
                <path d="M 68 38 Q 62 34 55 37" />
              </>
            )}
          </g>

          {/* Eyes */}
          <g className="mii-eyes">
            {eyeType % 4 === 0 && (
              // Classic Dot / Nintendo Eyes
              <>
                <ellipse cx="38" cy="45" rx="3.6" ry="4.8" fill={eyeColor} />
                <circle cx="39.2" cy="43.5" r="1.3" fill="#ffffff" />
                <ellipse cx="62" cy="45" rx="3.6" ry="4.8" fill={eyeColor} />
                <circle cx="63.2" cy="43.5" r="1.3" fill="#ffffff" />
              </>
            )}
            {eyeType % 4 === 1 && (
              // Anime / Glossy Eyes
              <>
                <ellipse cx="38" cy="45" rx="4.6" ry="5.6" fill={eyeColor} />
                <circle cx="39.5" cy="43" r="1.8" fill="#ffffff" />
                <circle cx="36.5" cy="47" r="1" fill="#ffffff" />
                <ellipse cx="62" cy="45" rx="4.6" ry="5.6" fill={eyeColor} />
                <circle cx="63.5" cy="43" r="1.8" fill="#ffffff" />
                <circle cx="60.5" cy="47" r="1" fill="#ffffff" />
              </>
            )}
            {eyeType % 4 === 2 && (
              // Curved Happy / Smiling Eyes (^_^)
              <g stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" fill="none">
                <path d="M 33 46 Q 38 41 43 46" />
                <path d="M 57 46 Q 62 41 67 46" />
              </g>
            )}
            {eyeType % 4 === 3 && (
              // Playful Wink
              <>
                <ellipse cx="38" cy="45" rx="3.6" ry="4.8" fill={eyeColor} />
                <circle cx="39.2" cy="43.5" r="1.3" fill="#ffffff" />
                <path d="M 57 45 Q 62 41 67 45" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            )}
          </g>

          {/* Nose */}
          <g className="mii-nose" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {noseType % 3 === 0 && <path d="M 50 47 L 47 54 L 53 54" />}
            {noseType % 3 === 1 && <circle cx="50" cy="52" r="2.2" fill="#b45309" stroke="none" opacity="0.8" />}
            {noseType % 3 === 2 && <path d="M 50 48 Q 53.5 52 50 55" />}
          </g>

          {/* Mustache / Facial Hair */}
          {mustache === 1 && (
            // Classic Mario Mustache
            <path 
              d="M 50 57 C 44 54, 34 57, 32 61 C 38 62, 45 59, 50 60 C 55 59, 62 62, 68 61 C 66 57, 56 54, 50 57 Z" 
              fill={hairColor} 
            />
          )}
          {mustache === 2 && (
            // Goatee
            <path 
              d="M 46 66 C 46 66, 50 72, 54 66 Z" 
              fill={hairColor} 
            />
          )}

          {/* Mouth */}
          <g className="mii-mouth">
            {mouthType % 4 === 0 && (
              // Classic Gentle Smile
              <path d="M 42 61 Q 50 67 58 61" stroke="#b91c1c" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            )}
            {mouthType % 4 === 1 && (
              // Open Joyful Smile
              <path d="M 41 60 Q 50 71 59 60 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
            )}
            {mouthType % 4 === 2 && (
              // Smirk
              <path d="M 44 62 Q 51 64 57 60" stroke="#b91c1c" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            )}
            {mouthType % 4 === 3 && (
              // Neutral Line
              <path d="M 43 61 L 57 61" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" />
            )}
          </g>

          {/* Glasses Accessory */}
          {glasses === 1 && (
            // Square Frames
            <g className="mii-glasses" stroke="#0f172a" strokeWidth="2" fill="rgba(255,255,255,0.25)">
              <rect x="30" y="39" width="16" height="12" rx="2" />
              <rect x="54" y="39" width="16" height="12" rx="2" />
              <line x1="46" y1="45" x2="54" y2="45" />
            </g>
          )}
          {glasses === 2 && (
            // Round Gold Frames
            <g className="mii-glasses" stroke="#d97706" strokeWidth="2" fill="rgba(255,255,255,0.3)">
              <circle cx="38" cy="45" r="7.5" />
              <circle cx="62" cy="45" r="7.5" />
              <line x1="45.5" y1="45" x2="54.5" y2="45" />
            </g>
          )}
          {glasses === 3 && (
            // Cool Sunglasses
            <g className="mii-glasses" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5">
              <path d="M 30 40 L 46 40 L 44 51 L 31 49 Z" />
              <path d="M 54 40 L 70 40 L 69 49 L 56 51 Z" />
              <line x1="46" y1="43" x2="54" y2="43" stroke="#0f172a" strokeWidth="2.5" />
            </g>
          )}

          {/* Front Hair (Layered over forehead) */}
          <g className="mii-hair" fill={hairColor}>
            {hairStyle % 6 === 0 && (
              // Classic Parted Hair
              <path d="M 26 38 C 24 16, 36 14, 50 14 C 64 14, 76 16, 74 38 C 70 24, 60 18, 50 18 C 38 18, 29 25, 26 38 Z" />
            )}
            {hairStyle % 6 === 1 && (
              // Anime Bangs / Spiky Hair
              <path d="M 25 40 C 23 16, 36 12, 50 12 C 64 12, 77 16, 75 40 L 71 28 L 65 36 L 57 24 L 50 34 L 43 24 L 35 36 L 29 28 Z" />
            )}
            {hairStyle % 6 === 2 && (
              // Curly Front Fringe
              <path d="M 26 38 C 24 16, 36 14, 50 14 C 64 14, 76 16, 74 38 C 71 22, 62 18, 50 18 C 38 18, 29 22, 26 38 Z" />
            )}
            {hairStyle % 6 === 3 && (
              // Nintendo Cap (Mario/Luigi style)
              <g>
                <path d="M 23 34 C 23 12, 77 12, 77 34 Q 50 25 23 34 Z" fill={favoriteColor} />
                <path d="M 18 34 Q 50 26 82 34 Q 50 40 18 34 Z" fill={favoriteColor} />
                <circle cx="50" cy="24" r="5.5" fill="#ffffff" />
                <text x="50" y="26.8" fontSize="6.5" fontWeight="900" textAnchor="middle" fill={favoriteColor}>M</text>
              </g>
            )}
            {hairStyle % 6 === 4 && (
              // Headband & Ponytail Fringe
              <g>
                {/* Colored Headband */}
                <path d="M 26 34 Q 50 28 74 34 L 74 30 Q 50 24 26 30 Z" fill={favoriteColor} />
                {/* Front Fringe */}
                <path d="M 26 32 C 24 18, 36 16, 50 16 C 64 16, 76 18, 74 32 C 70 20, 60 17, 50 17 C 40 17, 30 20, 26 32 Z" />
              </g>
            )}
            {hairStyle % 6 === 5 && (
              // Clean Cut / Recessed Temples
              <path d="M 26 38 C 24 28, 28 22, 34 20 C 32 27, 30 33, 26 38 Z M 74 38 C 76 28, 72 22, 66 20 C 68 27, 70 33, 74 38 Z" />
            )}
          </g>
        </g>
      </svg>
    </div>
  );
}
