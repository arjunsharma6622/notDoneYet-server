import express from "express";
import {
  addRatingToVenue,
  createVenue,
  deleteVenue,
  getAllVenues,
  getUserVenuesByUserId,
  getVenueById,
  getVenueByUniqueName,
  updateVenue
} from "../controllers/venue.controllers";

const router = express.Router();

// get all venues
router.get("/", getAllVenues);

// get venue by venueId
router.get("/:id", getVenueById);

// get venue by unique name
router.get("/uniqueName/:uniqueName", getVenueByUniqueName);

// get user venues of a user by userId
router.get("/user/:id", getUserVenuesByUserId);

// create a new venue
router.post("/", createVenue);

// update venue by venueId
router.patch("/:id", updateVenue);

// add rating to venue
router.patch("/rating/create", addRatingToVenue);

// delete a venue by id
router.delete("/:id", deleteVenue);

export default router;