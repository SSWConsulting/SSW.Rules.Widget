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
  const promises = [];

  for (let i = 0; i < numberOfRules; i++) {
    const res = await fetch(apiBaseUrl, {
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
    });

    if (!res.ok) {
      appInsights && appInsights.trackException({
        exception: new Error(`[ERROR] ${res.status} - ${res.statusText}`),
      });
    }

    promises.push(res.json());
  }

  try {
    const responses = await Promise.all(promises);
    const contents = responses.map((obj) => obj.data.repository.object.text);
    return contents;
  } catch (error) {
    if (appInsights) {
      appInsights.trackException({
        exception: new Error(`[ERROR] ${error.message}`),
      });
    }
    throw error;
  }
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
