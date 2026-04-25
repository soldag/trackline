import View from "@/components/views/View";

interface LoadingViewProps {
  appBar?: boolean;
}

const LoadingView = ({ appBar }: LoadingViewProps) => (
  <View loading appBar={appBar ? { showTitle: true } : undefined} />
);

export default LoadingView;
