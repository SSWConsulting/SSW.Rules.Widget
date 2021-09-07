const githubOwner = "SSWConsulting";
const githubRepo = "SSW.Rules.Content";
const apiBaseUrl = "https://api.github.com/graphql";

export async function fetchPullRequests(numberOfRules, author, token) {
  const pullRequests = await requestPullRequests(
    numberOfRules,
    author,
    token
  );
  pullRequests.sort((a, b) => new Date(b.mergedAt) - new Date(a.mergedAt));
  return pullRequests;
}

export async function fetchFileContents(filesToRetrieve, numberOfRules, token) {
  var fileContents = await requestMultipleFileContents(
    filesToRetrieve,
    numberOfRules,
    token
  );

  var counter = 0;

  while (
    fileContents.filter((x) => x !== null).length < numberOfRules
  ) {
    var extraFile = await requestSingleFileContents(
      filesToRetrieve[counter + numberOfRules].path,
      token
    );
    fileContents = [...fileContents, extraFile];
    counter++;
  }
  return fileContents;
}

export function setFilesToRetrieve(pullRequests) {
  var filesToRetrieve = [];
  for (let pr of pullRequests) {
    for (let file of pr.files.nodes) {
      if (
        !filesToRetrieve.includes(file.path) &&
        (file.path.substring(file.path.length - 3) === ".md" ||
          file.path.substring(file.path.length - 9) === ".markdown") &&
        file.path.substring(0, 6) === "rules/"
      ) {
        filesToRetrieve = [...filesToRetrieve, {
          path: file.path,
          author: pr.author.login,
            timestamp: new Date(pr.mergedAt),
          },
        ];
      }
    }
  }
  return filesToRetrieve;
}

export async function requestPullRequests(numberOfRules, author, token) {
  var response = await fetch(apiBaseUrl, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify({
      query: `{
			search(query: "repo:${githubOwner}/${githubRepo} is:pr base:main is:merged sort:updated-desc ${author ? "author:" + author : ""
        }", type: ISSUE, first: ${numberOfRules + 10}) {
			nodes {
				... on PullRequest {
				author {
					login
				}
				files(first: 10) {
					nodes {
					path
					}
				}
				mergedAt
				}
			}
			}
		}`,
    }),
  })
    .then((res) => res.json())
    .catch((error) => { return error });

  return response.data.search.nodes || null;
}

async function requestMultipleFileContents(list, numberOfRules, token) {
  var promises = [];
  for (var i = 0; i < numberOfRules; i++) {
    promises.push(
      fetch(apiBaseUrl, {
        method: "POST",
        headers: {
          Authorization: `bearer ${token}`,
        },
        body: JSON.stringify({
          query: `{
				repository(name: "${githubRepo}", owner: "${githubOwner}") {
				object(expression: "main:${list[i].path}") {
					... on Blob {
					text
					}
				}
				}
			}`,
        }),
      })
    );
  }

  var contents = [];
  await Promise.all(promises)
    .then((returnedPromises) => Promise.all(returnedPromises.map((res) => res.json())))
    .then((returnedObjects) =>
      returnedObjects.forEach((obj) => {
        if (obj.data.repository.object != null) {
          contents = [...contents, obj.data.repository.object.text];
        } else {
          contents = [...contents, null];
        }
      })
    )
    .catch((error) => { return error });

  return contents || null;
}

async function requestSingleFileContents(file, token) {
  var response = await fetch(apiBaseUrl, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify({
      query: `{
		rateLimit {
			remaining
		}
		repository(name: "${githubRepo}", owner: "${githubOwner}") {
			object(expression: "main:${file}") {
			... on Blob {
				text
			}
			}
		}
		}`,
    }),
  })
    .then((res) => res.json())
    .catch((error) => { return error });

  return response.data.repository.object.text || null;
}

export function extractFromRuleContent(term, text) {
  var start = text.substring(text.search(`${term}:`));
  var value = start.substring(term.length + 1, start.search("\\n"));
  return value.trim();
}
