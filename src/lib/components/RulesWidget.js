import React, { useState, useEffect } from 'react'
import { formatDistanceStrict } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import Logo from "./assets/SSWLogo.png";
import "./styles/style.css";

export default function RulesWidget({
    rulesUrl = 'https://www.ssw.com.au/rules',
    showLogo,
    location = window.location.href,
    ruleCount = 10,
    ruleEditor,
    token,
    isDarkMode = false
}){
    const sswUrl = "https://www.ssw.com.au";

    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    
    useEffect(() =>{
        async function fetchData(){
            try {
                const response = await fetch(`${rulesUrl}/commits.json`)
                const json = await response.json()
                setData(await filterData(json))
                setLoading(false)
            } catch (error) {
                setError(error)
            }
        }       
        async function filterData(json){
            let filteredData = json;

            if (ruleEditor) {
                filteredData = filteredData.filter(x => x.user === ruleEditor)
            }

            const widgetData = flattenData(filteredData[0].commits)
            // TODO: Get top 10 latest rules when there is no specific ruleEditor
            return widgetData
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
    }, [rulesUrl, ruleCount, ruleEditor, token])

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
                                {getLastUpdatedTime(item.updatedTime)}
                            </p>
                        </div>                            
                    </a>)
                })
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