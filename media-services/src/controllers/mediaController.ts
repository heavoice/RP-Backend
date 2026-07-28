import { Request, Response } from "express";
import { prisma } from "../prisma";
import cloudinary from "cloudinary";
import "dotenv/config";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadHouseMedia = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: "No image file provided",
      });
    }

    // Route ini TIDAK BOLEH menerima userId
    if (req.body.userId) {
      return res.status(400).json({
        error: "userId is not allowed for house upload",
      });
    }

    const houseId = Number(req.body.houseId);

    if (!houseId) {
      return res.status(400).json({
        error: "houseId is required",
      });
    }

    const uploadResult = await new Promise<cloudinary.UploadApiResponse>(
      (resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          {
            folder: "rumah-prediksi/houses",
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          },
        );

        stream.end(file.buffer);
      },
    );

    const media = await prisma.media.create({
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        houseId,
        userId: null,
      },
    });

    return res.status(201).json({
      mediaId: media.id,
      url: media.url,
      message: "House image uploaded successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to upload house image",
    });
  }
};

export const uploadProfileMedia = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: "No image file provided",
      });
    }

    // Route ini TIDAK BOLEH menerima houseId
    if (req.body.houseId) {
      return res.status(400).json({
        error: "houseId is not allowed for profile upload",
      });
    }

    const authenticatedUserId = Number(req.headers["x-user-id"]);

    if (!authenticatedUserId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    // Tidak boleh upload ke akun lain
    if (req.body.userId && Number(req.body.userId) !== authenticatedUserId) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    const oldMedia = await prisma.media.findFirst({
      where: {
        userId: authenticatedUserId,
      },
    });

    if (oldMedia) {
      try {
        await cloudinary.v2.uploader.destroy(oldMedia.publicId);
      } catch (err) {
        console.error("Failed deleting old image:", err);
      }

      await prisma.media.delete({
        where: {
          id: oldMedia.id,
        },
      });
    }

    const uploadResult = await new Promise<cloudinary.UploadApiResponse>(
      (resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          {
            folder: "rumah-prediksi/profiles",
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          },
        );

        stream.end(file.buffer);
      },
    );

    const media = await prisma.media.create({
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        userId: authenticatedUserId,
        houseId: null,
      },
    });

    return res.status(201).json({
      mediaId: media.id,
      url: media.url,
      message: "Profile image uploaded successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to upload profile image",
    });
  }
};

export const getMediaByHouse = async (req: Request, res: Response) => {
  try {
    const houseId = Number(req.params.id);

    if (!houseId) {
      return res.status(400).json({
        error: "Invalid house ID",
      });
    }

    const mediaList = await prisma.media.findMany({
      where: {
        houseId,
      },
      select: {
        id: true,
        url: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.json(
      mediaList.map((m) => ({
        mediaId: m.id,
        url: m.url,
      })),
    );
  } catch (err) {
    console.error("Get media error:", err);

    return res.status(500).json({
      error: "Failed to fetch media",
    });
  }
};

export const getProfileMedia = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    if (!userId) {
      return res.status(400).json({
        error: "Invalid user ID",
      });
    }

    const media = await prisma.media.findFirst({
      where: {
        userId,
      },
      select: {
        id: true,
        url: true,
      },
    });

    if (!media) {
      return res.status(404).json({
        error: "Profile image not found",
      });
    }

    return res.json({
      mediaId: media.id,
      url: media.url,
    });
  } catch (err) {
    console.error("Get profile media error:", err);

    return res.status(500).json({
      error: "Failed to fetch profile image",
    });
  }
};
