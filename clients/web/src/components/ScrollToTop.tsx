import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

const ScrollToTop = (): null => {
    const {pathname} = useLocation();

    useEffect((): void => {

        const mainContent: HTMLElement | null = document.getElementById('zone-de-scroll');

        if (mainContent) {
            mainContent.scrollTo({top: 0, left: 0, behavior: 'instant'});
        } else {
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    return null;
};

export default ScrollToTop;