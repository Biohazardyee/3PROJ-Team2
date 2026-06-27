-- Renomme l'ancien identifiant de thème "theme_linkinpark" en "theme_crimson"
-- dans les cosmétiques déjà possédés (préserve les achats existants).
UPDATE "Users"
SET "owned_cosmetics" = array_replace("owned_cosmetics", 'theme_linkinpark', 'theme_crimson')
WHERE 'theme_linkinpark' = ANY("owned_cosmetics");
