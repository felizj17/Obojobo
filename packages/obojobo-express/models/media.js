const fs = require('fs');
const sharp = require('sharp');

const mediaConfig = oboRequire('config').media
const logger = oboRequire('logger.js');
const db = oboRequire('db');

// test message - delete this line

class Media {
	static resize(imageBinary, newDimensions) {
		switch (newDimensions) {
			case "small": {
				newDimensions = mediaConfig.presetDimensions.small;
				break;
			}
			case "medium": {
				newDimensions = mediaConfig.presetDimensions.medium;
				break;
			}
			case "large": {
				newDimensions = mediaConfig.presetDimensions.large;
				break;
			}
		}

		sharp(imageBinary)
			.resize(newDimensions)
			.toBuffer()
			.then(data => {
				console.log(data);
			})
			.catch(e => {
				console.log(e);
			})
	}

	static fetchByIdAndDimensions(mediaId, mediaDimensions) {
		let media = null,
			binaryId = null;

		let mediaFound = false;

		console.log(`Fetching media by ID: ${mediaId}`);

		db
			.tx(transactionDb => {
				// find the users media reference
				return transactionDb
					.manyOrNone(
						`
						SELECT *
						FROM media_binaries
						WHERE media_id = $[mediaId]
						AND (dimensions = $[mediaDimensions]
						OR dimensions = $[originalMediaTag])
						ORDER BY dimensions
						`,
						{ mediaId, mediaDimensions, originalMediaTag: mediaConfig.originalMediaTag }
					)
					.then(result => {
						if (result) {
							if (result.length === 1) {
								binaryId = result[0].binary_id;
							} else if (result.length === 2){
								binaryId = (result[0].dimensions === mediaConfig.originalMediaTag)
									? result[1].binary_id
									: result[0].binary_id;

								mediaFound = true;
							} else {
								throw new Error("Too many images returned");
							}
						} else {
							throw new Error("Image not found");
						}

						console.log(binaryId);
						transactionDb.one(
							`
							SELECT *
							FROM binaries
							WHERE id = $[binaryId]
							`,
							{ binaryId }
						).then(result => {
							return result; 
						})
					})
					.then(binaryData => {
						media = binaryData.blob

						if (mediaFound) {
							return media;
						} else {
							return this.resize(media, mediaDimensions)
						}
					})
			})
			.then(() => {
				return media;
			})
			.catch(e => {
				console.log(e);
				return null;
			});
	}

	static createAndSave(userId, fileInfo, dimensions = "original") {
		let mediaBinaryData = null,
			mediaData = null;

		return db
			.tx(transactionDb => {
				const file = fs.readFileSync(fileInfo.path);

				return transactionDb
					.one(
						`
						INSERT INTO binaries
							(blob, file_size, mime_type)
						VALUES
							($[file], $[file_size], $[mime_type])
						RETURNING *`,
						{ file, file_size: fileInfo.size, mime_type: fileInfo.mimetype }
					)
                    .then(result => {
                        mediaBinaryData = result;

                        return transactionDb.one(
							`
							INSERT INTO media
								(user_id, file_name)
							VALUES
								($[userId], $[filename])
							RETURNING *`,
							{ userId, filename: fileInfo.filename }
						)
                    })
					.then(result => {
						mediaData = result;

						return transactionDb.one(
							`
							INSERT INTO media_binaries
								(media_id, binary_id, dimensions)
							VALUES
								($[mediaId], $[mediaBinariesId], $[dimensions])
							RETURNING *`,
							{ mediaId: mediaData.id, mediaBinariesId: mediaBinaryData.id, dimensions }
						)
                    })
			})
			.then(() => {
				// Delete the temporary media stored by Multer
				fs.unlinkSync(fileInfo.path)

				// ID of the user media, not the binary data
				return mediaData.id
			})
			.catch(e => {
				console.log(e)
			})
	}
}

module.exports = Media;