const githubOwner = "SSWConsulting";
const githubRepo = "SSW.Rules.Content";
const apiBaseUrl = "https://api.github.com/graphql";

export async function requestPullRequests(numberOfRules, author, token, appInsights) {
  const res = await fetch(apiBaseUrl, {
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
  });

  if (!res.ok) {
    appInsights && appInsights.trackException({
      exception: new Error(`[ERROR] ${res.status} - ${res.statusText}`),
    });
  }

  const { data } = await res.json();

  return data.search.nodes;
}

export async function requestMultipleFileContents(list, numberOfRules, token, appInsights) {
  let promises = [];
  for (let i = 0; i < numberOfRules; i++) {
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

  let contents = [];
  await Promise.all(promises)
    .then((returnedPromises) => Promise.all(returnedPromises.map((res) => res.json())))
    .then((returnedObjects) => {
      for (let obj of returnedObjects) {
        contents = [...contents, obj.data.repository.object.text];
      }
    })
    .catch((error) => { 
        appInsights && appInsights.trackException({
          exception: new Error(`[ERROR] ${error.status} - ${error.statusText}`),
        });
        return error 
    });

  return contents;
}

export async function requestSingleFileContents(file, token, appInsights) {
  const res = await fetch(apiBaseUrl, {
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
  });

  if (!res.ok) {
    appInsights && appInsights.trackException({
      exception: new Error(`[ERROR] ${res.status} - ${res.statusText}`),
    });
  }

  const { data } = await res.json();

  if (!data.repository.object) {
    return null;
  }

  return data.repository.object.text;
}
