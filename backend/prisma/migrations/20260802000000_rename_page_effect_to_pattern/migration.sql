-- RenameColumn (page_effect cosmetic removed in favor of "pattern" cosmetic)
ALTER TABLE "Users" RENAME COLUMN "equipped_page_effect" TO "equipped_pattern";
