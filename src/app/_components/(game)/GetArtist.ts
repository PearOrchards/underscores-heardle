"use server";
import Artist from "@/../models/Artist";

export async function GetArtist(slug: string) {
    const s = Artist.findOne({ slug });
    console.log(s);
    return s;
}