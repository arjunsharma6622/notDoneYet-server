"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const venue_controllers_1 = require("../controllers/venue.controllers");
const router = express_1.default.Router();
// get all venues
router.get("/", venue_controllers_1.getAllVenues);
// get venue by venueId
router.get("/:id", venue_controllers_1.getVenueById);
// get venue by unique name
router.get("/uniqueName/:uniqueName", venue_controllers_1.getVenueByUniqueName);
// get user venues of a user by userId
router.get("/user/:id", venue_controllers_1.getUserVenuesByUserId);
// create a new venue
router.post("/", venue_controllers_1.createVenue);
// update venue by venueId
router.patch("/:id", venue_controllers_1.updateVenue);
// add rating to venue
router.patch("/rating/create", venue_controllers_1.addRatingToVenue);
// delete a venue by id
router.delete("/:id", venue_controllers_1.deleteVenue);
exports.default = router;
