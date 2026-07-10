import { Request, Response } from "express";
import axios from "axios";

const HOUSE_SERVICE_URL = process.env.HOUSE_SERVICE_URL!;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL!;

export const searchHouses = async (req: Request, res: Response) => {
  try {
    const { priceMin, priceMax, bedrooms, location, sortBy } = req.query;

    // GET HOUSE
    const houseResponse = await axios.get(`${HOUSE_SERVICE_URL}/houses`);

    // GET BOOKING
    const bookingResponse = await axios.get(`${USER_SERVICE_URL}/bookings`);

    let houses = houseResponse.data;
    const bookings = bookingResponse.data;

    // Merge booking ke house
    houses = houses.map((house: any) => {
      const booking = bookings.find((b: any) => b.houseId === house.id);

      return {
        ...house,
        booking: booking ?? null,
      };
    });

    // FILTER PRICE MIN
    if (priceMin) {
      houses = houses.filter((house: any) => house.price >= Number(priceMin));
    }

    // FILTER PRICE MAX
    if (priceMax) {
      houses = houses.filter((house: any) => house.price <= Number(priceMax));
    }

    // FILTER BEDROOM
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

    // SORT
    if (sortBy === "priceAsc") {
      houses.sort((a: any, b: any) => a.price - b.price);
    } else if (sortBy === "priceDesc") {
      houses.sort((a: any, b: any) => b.price - a.price);
    }

    return res.json(houses);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Search failed",
    });
  }
};
