const githubOwner = "SSWConsulting";
const githubRepo = "SSW.Rules.Content";
const apiBaseUrl = "https://api.github.com/graphql";

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

  return response.data.search.nodes;
}

export async function requestMultipleFileContents(list, numberOfRules, token) {
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
    .then((returnedObjects) => {
      for (let obj of returnedObjects) {
        contents = [...contents, obj.data.repository.object.text];
      }
    })
    .catch((error) => { return error });
  return contents;
}

export async function requestSingleFileContents(file, token) {
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

  return response.data.repository.object.text;
}