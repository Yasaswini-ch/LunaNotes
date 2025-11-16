const Loader = ({ text = "Processing..." }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-light-accent dark:border-dark-button border-t-transparent rounded-full animate-spin"></div>
      <p className="text-lg font-semibold">{text}</p>
    </div>
  );
};

export default Loader;
