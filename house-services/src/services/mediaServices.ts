export const getHousePhotos = async (houseId: number) => {
  return [
    {
      id: 1,
      url: `https://picsum.photos/200?random=${houseId}`,
    },
    {
      id: 2,
      url: `https://picsum.photos/200?random=${houseId + 1}`,
    },
  ];
};
