import { QueryClient, QueryClientProvider } from "react-query";
import { RulesWidget } from "./lib";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <RulesWidget />
      </div>
    </QueryClientProvider>
  );
}

export default App;
