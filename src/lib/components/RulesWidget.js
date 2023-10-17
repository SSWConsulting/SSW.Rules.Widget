import React, { useState, useEffect } from 'react'
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { formatDistanceStrict } from "date-fns";
import { getRules } from "./business";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Logo from "./assets/SSWLogo.png";
import "./styles/style.css";

export default function RulesWidget({
    rulesUrl = 'https://www.ssw.com.au/rules',
    userRulesUrl = 'https://ssw.com.au/rules/user-rules/?author=',
    showLogo,
    location = window.location.href,
    ruleCount = 10,
    ruleEditor,
    githubToken,
    appInsightsToken,
    isDarkMode = false
}){
    const appInsights = new ApplicationInsights({
        config: {
          instrumentationKey: appInsightsToken,
        },
    });

    appInsights.loadAppInsights();

    const sswUrl = "https://www.ssw.com.au";

    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() =>{
        async function fetchData(){
            try {
                let widgetData = []
                if (ruleEditor) {
                    const response = await fetch(`${rulesUrl}/commits.json`)
                    const json = await response.json()
                    widgetData = await filterData(json)
                } else {
                    const stateObj = {
                        githubToken,
                        appInsights,
                        numberOfRules: ruleCount
                    }
                    const arrayOfRules = await getRules(stateObj)
                    widgetData = arrayOfRules.map(item => ({
                        uri: item.uri,
                        title: item.title,
                        updatedTime: item.timestamp
                    }))
                }
                setData(widgetData)
                setLoading(false)
            } catch (error) {
                setError(error)
            }
        }       
        async function filterData(json){
            const editorData = json.find(x => x.user === ruleEditor) || { commits: []};
            let filteredData = flattenData(editorData.commits)
            return filteredData.length > ruleCount ? filteredData.splice(0, ruleCount) : filteredData;
        }

        function flattenData(oldCommitData) {
            const newCommitData = [];
            const seenTitles = new Set();
        
            oldCommitData.forEach(commit => {
                commit.FilesChanged.forEach(file => {
                    if (!seenTitles.has(file.title)) {
                        newCommitData.push({
                            updatedTime: commit.CommitTime,
                            ...file
                        });
                        seenTitles.add(file.title);
                    }
                });
            });

            return newCommitData
        }

        fetchData();
    }, [rulesUrl, ruleCount, ruleEditor, githubToken])

    function getLastUpdatedTime(lastUpdatedDate){
        return formatDistanceStrict(
            Date.parse(lastUpdatedDate), 
            new Date())
            .replace("minute", "min")
            .replace("second", "sec")
    }

    function getContent(){
        if(isLoading)
            return (
                <p>Loading...</p>
            )
        else if(error)
            return(
                <p>There was an error: {error.message}</p>
            )
        else if(data) {
            return(
                <>
                {
                    data.map((item, idx) => {
                        return (<a
                            key={idx}
                            rel="noreferrer"
                            target="_blank"
                            href={`${rulesUrl}/${item.uri}`}
                        >
                            <div className="rw-rule-card" key={idx}>
                                <p className="rw-rule-title">{item.title}</p>
                                <p className="rw-rule-details">
                                    <FontAwesomeIcon
                                        icon={faClock}
                                        className="clock"
                                    ></FontAwesomeIcon>{" "}
                                    {getLastUpdatedTime(item.updatedTime)} ago
                                </p>
                            </div>                            
                        </a>)
                    })
                }
                {
                    ruleEditor && !!data.length && (
                    <div className="see-more-container">
                        <a rel="noreferrer" target="_blank" className="rw-see-more" href={`${userRulesUrl}${ruleEditor}`}>See More</a>
                    </div>
                    )
                }
                </>
            )}
            
    }

    return(
        <div className="rw-container">
            <div className="rw-title">
                {showLogo ? 
                    <a href={sswUrl}>
                        <img src={Logo} alt="SSW Logo" height="60" width="130"></img>
                    </a>
                    : 
                    ('')}
                <h4>
                    {location === rulesUrl ? 
                        'Latest Rules' 
                        :
                        <a rel="noreferrer" target="_blank" href={`${rulesUrl}`}>
                            Latest Rules
                        </a>}
                </h4>
            </div>
            <div className={`rw-rules-container ${isDarkMode ? "rw-dark" : ""}`}>
                {getContent()} 
            </div>
        </div>
    )
}
