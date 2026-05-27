import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { getHousePhotos } from "../services/mediaServices";

const prisma = new PrismaClient();

// CREATE HOUSE
export const createHouse = async (req: Request, res: Response) => {
  try {
    const house = await prisma.house.create({
      data: req.body,
    });

    res.status(201).json({
      id: house.id,
      createdAt: house.createdAt,
    });
  } catch (err) {
    console.error("Error creating house:", err);
    res.status(500).json({
      error: "Failed to create house",
    });
  }
};

// GET ALL HOUSES
export const getHouses = async (req: Request, res: Response) => {
  console.log("🔥 GET HOUSES HIT");

  try {
    console.log("➡️ BEFORE QUERY");

    const houses = await prisma.house.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        landSize: true,
        bedrooms: true,
        bathrooms: true,
        floors: true,
        price: true,
        certificate: true,
        propertyType: true,
        yearBuilt: true,
        electricity: true,
        hasGarage: true,
        roadAccess: true,
        publicFacilities: true,
        distanceToCity: true,
        ownerId: true,
        createdAt: true,
      },
    });

    console.log("✅ QUERY SUCCESS");

    console.log(houses);

    res.json(houses);
  } catch (err) {
    console.error("❌ GET HOUSES ERROR:");

    console.error(err);

    res.status(500).json({
      error: "Failed to retrieve houses",
    });
  }
};

// GET HOUSE DETAIL
export const getHouseDetail = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const house = await prisma.house.findUnique({
      where: { id },
    });

    if (!house) {
      return res.status(404).json({
        error: "House not found",
      });
    }

    // Simulasi media-service
    const photos = await getHousePhotos(id);

    res.json({
      ...house,
      photos,
    });
  } catch {
    res.status(500).json({
      error: "Failed to retrieve house detail",
    });
  }
};

// UPDATE HOUSE
export const updateHouse = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.house.update({
      where: { id },
      data: req.body,
    });

    res.json({
      updated: true,
    });
  } catch {
    res.status(500).json({
      error: "Failed to update house",
    });
  }
};

// DELETE HOUSE
export const deleteHouse = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.house.delete({
      where: { id },
    });

    res.json({
      deleted: true,
    });
  } catch {
    res.status(500).json({
      error: "Failed to delete house",
    });
  }
};
