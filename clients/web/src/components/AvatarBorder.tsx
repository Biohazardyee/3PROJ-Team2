import React from "react";

/** Contours "anneau" (dégradé tournant autour de la photo). */
const RING_BORDER_IDS: string[] = [
    "border_aurora",
    "border_gold",
    "border_neon",
    "border_fire",
    "border_emerald",
    "border_ice",
    "border_galaxy",
    "border_toxic",
];

/** Contours "effet" (animation riche, pas un simple anneau). */
const EFFECT_BORDER_IDS: string[] = ["border_flame"];

export const COSMETIC_BORDER_IDS: string[] = [...RING_BORDER_IDS, ...EFFECT_BORDER_IDS];

export const isValidBorder = (id?: string | null): boolean =>
    !!id && COSMETIC_BORDER_IDS.includes(id);

/**
 * Enveloppe un avatar avec un contour cosmétique (anneau animé ou effet riche).
 * Si aucun contour valide n'est fourni, renvoie l'avatar tel quel.
 */
const AvatarBorder: React.FC<{
    borderId?: string | null;
    children: React.ReactNode;
    className?: string;
    compact?: boolean;
}> = ({borderId, children, className, compact}) => {
    if (!isValidBorder(borderId)) {
        return <>{children}</>;
    }

    // Effet "flammes" : de vraies flammes qui montent derrière la photo.
    if (borderId === "border_flame") {
        return (
            <div className={`cosmetic-flame-wrap ${className || ""}`}>
                <span className="cosmetic-flames" aria-hidden="true">
                    {Array.from({length: 11}).map((_, i) => (
                        <span
                            key={i}
                            className="cosmetic-flame"
                            style={{
                                left: `${(i / 10) * 100}%`,
                                height: `${72 + (i % 3) * 14}%`,
                                animationDelay: `${(i % 4) * 0.11 + (i % 2) * 0.06}s`,
                                animationDuration: `${0.85 + (i % 3) * 0.2}s`,
                            }}
                        />
                    ))}
                </span>
                <div className="cosmetic-flame-avatar">{children}</div>
            </div>
        );
    }

    // Contours "anneau"
    return (
        <div
            className={`cosmetic-ring cosmetic-${borderId} ${compact ? "cosmetic-compact" : ""} ${className || ""}`}
        >
            {children}
        </div>
    );
};

export default AvatarBorder;
