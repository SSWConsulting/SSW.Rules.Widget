import { RulesWidget } from './lib';

function App() {
  return (
    <div className="App">
      {/* <Widget isDarkMode={true} numberOfRules={5} token={process.env.REACT_APP_GITHUB_PAT} location={window.location}></Widget> */}
      <RulesWidget />
    </div>
  );
}

export default App;
