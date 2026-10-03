const express = require('express');
const router = express.Router();
const {
  createRoom,
  getRooms,
  getAvailableRooms,
  updateRoom,
  deleteRoom,
  allocateRoom,
  checkoutRoom
} = require('../controllers/roomController');

router.post('/allocate', allocateRoom);
router.post('/checkout', checkoutRoom);
router.get('/available', getAvailableRooms);
router.post('/', createRoom);
router.get('/', getRooms);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);

module.exports = router;
