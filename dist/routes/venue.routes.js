"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_model_1 = require("../models/user.model");
const venue_model_1 = require("../models/venue.model");
const router = express_1.default.Router();
// get all venues
router.get("/", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const venues = yield venue_model_1.Venue.find();
        res.status(200).json(venues);
    }
    catch (err) {
        console.error(`Error fetching venues: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// get venue by venueId
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const venueId = req.params.id;
        const venue = yield venue_model_1.Venue.findById(venueId);
        if (!venue) {
            return res.status(404).json({ error: "Venue not found" });
        }
        res.status(200).json(venue);
    }
    catch (err) {
        console.error(`Error fetching venues: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// get venue by unique name
router.get("/uniqueName/:uniqueName", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uniqueName = req.params.uniqueName;
        const venue = yield venue_model_1.Venue.findOne({ uniqueName });
        if (!venue) {
            return res.status(404).json({ error: "Venue not found" });
        }
        res.status(200).json(venue);
    }
    catch (err) {
        console.error(`Error fetching venues: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// get user venues of a user by userId
router.get("/user/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const userData = yield user_model_1.User.findById(userId)
            .select("venues")
            .populate("venues");
        const userVenues = userData === null || userData === void 0 ? void 0 : userData.venues;
        res.status(200).json(userVenues);
    }
    catch (err) {
        console.error(`Error fetching venues: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// create a new venue
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // check if the user exists
        const user = yield user_model_1.User.findById((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.owner);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // create a new venue
        const newVenue = new venue_model_1.Venue(req.body);
        //   save the venue
        const savedVenue = yield newVenue.save();
        // add the venue to the user's list of venues
        user.venues.push(savedVenue._id);
        yield user.save();
        res.status(201).json(savedVenue);
    }
    catch (err) {
        console.error(`Error creating venue: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// update venue by venueId
router.patch("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const venueId = req.params.id;
        const updatedVenue = yield venue_model_1.Venue.findByIdAndUpdate(venueId, req.body, {
            new: true,
        });
        if (!updatedVenue) {
            return res.status(404).json({ error: "Venue not found" });
        }
        res.status(200).json(updatedVenue);
    }
    catch (err) {
        console.error(`Error updating venue: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// add rating to venue
router.patch("/rating/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, venue, rating, review } = req.body;
        // check if the user exists
        const userData = yield user_model_1.User.findById(user);
        if (!userData) {
            return res.status(404).json({ error: "User not found" });
        }
        // check if the venue exists
        const venueData = yield venue_model_1.Venue.findById(venue);
        if (!venueData) {
            return res.status(404).json({ error: "Venue not found" });
        }
        // update the rating
        venueData.rating =
            (venueData.rating * venueData.ratings.length + rating) /
                (venueData.ratings.length + 1);
        venueData.ratings.push({ user, rating, review });
        yield venueData.save();
        res.status(200).json("Rating added successfully");
    }
    catch (err) {
        console.error(`Error adding rating: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// delete a venue by id
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const venueId = req.params.id;
        const deletedVenue = yield venue_model_1.Venue.findByIdAndDelete(venueId);
        if (!deletedVenue) {
            return res.status(404).json({ error: "Venue not found" });
        }
        res.status(200).json(deletedVenue);
    }
    catch (err) {
        console.error(`Error deleting venue: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.default = router;
