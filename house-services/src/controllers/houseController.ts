import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { getHousePhotos } from "../services/mediaServices";

const prisma = new PrismaClient();

// Helper
const formatHouse = async (house: any) => {
  const photos = await getHousePhotos(house.id);

  return {
    ...house,
    photos,
  };
};

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
    console.error(err);

    res.status(500).json({
      error: "Failed to create house",
    });
  }
};

// GET ALL HOUSES
export const getHouses = async (req: Request, res: Response) => {
  try {
    const houses = await prisma.house.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const result = await Promise.all(houses.map((house) => formatHouse(house)));

    return res.json(result);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to retrieve houses",
    });
  }
};

// GET HOUSE DETAIL
export const getHouseDetail = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const house = await prisma.house.findUnique({
      where: {
        id,
      },
    });

    if (!house) {
      return res.status(404).json({
        error: "House not found",
      });
    }

    return res.json(await formatHouse(house));
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to retrieve house detail",
    });
  }
};

// UPDATE HOUSE
export const updateHouse = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.house.update({
      where: {
        id,
      },
      data: req.body,
    });

    return res.json({
      updated: true,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to update house",
    });
  }
};

// DELETE HOUSE
export const deleteHouse = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.house.delete({
      where: {
        id,
      },
    });

    return res.json({
      deleted: true,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to delete house",
    });
  }
};
