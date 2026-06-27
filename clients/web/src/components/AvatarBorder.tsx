import React from "react";

export const COSMETIC_BORDER_IDS: string[] = [
    "border_aurora",
    "border_gold",
    "border_neon",
    "border_fire",
    "border_emerald",
];

export const isValidBorder = (id?: string | null): boolean =>
    !!id && COSMETIC_BORDER_IDS.includes(id);

/**
 * Enveloppe un avatar avec un contour cosmétique animé (si un contour est équipé).
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
    return (
        <div
            className={`cosmetic-ring cosmetic-${borderId} ${compact ? "cosmetic-compact" : ""} ${className || ""}`}
        >
            {children}
        </div>
    );
};

export default AvatarBorder;
