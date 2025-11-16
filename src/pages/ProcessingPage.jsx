import Loader from '../components/Loader';

const ProcessingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-96">
      <Loader text="Luna is analyzing your notes..." />
      <p className="mt-4 text-light-heading/80 dark:text-dark-glow/80">
        This might take a moment. Great insights are on their way!
      </p>
    </div>
  );
};

export default ProcessingPage;
