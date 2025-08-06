-- CreateTable
CREATE TABLE "GarentInvitation" (
    "token" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "invitedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GarentInvitation_pkey" PRIMARY KEY ("token")
);

-- AddForeignKey
ALTER TABLE "GarentInvitation" ADD CONSTRAINT "GarentInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
