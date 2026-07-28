import axios from "axios";

const MEDIA_SERVICE_URL = process.env.MEDIA_SERVICE_URL;

const getInternalHeaders = () => {
  const token = process.env.INTERNAL_SERVICE_TOKEN;

  if (!token) throw new Error("INTERNAL_SERVICE_TOKEN must be configured");

  return { "x-internal-token": token };
};

export const getHousePhotos = async (houseId: number) => {
  try {
    const response = await axios.get(`${MEDIA_SERVICE_URL}/houses/${houseId}`, {
      headers: getInternalHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error("Failed to get house photos:", error);

    return [];
  }
};
