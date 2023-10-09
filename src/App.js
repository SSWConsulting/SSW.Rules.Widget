import { RulesWidget } from './lib';

function App() {
  return (
    <div className="App">
      <RulesWidget 
        token={process.env.REACT_APP_GITHUB_API_PAT} 
        insightsToken={process.env.REACT_APP_APPINSIGHTS_INSTRUMENTATIONKEY} 
      />
    </div>
  );
}

export default App;
