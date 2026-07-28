import { getHousePhotos } from "../services/mediaServices";

// Helper
const formatHouse = async (house: any) => {
  const photos = await getHousePhotos(house.id);

  return {
    ...house,
    photos,
  };
};
