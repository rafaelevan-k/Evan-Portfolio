# Rafael Evan Kristanto - Interactive 3D Portfolio

A highly interactive and immersive 3D developer portfolio built to showcase professional experiences, projects, and credentials. The core feature of this portfolio is "The Archive", an interactive 3D documentation space where users can physically navigate and open books representing different categories of achievements, such as Curriculum Vitae, Certifications, Volunteer experiences, and Awards.

## Key Features

*   **Interactive 3D Environment**: Powered by Three.js and React Three Fiber, the portfolio features an exploratory 3D room with dynamic lighting, shadows, and camera controls.
*   **Custom PDF Engine**: A bespoke dual-page book spread reader built on top of `react-pdf`. It supports seamless contiguous reading across multiple documents, dynamic pagination, and high-performance caching.
*   **Immersive Transitions**: Silky smooth animations and route transitions powered by Framer Motion, connecting standard 2D web interfaces with the 3D WebGL canvas.
*   **Performance Optimized**: Features advanced WebGL optimization techniques including Device Pixel Ratio (DPR) capping, static shadow baking, and adaptive resolution scaling to maintain high framerates across devices.
*   **Responsive Design**: A seamless experience across desktop and mobile. On mobile devices, the 3D environment gracefully degrades to a stylized 2D fallback layout for optimal usability.
*   **Dark/Light Mode Sync**: The application features a robust theming system where the UI, 3D environment lighting, and post-processing effects synchronize perfectly with the user's theme preference.

## Technology Stack

*   **Framework**: Next.js (App Router), React
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **3D Rendering**: Three.js, React Three Fiber, React Three Drei
*   **Animations**: Framer Motion
*   **PDF Rendering**: react-pdf
*   **Icons**: Lucide React, React Icons

## Project Structure

*   `/app`: Next.js App Router configuration and main pages.
*   `/components/archive`: Core 3D components, Bookshelf logic, and the Book Spread PDF engine.
*   `/components/entrance`: 3D transition components bridging the 2D interface and the 3D archive.
*   `/components/ui`: Reusable UI components and theme controllers.
*   `/lib`: Application utilities, configurations, and the `archiveBooks.ts` data structure.
*   `/public/documents`: Static PDF assets served in the archive.

## Getting Started

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser.

## Contact

Feel free to explore the interactive archive and reach out if you are interested in building something together.
