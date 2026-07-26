-- CreateTable
CREATE TABLE "House" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "landSize" DOUBLE PRECISION NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "floors" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "certificate" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "yearBuilt" INTEGER NOT NULL,
    "electricity" INTEGER NOT NULL,
    "hasGarage" BOOLEAN NOT NULL,
    "roadAccess" TEXT NOT NULL,
    "publicFacilities" TEXT,
    "distanceToCity" DOUBLE PRECISION NOT NULL,
    "ownerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "House_pkey" PRIMARY KEY ("id")
);
