# ReactBits UI Integration Plan

The user requested using `reactbits.dev` for the UI. To maintain performance and avoid strict dependency bloat (like adding `gsap`), we will implement "ReactBits-style" components using the existing `framer-motion` library.

## Proposed Components

We will create a specific folder `components/ui/react-bits` for these specialized effects.

### 1. [NEW] `DecryptedText`
A hacker-style text reveal effect for headings.
- **Input**: `text`, `speed`, `maxIterations`
- **Behavior**: Cycles through random characters before revealing the final text.
- **Usage**: Use for "Advanced Security Architecture" and "Hide Secrets in Plain Sight" headings.

### 2. [NEW] `SquaresBackground`
A subtle grid background with interactive hover effects.
- **Behavior**: A grid of strokes where squares light up or fade on hover.
- **Usage**: Replace the `bg-black/20` in the `Features` section with this interactive background.


### [NEW] Spotlight Component
- **File:** `components/ui/react-bits/spotlight.tsx`
- **Description:** A fixed-position radial gradient overlay that follows the mouse or stays static to create a "vignette" or "spotlight" effect around the screen edges, as seen on the reference site.
- **Implementation:**
  - Absolute/Fixed positioned div with `pointer-events-none`.
  - Radial gradient background (transparent to colored).

### [NEW] ShinyText Component
- **File:** `components/ui/react-bits/shiny-text.tsx`
- **Description:** A text component that creates a shimmering or gradient shine effect across the text, useful for highlighting keywords like "Premium Security".
- **Implementation:**
  - CSS background-clip: text.
  - Linear gradient animation.

### 3. [NEW] `PixelCard` (Quick Encrypt Visualization)
A component that simulates pixel packing/noise generation.
- **Behavior**: A grid of small squares that flash random colors or grayscale values.
- **Usage**: Enhance the "Quick Encrypt" feature card visualization.

## Integration Steps

1.  **Create Components**:
    *   `components/ui/react-bits/decrypted-text.tsx`
    *   `components/ui/react-bits/squares-background.tsx`
    *   `components/ui/react-bits/spotlight.tsx`
    *   `components/ui/react-bits/shiny-text.tsx`
    *   `components/ui/react-bits/pixel-card.tsx`

2.  **Update `app/page.tsx`**:
    *   Replace the "Advanced Security Architecture" text with `<DecryptedText />`.
    *   Wrap the Features section in `<SquaresBackground />`.
    *   Inject `<PixelCard />` into the "Quick Encrypt" feature block.

## Verification

- **Visual Check**: Verify the animations run smoothly and look "cyber-security" themed.
- **Performance**: Ensure the grid backgrounds don't cause lag on scroll.
