"use server";
/*
 * I don't want to add a database to this project, so I'm just storing it here.
 * Can't just redo it every time either because SC has rate limits (50 tokens/12h, 30 tokens/1h)
 */
let access = "";
let refresh = "";

/**
 * Creates a new Soundcloud access token with the client credentials. Should only be done if refreshing isn't possible.
 * @return {Promise<string>} New access token.
 */
async function createAccess(): Promise<string> {
    const clientId = process.env.SOUNDCLOUD_CLIENT!;
    const clientSecret = process.env.SOUNDCLOUD_SECRET!;

    const body = new URLSearchParams({
        grant_type: "client_credentials",
    });
    const auth = btoa(`${clientId}:${clientSecret}`);

    const req = await fetch("https://secure.soundcloud.com/oauth/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json; charset=utf-8",
        },
        body,
    });
    if (!req.ok) { throw new Error("Couldn't get access token."); }

    const json = await req.json();
    access = json.access_token;
    refresh = json.refresh_token;

    setTimeout(refreshToken, json.expires_in * 950); // Token expires in ~1h, refresh it a little before

    return access;
}

/**
 * Refreshes the Soundcloud access token with the refresh token.
 * @return {Promise<string>} New access token.
 * @note For safety, this should be called a little before the token expires.
 * @private
 */
async function refreshToken(): Promise<string> {
    const clientId = process.env.SOUNDCLOUD_CLIENT!;
    const clientSecret = process.env.SOUNDCLOUD_SECRET!;
    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh,
        client_id: clientId,
        client_secret: clientSecret,
    });

    const req = await fetch("https://secure.soundcloud.com/oauth/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json; charset=utf-8",
        },
        body,
    });

    // If it fails, try just getting a new token altogether
    if (!req.ok) return createAccess();

    const json = await req.json();
    access = json.access_token;
    refresh = json.refresh_token;

    setTimeout(refreshToken, json.expires_in * 950);

    return access;
}

/**
 * Returns a Soundcloud access token. Should be valid.
 * @return {Promise<string>} Current access token.
 */
async function getSoundcloudToken(): Promise<string> {
    if (access !== "") return access;
    else return createAccess();
}

module.exports = { getSoundcloudToken, createAccess };