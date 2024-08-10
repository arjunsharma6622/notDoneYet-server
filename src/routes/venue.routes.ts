import express from "express";
import {
  addRatingToVenue,
  createVenue,
  deleteVenue,
  getAllVenues,
  getUserVenuesByUserId,
  getVenueById,
  getVenueByUniqueName,
  updateVenue,
} from "../controllers/venue.controllers";

const router = express.Router();

// get all venues
router.route("/").get(getAllVenues).post(createVenue);

// create a new venue
router.route("/").post(createVenue);

// get venue by venueId
router.route("/:id").get(getVenueById).patch(updateVenue).delete(deleteVenue);
// update venue by venueId
router.route("/:id").patch(updateVenue).delete(deleteVenue);
// delete venue by venueId
router.route("/:id").delete(deleteVenue);

// get venue by unique name
router.route("/uniqueName/:uniqueName").get(getVenueByUniqueName);

// get user venues of a user by userId
router.route("/user/:id").get(getUserVenuesByUserId);

// add rating to venue
router.route("/rating/create").patch(addRatingToVenue);

export default router;