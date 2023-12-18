import { RulesWidget } from "./lib";

function App() {
  return (
    <div className="App">
      <RulesWidget skip={10} numberOfRules={5} showLogo={true} />
    </div>
  );
}

export default App;
