import { Request, Response } from "express";
import axios from "axios";

const HOUSE_SERVICE_URL = process.env.HOUSE_SERVICE_URL!;

export const searchHouses = async (req: Request, res: Response) => {
  try {
    const { priceMin, priceMax, bedrooms, location, sortBy } = req.query;
    console.log("🔥 SEARCH HIT");
    // GET ALL HOUSES
    const response = await axios.get(`${HOUSE_SERVICE_URL}/houses`);
    console.log("HOUSE URL:", HOUSE_SERVICE_URL);
    let houses = response.data;
    // FILTER PRICE MIN
    if (priceMin) {
      houses = houses.filter((house: any) => house.price >= Number(priceMin));
    }
    // FILTER PRICE MAX
    if (priceMax) {
      houses = houses.filter((house: any) => house.price <= Number(priceMax));
    }
    // FILTER BEDROOMS
    if (bedrooms) {
      houses = houses.filter(
        (house: any) => house.bedrooms === Number(bedrooms),
      );
    }
    // FILTER LOCATION
    if (location) {
      houses = houses.filter((house: any) =>
        house.location.toLowerCase().includes(String(location).toLowerCase()),
      );
    }

    // SORTING
    if (sortBy === "priceAsc") {
      houses.sort((a: any, b: any) => a.price - b.price);
    } else if (sortBy === "priceDesc") {
      houses.sort((a: any, b: any) => b.price - a.price);
    }
    // RESPONSE
    res.json(houses);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Search failed",
    });
  }
};
