import { Router } from 'express';
import { getUser, updateUser } from '../controllers/userController';
import { register, findByEmail } from '../controllers/authController';
import { addFavoriteHouse, removeFavoriteHouse, getFavoriteHouses } from '../controllers/favoriteController';
import {
	createBooking,
	getAllBookings,
	getMyBookings,
	confirmBooking,
	cancelBooking,
	getBookingById,
} from '../controllers/bookingController';

const router = Router();

// 🔓 PUBLIC
router.post('/register', register);
router.get('/findByEmail', findByEmail);

// 🔒 PROTECTED (nanti via gateway)
router.get('/register', register);
router.get('/findByEmail', findByEmail);

// ✅ BOOKING ROUTES (HARUS DI ATAS :id)
router.get('/bookings', getAllBookings);
router.post('/bookings', createBooking);
router.get('/bookings/me', getMyBookings);
router.post('/favorites', addFavoriteHouse);
router.delete('/favorites/:userId/:houseId', removeFavoriteHouse);

// ❗ BARU GENERIC ROUTE PALING BAWAH
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.get('/:id/favorites', getFavoriteHouses);
router.patch('/bookings/:id/confirm', confirmBooking);
router.patch('/bookings/:id/cancel', cancelBooking);
router.get('/bookings/:id', getBookingById);

export default router;
