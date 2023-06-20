import React, { useState, useEffect } from 'react'
import { formatDistanceStrict } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import Logo from "./assets/SSWLogo.png";
import "./styles/style.css";

export default function RulesWidget({
    rulesUrl = 'https://ssw.com.au/rules',
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
    
    //Fetch the rules from the rulesUrl
    useEffect(() =>{
        async function fetchData(){
            try {
                const response = await fetch(`${rulesUrl}/history-feed.json`)
                const json = await response.json()
                setData(await filterData(json))
                setLoading(false)
            } catch (error) {
                setError(error)
            }
        }       
        async function filterData(json){
            var filteredData = json;

            if(ruleEditor) {
                const userName = await fetchGithubName(ruleEditor)
                return filteredData.filter(x => formatName(x.lastUpdatedBy) === userName)
            }
        
            return filteredData.length > ruleCount ? filteredData.splice(0, ruleCount) : filteredData;
        }

        async function fetchGithubName(ruleEditor) {
            try {
                const response = await fetch(`https://api.github.com/users/${ruleEditor}`, {
                    method: "GET",
                    headers: {
                        Authorization: token ? `bearer ${token}` : "",
                    }
                })

                const { name } = await response.json();
                return formatName(name)
            } catch (error) {
                throw error;
            }
        }

        fetchData();
    }, [rulesUrl, ruleCount, ruleEditor, token])

    function formatName(name) {
        if (!name) return
        return name.replace("[SSW]", "").replace(/\s/g, "").toLowerCase()
    }

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
        else if(data)
            return(
                data.map((item, idx) => {
                    if (item.title !== "No title") {
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
                                    {getLastUpdatedTime(item.lastUpdated)}
                                </p>
                            </div>                            
                        </a>)
                    }
                    return null
                })
            )
            
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