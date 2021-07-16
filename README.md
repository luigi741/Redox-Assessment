# Redox Coding Assessment
For the coding task, we'll build a tool to analyze pull request traffic for a Github organization.
For the part you do on your own: write some code that will retrieve every pull request for the Ramda organization using the Github web API and store the results in memory. When we pair, we will use this collection of pull requests for analysis of things like patterns across PRs of different statuses. For example, we might answer a question like "how many pull requests were merged week over week across the organization?”

Do not use a pre-existing Github library. We want to see you interact directly with the Github API and use JavaScript or Typescript, ideally as a NodeJS console app. Other than that, use whatever tools (frameworks, etc) you like, structure your code however you like, etc. We care much more about how you solve technical problems generally than any specific knowledge and we want to see you at your best.

## List repositories for a given organization
```GET /orgs/{org}/repos```

## List pull requests for a repository
```GET /repos/{owner}/{repo}/pulls```