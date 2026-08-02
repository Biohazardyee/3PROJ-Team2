-- CreateTable
CREATE TABLE "SpotifyAccounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "spotify_id" TEXT NOT NULL,
    "display_name" TEXT,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotifyAccounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyAccounts_user_id_key" ON "SpotifyAccounts"("user_id");

-- AddForeignKey
ALTER TABLE "SpotifyAccounts" ADD CONSTRAINT "SpotifyAccounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
