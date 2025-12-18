-- CreateTable
CREATE TABLE "VideoGame" (
    "id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT,
    "imageUrl" TEXT,
    "location" TEXT,
    "videogameId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "nationality" TEXT,
    "imageUrl" TEXT,
    "role" TEXT,
    "teamId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "League" (
    "id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Serie" (
    "id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT,
    "fullName" TEXT,
    "beginAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "leagueId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Serie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" TEXT,
    "beginAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "prizepool" TEXT,
    "serieId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "beginAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "tier" TEXT NOT NULL,
    "numberOfGames" INTEGER,
    "leagueId" INTEGER,
    "serieId" INTEGER,
    "tournamentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchOpponent" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MatchOpponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchStream" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "rawUrl" TEXT NOT NULL,
    "embedUrl" TEXT,
    "official" BOOLEAN NOT NULL DEFAULT false,
    "main" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MatchStream_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoGame_slug_key" ON "VideoGame"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Team_slug_key" ON "Team"("slug");

-- CreateIndex
CREATE INDEX "Team_videogameId_idx" ON "Team"("videogameId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_slug_key" ON "Player"("slug");

-- CreateIndex
CREATE INDEX "Player_teamId_idx" ON "Player"("teamId");

-- CreateIndex
CREATE INDEX "Player_name_idx" ON "Player"("name");

-- CreateIndex
CREATE UNIQUE INDEX "League_slug_key" ON "League"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Serie_slug_key" ON "Serie"("slug");

-- CreateIndex
CREATE INDEX "Serie_leagueId_idx" ON "Serie"("leagueId");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_slug_key" ON "Tournament"("slug");

-- CreateIndex
CREATE INDEX "Tournament_serieId_idx" ON "Tournament"("serieId");

-- CreateIndex
CREATE INDEX "Tournament_tier_idx" ON "Tournament"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "Match_slug_key" ON "Match"("slug");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE INDEX "Match_scheduledAt_idx" ON "Match"("scheduledAt");

-- CreateIndex
CREATE INDEX "Match_leagueId_idx" ON "Match"("leagueId");

-- CreateIndex
CREATE INDEX "Match_serieId_idx" ON "Match"("serieId");

-- CreateIndex
CREATE INDEX "Match_tournamentId_idx" ON "Match"("tournamentId");

-- CreateIndex
CREATE INDEX "Match_tier_idx" ON "Match"("tier");

-- CreateIndex
CREATE INDEX "MatchOpponent_matchId_idx" ON "MatchOpponent"("matchId");

-- CreateIndex
CREATE INDEX "MatchOpponent_teamId_idx" ON "MatchOpponent"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchOpponent_matchId_teamId_key" ON "MatchOpponent"("matchId", "teamId");

-- CreateIndex
CREATE INDEX "MatchStream_matchId_idx" ON "MatchStream"("matchId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_videogameId_fkey" FOREIGN KEY ("videogameId") REFERENCES "VideoGame"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Serie" ADD CONSTRAINT "Serie_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "Serie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "Serie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchOpponent" ADD CONSTRAINT "MatchOpponent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchOpponent" ADD CONSTRAINT "MatchOpponent_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchStream" ADD CONSTRAINT "MatchStream_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
