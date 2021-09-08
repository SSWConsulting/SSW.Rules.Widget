import { requestPullRequests, requestMultipleFileContents, requestSingleFileContents } from './api';

export async function getRules(state) {
	var rules = [];
	const pullRequests = await fetchAndSortPullRequestsByMergedDate(state.numberOfRules, state.author, state.token);
  
    var filesToRetrieveContentsOf = await setFilesToRetrieve(pullRequests);
  
    var retrievedFileContents = await fetchFileContents(filesToRetrieveContentsOf, state.numberOfRules, state.token);

    for (let [i, file] of retrievedFileContents.entries()) {
      if (file != null) {
        var title = extractFromRuleContent("title", file);
        var uri = extractFromRuleContent("uri", file);

		rules = [...rules, {
			id: rules.length + 1,
			uri: uri,
			path: file.path,
			title: title,
			author: filesToRetrieveContentsOf[i].author,
			timestamp: filesToRetrieveContentsOf[i].timestamp
		}];
	  }
	}
	return rules;
}

async function fetchAndSortPullRequestsByMergedDate(
  numberOfRules,
  author,
  token
) {
  const pullRequests = await requestPullRequests(numberOfRules, author, token);
  pullRequests.sort((a, b) => new Date(b.mergedAt) - new Date(a.mergedAt));
  return pullRequests;
}

async function fetchFileContents(filesToRetrieve, numberOfRules, token) {
  var fileContents = await requestMultipleFileContents(
    filesToRetrieve,
    numberOfRules,
    token
  );

  var fileContentsNoArchived = await filterOutArchivedRules(fileContents);

  var counter = 0;

  var numberOfRulesSuccessfullyRetrieved = fileContentsNoArchived.filter((x) => x != null).length;
  while (numberOfRulesSuccessfullyRetrieved < numberOfRules) {
    var extraFile = await requestSingleFileContents(
      filesToRetrieve[counter + numberOfRules].path,
      token
    );
	if (extraFile) {
		fileContentsNoArchived = [...fileContents, extraFile];
		numberOfRulesSuccessfullyRetrieved++;
	}
    counter++;
  }
  return fileContents;
}

function setFilesToRetrieve(pullRequests) {
  var filesToRetrieve = [];
  for (let pr of pullRequests) {
    for (let file of pr.files.nodes) {
      if (
        !filesToRetrieve.some((item) => item.path === file.path) &&
        (file.path.substring(file.path.length - 3) === ".md" ||
          file.path.substring(file.path.length - 9) === ".markdown") &&
        file.path.substring(0, 6) === "rules/"
      ) {
        filesToRetrieve = [
          ...filesToRetrieve,
          {
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

function filterOutArchivedRules(fileContents) {
	for (let file of fileContents) {
		var archivedReason = extractFromRuleContent("archivedreason", file);
		if (archivedReason && archivedReason !== "null") {
			console.log("Archived: " + archivedReason);
			file = null;
		}
	}
	console.log(fileContents);
	return fileContents;
}

function extractFromRuleContent(term, text) {
  var startingIndexOfTerm = text.search(`${term}:`);
  if (startingIndexOfTerm === -1) {
	  return undefined;
  }
  var trimBeforeSearchTerm = text.substring(startingIndexOfTerm);
  var value = trimBeforeSearchTerm.substring(term.length + 1, trimBeforeSearchTerm.search("\\n"));
  return value.trim();
}
