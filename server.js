//=============================================================================
// server.js: Entry point for Node.js console application to monitor GitHub
// traffic for the Ramda organization
// Author: Luis Castro
// Date: 07/15/2021
//=============================================================================

// npm packages
const dotenv = require('dotenv').config();
const readline = require('readline');
const superagent = require('superagent');

// Set up readline for console
const read = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const getRamdaRepositories = () => {
	let url = `https://api.github.com/orgs/ramda/repos?sorted=updated`;

	superagent.get(url)
		.set('Authorization', `Basic ${process.env.CREDENTIALS}`)
		.set('User-Agent', 'luigi741')
		.end((error, response) => {
			if (error) {
				console.log(error);
			}
			else {
				let parsedResponse = JSON.parse(response.text);
				// console.log(parsedResponse);

				// read.question('1. Repositories\n2. Pull Requests\n\nEnter an option: ', answer => {
				// 	console.log(`Response: ${answer}`);
				// 	read.close();
				// });
			}
		});
};

const main = () => {
	getRamdaRepositories();
};

main();