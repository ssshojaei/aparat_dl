const wget = require('wget-improved')
const cliProgress = require('cli-progress')
const cheerio = require('cheerio')
const axios = require('axios')
const downloadBar = new cliProgress.SingleBar(
	{
		format: 'Downloading [{bar}] {percentage}%',
	},
	cliProgress.Presets.rect
)

const getPlayList = ($) => {
	let videosList = []
	$('.playlist-body > .item').each(function () {
		let url = $(this).find('.thumb-title').children('a').attr('href')
		// let title = $(this).find('.thumb-title').children('a').text()
		videosList.push(`https://www.aparat.com${url}`)
		// videosList.push({
		// title,
		// link: `https://www.aparat.com${url}`,
		// })
	})
	return videosList
}

const isPlayList = ($) => {
	return $('.single').hasClass('has-playlist') ? true : false
}

const getInfo = async (page) => {
	return await axios.get(encodeURI(page)).then(
		(res) => {
			if (res.status === 200) {
				const html = res.data
				const $ = cheerio.load(html)
				const title = $('title').text().trim()
				const links = []
				$('li.menu-item-link.link').each(async function () {
					let quality = $(this).children('a').text()
					let link = $(this).children('a').attr('href')
					quality = quality.replace('با کیفیت', '')
					quality = parseInt(quality)
					links.push({
						title: quality,
						value: link,
					})
				})
				return { title, links }
			}
		},
		(err) => console.log(err)
	)
}

const getSingleVideo = ($) => {
	const title = $('title').text().trim()
	let links = []
	$('li.menu-item-link.link').each(function () {
		let quality = $(this).children('a').text()
		let link = $(this).children('a').attr('href')
		quality = quality.replace('با کیفیت', '')
		quality = parseInt(quality)
		links.push({
			title: quality,
			value: link,
		})
	})
	return { title, links }
}

const downloadVideo = (link, title, path) => {
	const src = link
	const output = `${path}/${title}.mp4`
	let download = wget.download(src, output)
	download.on('error', (err) => {
		console.log(err)
	})
	download.on('start', () => {
		downloadBar.start(1, 0)
	})
	download.on('progress', (progress) => {
		typeof progress === 'number'
		downloadBar.update(progress)
	})
	download.on('end', () => {
		downloadBar.stop()
	})
}

module.exports = {
	getPlayList,
	isPlayList,
	getSingleVideo,
	downloadVideo,
	getInfo,
}
