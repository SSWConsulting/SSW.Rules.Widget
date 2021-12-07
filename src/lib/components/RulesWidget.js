import React from 'react'
import { formatDistanceStrict } from "date-fns";
import "./styles/style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Logo from "./assets/SSWLogo.png";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { 
    useState, 
    useEffect 
} from 'react'

export default function RulesWidget({
    rulesUrl = 'https://ssw.com.au/rules',
    showLogo = false,
    location = window.location.href,
    ruleCount = 10,
    ruleEditor = null
}){

    const sswUrl = "https://www.ssw.com.au";

    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    
    //Fetch the rules from the rulesUrl
    useEffect(() =>{
        
        async function fetchData(){
            if(isLoading){
                await fetch(`${rulesUrl}/history-feed.json`)
                .then(async function(response) {
                    const json = await response.json();  
                    
                    setData(filterData(json));
                })
                .then(setLoading(false))
                .catch(error => {
                    setError(error);
                })
            }
        }       
        function filterData(json){
            var filteredData = json;

            //TODO: Fix finding the rule editor
            //Filters the data by the editor
            if(ruleEditor)
                filteredData = filteredData.find(x => x.lastedUpdatedBy === ruleEditor)
                
            //Filter rule count
            if(json.length > ruleCount)
                filteredData = filteredData.slice(0, ruleCount);

            return filteredData;
        }

        fetchData();
    }, [data, isLoading, error, rulesUrl, ruleCount, ruleEditor])

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
                data.map((item, idx) => (
                    <a
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
                    </a>
                ))
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
            <div className="rw-rules-container">
                {getContent()} 
            </div>
        </div>
    )
}