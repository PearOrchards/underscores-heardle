"use server";
import { promises as fs } from "fs";

export type History = {
	[date: string]: {
		guesses?: string[];
		answer?: string,
	};
}

export async function UpdateHistory(old: any): Promise<History> {
	const newHistory: any = { };
	
	const file = await fs.readFile(process.cwd() + "/src/app/historical.json", 'utf-8');
	const historical = JSON.parse(file);
	
	for (let [k, v] of Object.entries(old)) {
		newHistory[k] = {
			guesses: new Array(v), // Fill with empty strings
			answer: historical[k],
		};
	}
	
	return newHistory;
}
