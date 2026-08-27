-- CreateTable
CREATE TABLE "MagicLinkToken" (
    "jti" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MagicLinkToken_pkey" PRIMARY KEY ("jti")
);

-- CreateTable
CREATE TABLE "MagicLinkRequest" (
    "email" TEXT NOT NULL,
    "lastRequestAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MagicLinkRequest_pkey" PRIMARY KEY ("email")
);
