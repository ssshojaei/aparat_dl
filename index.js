#!/usr/bin/env node

const cheerio = require('cheerio')
const axios = require('axios')
const prompts = require('prompts')
const {
	isPlayList,
	getPlayList,
	getSingleVideo,
	downloadVideo,
	getInfo,
} = require('./lib/aparat')

const page = process.argv[2]
const path = process.argv[3] || './'

if (!page) {
	console.error('error: Page url is required!')
	return 0
}
console.info('--- Getting page data ---')
axios.get(page).then(
	(response) => {
		if (response.status === 200) {
			console.info('--- Initializing ---')
			const html = response.data
			const $ = cheerio.load(html)

			if (isPlayList($)) {
				//playlist
				const videosList = getPlayList($)
				videosList.map((item, index) => {
					getInfo(item).then((res) => {
						const highQuality = res.links.length - 1
						downloadVideo(
							res.links[highQuality].value,
							`${index + 1} - ${res.title}`,
							path
						)
					})
				})
			} else {
				// single video
				const video = getSingleVideo($)
				;(async () => {
					const quality = await prompts([
						{
							type: 'select',
							name: 'link',
							message: 'Pick a quality:',
							choices: video.links,
						},
					])
					downloadVideo(quality.link, video.title, path)
				})()
			}
		}
	},
	(err) => console.log(err)
)
