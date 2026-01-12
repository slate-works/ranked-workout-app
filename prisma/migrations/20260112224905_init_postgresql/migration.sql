-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastWorkoutAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "sex" TEXT,
    "height" DOUBLE PRECISION,
    "heightUnit" TEXT NOT NULL DEFAULT 'in',
    "bodyWeight" DOUBLE PRECISION,
    "weightUnit" TEXT NOT NULL DEFAULT 'lb',
    "trainingAgeYears" DOUBLE PRECISION,
    "preferredUnits" TEXT NOT NULL DEFAULT 'lb',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyweightEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BodyweightEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "equipmentType" TEXT NOT NULL,
    "movementPattern" TEXT,
    "strengthStandard" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MuscleGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bodyArea" TEXT NOT NULL,

    CONSTRAINT "MuscleGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MuscleContribution" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "muscleGroupId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "contributionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 50,

    CONSTRAINT "MuscleContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "workoutType" TEXT,
    "name" TEXT,
    "notes" TEXT,
    "durationMin" INTEGER,
    "sessionRpe" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetLog" (
    "id" TEXT NOT NULL,
    "exerciseLogId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "weightUnit" TEXT NOT NULL DEFAULT 'lb',
    "rpe" DOUBLE PRECISION,
    "rir" INTEGER,
    "isWarmup" BOOLEAN NOT NULL DEFAULT false,
    "isDumbbellPair" BOOLEAN NOT NULL DEFAULT false,
    "isDropSet" BOOLEAN NOT NULL DEFAULT false,
    "isFailure" BOOLEAN NOT NULL DEFAULT false,
    "estimated1RM" DOUBLE PRECISION,
    "restAfter" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SetLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PRRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "reps" INTEGER NOT NULL,
    "estimated1RM" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PRRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MuscleGroupScoreSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "muscleGroupId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "rank" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MuscleGroupScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryStateSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "muscleGroupId" TEXT NOT NULL,
    "recoveryFraction" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "lastTrainedAt" TIMESTAMP(3),
    "projectedReadyAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecoveryStateSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_sessionToken_key" ON "AuthSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "BodyweightEntry_userId_date_idx" ON "BodyweightEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "Exercise_createdByUserId_idx" ON "Exercise"("createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_createdByUserId_key" ON "Exercise"("name", "createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "MuscleGroup_name_key" ON "MuscleGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MuscleContribution_exerciseId_muscleGroupId_key" ON "MuscleContribution"("exerciseId", "muscleGroupId");

-- CreateIndex
CREATE INDEX "Session_userId_startTime_idx" ON "Session"("userId", "startTime");

-- CreateIndex
CREATE INDEX "ExerciseLog_sessionId_idx" ON "ExerciseLog"("sessionId");

-- CreateIndex
CREATE INDEX "SetLog_exerciseLogId_idx" ON "SetLog"("exerciseLogId");

-- CreateIndex
CREATE INDEX "PRRecord_userId_exerciseId_idx" ON "PRRecord"("userId", "exerciseId");

-- CreateIndex
CREATE INDEX "MuscleGroupScoreSnapshot_userId_muscleGroupId_idx" ON "MuscleGroupScoreSnapshot"("userId", "muscleGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "MuscleGroupScoreSnapshot_userId_muscleGroupId_year_weekNumb_key" ON "MuscleGroupScoreSnapshot"("userId", "muscleGroupId", "year", "weekNumber");

-- CreateIndex
CREATE INDEX "RecoveryStateSnapshot_userId_idx" ON "RecoveryStateSnapshot"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryStateSnapshot_userId_muscleGroupId_key" ON "RecoveryStateSnapshot"("userId", "muscleGroupId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyweightEntry" ADD CONSTRAINT "BodyweightEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuscleContribution" ADD CONSTRAINT "MuscleContribution_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuscleContribution" ADD CONSTRAINT "MuscleContribution_muscleGroupId_fkey" FOREIGN KEY ("muscleGroupId") REFERENCES "MuscleGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetLog" ADD CONSTRAINT "SetLog_exerciseLogId_fkey" FOREIGN KEY ("exerciseLogId") REFERENCES "ExerciseLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PRRecord" ADD CONSTRAINT "PRRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PRRecord" ADD CONSTRAINT "PRRecord_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuscleGroupScoreSnapshot" ADD CONSTRAINT "MuscleGroupScoreSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuscleGroupScoreSnapshot" ADD CONSTRAINT "MuscleGroupScoreSnapshot_muscleGroupId_fkey" FOREIGN KEY ("muscleGroupId") REFERENCES "MuscleGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryStateSnapshot" ADD CONSTRAINT "RecoveryStateSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryStateSnapshot" ADD CONSTRAINT "RecoveryStateSnapshot_muscleGroupId_fkey" FOREIGN KEY ("muscleGroupId") REFERENCES "MuscleGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
