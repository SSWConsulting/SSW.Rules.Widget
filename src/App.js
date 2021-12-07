import { RulesWidget } from './lib';

function App() {
  return (
    <div className="App">
      {/* <Widget isDarkMode={true} numberOfRules={5} token={process.env.REACT_APP_GITHUB_PAT} location={window.location}></Widget> */}
      <RulesWidget
        rulesUrl='https://staging.ssw.com.au/rules'
        ruleCount="6" 
      />
    </div>
    
  );
}

export default App;
