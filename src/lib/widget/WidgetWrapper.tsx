import { QueryClient, QueryClientProvider } from "react-query";
import Widget, { WidgetProps } from "./widget";

const WidgetWrapper = (props: WidgetProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <Widget {...props} />
    </QueryClientProvider>
  );
};

export default WidgetWrapper;
