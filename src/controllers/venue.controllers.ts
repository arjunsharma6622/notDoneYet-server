import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Venue } from "../models/venue.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

export const getAllVenues = async (_req: Request, res: Response) => {
    try {
        const venues = await Venue.find();
        res.status(200).json(venues);
    } catch (err) {
        console.error(`Error fetching venues: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getVenueById = async (req: Request, res: Response) => {
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
}

export const getVenueByUniqueName = async (req: Request, res: Response) => {
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
}

export const getUserVenuesByUserId = async (req: Request, res: Response) => {
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
}

export const createVenue = async (req: Request, res: Response) => {
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
}

export const updateVenue = async (req: Request, res: Response) => {
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
}

export const toggleProfileLike = asyncHandler(async (req: any, res: Response) => {
    const { profileId } = req.body;
    const userId = req.user._id;

    // Fetch the profile and user from the database
    const profile: any = await Venue.findById(profileId);
    if (!profile) throw new ApiError(404, "Profile not found");

    const user: any = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    let messageToSend = "";

    // Check if the profile is already liked by the user
    const isLiked = user.likedProfiles.includes(profileId);

    if (isLiked) {
        // If already liked, then unlike
        user.likedProfiles = user.likedProfiles.filter((id: string) => id.toString() !== profileId.toString());
        profile.profileLikes = profile.profileLikes.filter((id: string) => id.toString() !== userId.toString());

        messageToSend = "Profile unliked";
    } else {
        // If not liked, then like
        user.likedProfiles.push(profileId);
        profile.profileLikes.push(userId);

        messageToSend = "Profile liked";
    }

    // Save the changes to the user and profile
    await user.save();
    await profile.save();

    const val = messageToSend === "Profile liked" ? 1 : -1;

    // Return a success response
    return res.status(200).json(new ApiResponse(200, { liked : val } , messageToSend));
});

export const addRatingToVenue = async (req: Request, res: Response) => {
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
}

export const deleteVenue = async (req: Request, res: Response) => {
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
}