import { RulesWidget } from './lib';

function App() {
  return (
    <div className="App">
      <RulesWidget 
        githubToken={process.env.REACT_APP_GITHUB_API_PAT} 
      />
    </div>
  );
}

export default App;
