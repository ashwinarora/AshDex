import { useWindowSize } from "@uidotdev/usehooks";

export const useScreenSize = () => {
    const screenSize = useWindowSize().width
    const currentScreen = screenSize ? screenSize < 768 ? 'mobile' : screenSize < 1280 ? 'tablet' : 'desktop' : 'loading'
    return { currentScreen, screenSize, isMobile: currentScreen === 'mobile', isTablet: currentScreen === 'tablet', isDesktop: currentScreen === 'desktop' }
}