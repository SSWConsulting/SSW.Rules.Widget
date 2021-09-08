import Widget from './lib/components/Widget'

function App() {
  return (
    <div className="App">
      <Widget isDarkMode={true} numberOfRules={5} token={process.env.REACT_APP_GITHUB_PAT}></Widget>
    </div>
    
  );
}

export default App;
