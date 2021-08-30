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
			search(query: "repo:${githubOwner}/${githubRepo} is:pr base:main is:merged sort:updated-desc ${
        author ? "author:" + author : ""
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
    .catch((error) => {return error});

  return response.data.search.nodes || null;
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
				object(expression: "main:${list[i]}") {
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
    .then((values) => Promise.all(values.map((res) => res.json())))
    .then((values) =>
      values.forEach((obj) => {
        if (obj.data.repository.object != null) {
          contents = [...contents, obj.data.repository.object.text];
        } else {
          contents = [...contents, null];
        }
      })
    )
    .catch((error) => {return error});

  return contents || null;
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
    .catch((error) => {return error});

  return response.data.repository.object.text || null;
}
