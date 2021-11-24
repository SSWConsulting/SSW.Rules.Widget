import Widget from './lib/components/Widget'

function App() {
  console.log(window.location)
  return (
    <div className="App">
      <Widget isDarkMode={true} numberOfRules={5} token={process.env.REACT_APP_GITHUB_PAT} location={window.location}></Widget>
    </div>
    
  );
}

export default App;
