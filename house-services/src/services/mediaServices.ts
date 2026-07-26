import axios from "axios";

const MEDIA_SERVICE_URL = process.env.MEDIA_SERVICE_URL;

export const getHousePhotos = async (houseId: number) => {
  try {
    const response = await axios.get(`${MEDIA_SERVICE_URL}/houses/${houseId}`);

    return response.data;
  } catch (error) {
    console.error("Failed to get house photos:", error);

    return [];
  }
};
