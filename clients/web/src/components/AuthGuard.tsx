import React from 'react';
import {NavigateFunction, useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useGoBack} from '../hooks/useGoBack';

export default function AuthGuardWeb() {
    const {t, i18n} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const goBack = useGoBack('/home');

    const toggleLanguage = (): void => {
        const newLang: "fr" | "en" = i18n.language === 'fr' ? 'en' : 'fr';
        i18n.changeLanguage(newLang);
    };

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <button onClick={toggleLanguage} style={styles.langSwitch}>
                    {i18n.language === 'fr' ? 'EN 🇬🇧' : 'FR 🇫🇷'}
                </button>
                <div style={styles.iconContainer}>
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>

                <h1 style={styles.title}>{t('exclusive_content')}</h1>
                <p style={styles.text}>{t('join_melodia')}</p>

                <div style={styles.buttonWrapper}>
                    <button style={styles.loginButton} onClick={() => navigate('/login')}>
                        {t('login')}
                    </button>

                    <button style={styles.registerButtonOutline} onClick={() => navigate('/register')}>
                        <div style={styles.innerButton}>
                            {t('create_account')}
                        </div>
                    </button>
                </div>

                <button style={styles.backButton} onClick={goBack}>
                    {t('later')}
                </button>
            </div>
        </div>
    );
}


const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#1C1C28',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
    },
    content: {
        width: '100%',
        maxWidth: '400px',
        padding: '0 30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
    },
    iconContainer: {
        width: '80px',
        height: '80px',
        borderRadius: '25px',
        background: 'linear-gradient(135deg, #6366f1, #ec4899)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '25px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
    },
    title: {
        color: '#FFF',
        fontSize: '28px',
        fontWeight: 'bold',
        margin: '0 0 15px 0',
    },
    text: {
        color: '#888',
        fontSize: '16px',
        lineHeight: '24px',
        marginBottom: '40px',
    },
    buttonWrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    loginButton: {
        height: '55px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(to right, #6366f1, #ec4899)',
        color: '#FFF',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'opacity 0.2s',
    },
    registerButtonOutline: {
        height: '55px',
        borderRadius: '12px',
        border: 'none',
        padding: '2px',
        background: 'linear-gradient(to right, #6366f1, #ec4899)',
        cursor: 'pointer',
    },
    innerButton: {
        height: '100%',
        width: '100%',
        backgroundColor: '#13131a',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFF',
        fontSize: '16px',
        fontWeight: 'bold',
    },
    backButton: {
        marginTop: '30px',
        backgroundColor: 'transparent',
        border: 'none',
        color: '#555',
        fontSize: '14px',
        textDecoration: 'underline',
        cursor: 'pointer',
    },
};