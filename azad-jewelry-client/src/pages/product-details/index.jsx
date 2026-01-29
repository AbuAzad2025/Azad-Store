export const getServerSideProps = async (context) => {
  return {
    redirect: {
      destination: "/shop",
      permanent: false,
    },
  };
};

export default function ProductDetailsPage() {
  return null;
}
