export const getServerSideProps = async () => {
  return {
    redirect: {
      destination: "/shop",
      permanent: false,
    },
  };
};

export default function ProductDetailsVideoPage() {
  return null;
}

