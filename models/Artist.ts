import mongoose from "mongoose";

export interface SongData {
    answer: string;
    link: string;
    offset?: number;
}

export interface Artists extends mongoose.Document {
    slug: string;
    displayName: string;
    colour: string;
    lastAccessed: Date;
    songs: {
        soundcloud: SongData[];
        tracker: SongData[];
    }
}

const ArtistSchema = new mongoose.Schema<Artists>({
    slug: {
        /* Used for the path (/artist/[slug]) */
        type: String,
        required: [true, "A slug is required!"],
        minlength: [4, "The slug must be at least 4 characters long!"],
        maxlength: [32, "The slug must be at most 32 characters long!"],
        unique: true,
    },
    displayName: {
        /* Display name of the artist, used for things like title */
        type: String,
        required: [true, "A display name is required!"],
        minlength: [2, "The display name must be at least 2 characters long!"],
        maxlength: [128, "The display name must be at most 129 characters long! If there's an artist with such a long name... could you shorten it? Please? :("],
    },
    colour: {
        /* Accent colour */
        type: String,
    },
    lastAccessed: Date,
    songs: {
        /* List of songs by the artist */
        soundcloud: {
            type: [{
                _id: false,
                answer: {
                    type: String,
                    required: true,
                },
                link: {
                    type: String,
                    required: true,
                    unique: true,
                },
                offset: Number,
            }],
            default: [],
        },
        tracker: {
            type: [{
                _id: false,
                answer: {
                    type: String,
                    required: true,
                },
                link: {
                    type: String,
                    required: true,
                    unique: true,
                },
                offset: Number,
            }],
            default: [],
        },
    },
});

export default mongoose.models.Artist || mongoose.model<Artists>("Artist", ArtistSchema);