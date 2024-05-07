import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'underscores heardle',
		short_name: "underscores heardle",
		description: "A clone of Heardle for underscores songs, by orchards.dev",
		start_url: '/',
		display: 'standalone',
		background_color: '#222222',
		theme_color: '#222222',
		icons: [
			{
				"src": "/icon-192.png",
				"sizes": "192x192",
				"type": "image/png"
			},
			{
				"src": "/icon-512.png",
				"sizes": "512x512",
				"type": "image/png"
			},
		],
	}
}