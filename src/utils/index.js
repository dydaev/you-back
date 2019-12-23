const fs = require('fs');

export default {
	stat: file => {
		return new Promise((resolve, reject) => {
			fs.stat(file, (err, stat) => {
				if (err) {
					reject(err);
				} else {
					resolve(stat);
				}
			});
		});
	}
}