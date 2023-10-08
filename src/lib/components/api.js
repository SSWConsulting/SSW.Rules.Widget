import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const githubOwner = "SSWConsulting";
const githubRepo = "SSW.Rules.Content";
const apiBaseUrl = "https://api.github.com/graphql";
const appInsights = new ApplicationInsights({
    config: {
      instrumentationKey: process.env.SSWRULESWIDGET_APPINSIGHTS_INSTRUMENTATIONKEY,
    },
});

appInsights.loadAppInsights();

export async function requestPullRequests(numberOfRules, author, token) {
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

export async function requestMultipleFileContents(list, numberOfRules, token) {
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
  let returnedPromises = await Promise.all(promises);

  for (let res of returnedPromises) {
    if (!res.ok) {
      appInsights && appInsights.trackException({
        exception: new Error(`[ERROR] ${res.status} - ${res.statusText}`),
      });
    }
  }

  let returnedObjects = await Promise.all(returnedPromises.map((res) => res.json()));

  for (let obj of returnedObjects) {
    contents = [...contents, obj.data.repository.object.text];
  }

  return contents;
}

export async function requestSingleFileContents(file, token) {
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

  const responseObject = data.repository.object;

  if (!responseObject) {
    return null;
  }

  return response.data.repository.object.text;
}
