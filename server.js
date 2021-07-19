//=============================================================================
// server.js: Entry point for Node.js console application to monitor GitHub
// traffic for the Ramda organization
// Author: Luis Castro
// Date: 07/15/2021
//=============================================================================

// npm packages
const cluster		= require('cluster');
const dotenv		= require('dotenv').config();
const readline		= require('readline');
const superagent	= require('superagent');

// Set up readline for console
const read = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// Global variables
var repositories = [];

// Returns a list of repositories from the Ramda organization
const getRamdaRepositories = async () => {
	return new Promise((resolve, reject) => {
		let url = `https://api.github.com/orgs/ramda/repos?sorted=updated`;

		// Make an HTTP request to the above GitHub API URL
		superagent.get(url).set('Authorization', `Basic ${process.env.CREDENTIALS}`).set('User-Agent', 'luigi741').end((error, response) => {
			if (error) {
				console.log(error);
				reject(error);
			}
			else {
				// Parse response and get number of repositories
				let parsedResponse = JSON.parse(response.text);
				let repositoryCount = parsedResponse.length;
				console.log(`Available repositories:\n`);
	
				// Print out available repositories
				parsedResponse.forEach((element, index) => {
					console.log(`${index + 1}: ${element.name}`);
					repositories.push(element.name);
				});
	
				console.log(`${repositoryCount + 1}. Quit\n`);
	
				if (repositoryCount > 0) {
					read.question(`Select a repository [1-${repositoryCount + 1}] and press 'Enter': `, answer => {
						read.close();
						resolve(answer);
					});
				}
			}
		});
	});
};

const getRepositoryInfo = async (selectedRepository) => {
	return new Promise((resolve, reject) => {
		let url = `https://api.github.com/repos/ramda/${selectedRepository}`;
		superagent.get(url).set('Authorization', `Basic ${process.env.CREDENTIALS}`).set('User-Agent', 'luigi741').end((error, response) => {
			if (error) {
				reject(error);
			}
			else {
				let parsedResponse = JSON.parse(response.text);
				let info = {
					'dateCreated': parsedResponse.created_at,
					'lastUpdate': parsedResponse.updated_at
				};
				console.log(`Date Created: ${info.dateCreated}`);
				console.log(`Last Updated: ${info.lastUpdate}`);
				resolve(info);
			}
		});
	});
};

const getWeeklyCommits = async (selectedRepository) => {
	return new Promise((resolve, reject) => {
		let url = `https://api.github.com/repos/ramda/${selectedRepository}/stats/code_frequency`;
		superagent.get(url).set('Authorization', `Basic ${process.env.CREDENTIALS}`).set('User-Agent', 'luigi741').end((error, response) => {
			if (error) {
				reject(error);
			}
			else {
				let parsedResponse = JSON.parse(response.text);
				console.log(parsedResponse);

				parsedResponse.forEach((element, index) => {
					console.log('----------------------------------------------');
					console.log(`Week Of: ${new Date(element[0] * 1000)}`);
					console.log(`Additions: ${element[1]} | Deletions: ${element[2]}`);
				});

				resolve();
			}
		});
	});
};

const getWeeklyCommitCount = async (selectedRepository) => {
	return new Promise((resolve, reject) => {
		let url = `https://api.github.com/repos/ramda/${selectedRepository}/stats/participation`;
		superagent.get(url).set('Authorization', `Basic ${process.env.CREDENTIALS}`).set('User-Agent', 'luigi741').end((error, response) => {
			if (error) {
				reject(error);
			}
			else {
				let parsedResponse = JSON.parse(response.text);
				resolve();
			}
		});
	});
};

const parallelRequests = async () => {
	return new Promise((resolve, reject) => {
		let numberOfRequests = 2;

		if (cluster.isMaster) {
			let workerCount = 0;
	
			// Create workers for the HTTP requests
			for (let i = 0; i < numberOfRequests; i++) {
				let worker = cluster.fork();
				worker.on('message', message => {
					console.log(message.data.result);
				});
			}
	
			// Iterate through the cluster.workers object
			for (const workerId in cluster.workers) {
				workerCount++;
				if (workerCount > numberOfRequests) return;
				cluster.workers[workerId].send({
					type: 'request',
					data: {
						number: workerCount
					}
				});
			}
		}
		else {
			process.on('message', message => {
				if (message.type == 'request') {
					console.log(`Message:`);
					console.log(message.data);

					if (message.data == '1') {
						getWeeklyCommits();
					}

					if (message.data == '2') {
						getWeeklyCommitCount();
					}
				}
			});
		}
	});
};

const main = async () => {
	// Get available repositories
	// let repositorySelection = await getRamdaRepositories();
	// console.log(`\nRepository: ${repositories[repositorySelection - 1]}`);
	// await getRepositoryInfo(repositories[repositorySelection - 1]);
	// await getWeeklyCommits(repositories[repositorySelection - 1]);
	await parallelRequests();
};

main();