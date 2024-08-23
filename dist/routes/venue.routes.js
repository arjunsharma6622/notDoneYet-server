"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const venue_controllers_1 = require("../controllers/venue.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// get all venues
router.route("/").get(venue_controllers_1.getAllVenues).post(venue_controllers_1.createVenue);
// create a new venue
router.route("/").post(venue_controllers_1.createVenue);
// get venue by venueId
router.route("/:id").get(venue_controllers_1.getVenueById).patch(venue_controllers_1.updateVenue).delete(venue_controllers_1.deleteVenue);
// update venue by venueId
router.route("/:id").patch(venue_controllers_1.updateVenue).delete(venue_controllers_1.deleteVenue);
// delete venue by venueId
router.route("/:id").delete(venue_controllers_1.deleteVenue);
router.route("/toggleProfileLike").post(auth_middleware_1.verifyJWT, venue_controllers_1.toggleProfileLike);
// get venue by unique name
router.route("/uniqueName/:uniqueName").get(venue_controllers_1.getVenueByUniqueName);
// get user venues of a user by userId
router.route("/user/:id").get(venue_controllers_1.getUserVenuesByUserId);
// add rating to venue
router.route("/rating/create").patch(venue_controllers_1.addRatingToVenue);
exports.default = router;
