const express = require('express');
const router = express.Router();
const {
  createResident,
  getResidents,
  getResidentById,
  updateResident,
  deleteResident
} = require('../controllers/residentController');

router.post('/', createResident);
router.get('/', getResidents);
router.get('/:id', getResidentById);
router.put('/:id', updateResident);
router.delete('/:id', deleteResident);

module.exports = router;
