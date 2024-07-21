import express from "express";
import { User } from "../models/user";
import { Venue } from "../models/venue";

const router = express.Router();

// get all venues
router.get("/", async (_req, res) => {
  try {
    const venues = await Venue.find();
    res.status(200).json(venues);
  } catch (err) {
    console.error(`Error fetching venues: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get venue by venueId
router.get("/:id", async (req, res) => {
  try {
    const venueId = req.params.id;
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ error: "Venue not found" });
    }
    res.status(200).json(venue);
  } catch (err) {
    console.error(`Error fetching venues: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get venue by unique name
router.get("/uniqueName/:uniqueName", async (req, res) => {
  try {
    const uniqueName = req.params.uniqueName;
    const venue = await Venue.findOne({ uniqueName });
    if (!venue) {
      return res.status(404).json({ error: "Venue not found" });
    }
    res.status(200).json(venue);
  } catch (err) {
    console.error(`Error fetching venues: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get user venues of a user by userId
router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = await User.findById(userId)
      .select("venues")
      .populate("venues");
    const userVenues = userData?.venues;
    res.status(200).json(userVenues);
  } catch (err) {
    console.error(`Error fetching venues: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// create a new venue
router.post("/", async (req, res) => {
  try {
    // check if the user exists
    const user: any = await User.findById(req?.body?.owner);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // create a new venue
    const newVenue = new Venue(req.body);
    //   save the venue
    const savedVenue = await newVenue.save();

    // add the venue to the user's list of venues
    user.venues.push(savedVenue._id);
    await user.save();

    res.status(201).json(savedVenue);
  } catch (err) {
    console.error(`Error creating venue: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// update venue by venueId
router.patch("/:id", async (req, res) => {
  try {
    const venueId = req.params.id;
    const updatedVenue = await Venue.findByIdAndUpdate(venueId, req.body, {
      new: true,
    });
    if (!updatedVenue) {
      return res.status(404).json({ error: "Venue not found" });
    }
    res.status(200).json(updatedVenue);
  } catch (err) {
    console.error(`Error updating venue: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// add rating to venue
router.patch("/rating/create", async (req, res) => {
  try {
    const { user, venue, rating, review }: any = req.body;

    // check if the user exists
    const userData: any = await User.findById(user);
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    // check if the venue exists
    const venueData: any = await Venue.findById(venue);
    if (!venueData) {
      return res.status(404).json({ error: "Venue not found" });
    }

    // update the rating
    venueData.rating =
      (venueData.rating * venueData.ratings.length + rating) /
      (venueData.ratings.length + 1);
    venueData.ratings.push({ user, rating, review });
    await venueData.save();

    res.status(200).json("Rating added successfully");
  } catch (err) {
    console.error(`Error adding rating: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// delete a venue by id
router.delete("/:id", async (req, res) => {
  try {
    const venueId = req.params.id;
    const deletedVenue = await Venue.findByIdAndDelete(venueId);
    if (!deletedVenue) {
      return res.status(404).json({ error: "Venue not found" });
    }
    res.status(200).json(deletedVenue);
  } catch (err) {
    console.error(`Error deleting venue: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
