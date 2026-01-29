import { useRouter } from "next/router";
import { useState } from "react";

const useSearchFormSubmit = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("");

  const submitSearch = (nextSearchText, nextCategory = category) => {
    const text = String(nextSearchText || "").trim();
    if (text) {
      const encodedSearchText = encodeURIComponent(text);
      let route = `/search?searchText=${encodedSearchText}`;

      if (nextCategory && nextCategory !== "Select Category") {
        route += `&productType=${encodeURIComponent(nextCategory)}`;
        setCategory("");
      }

      router.push(route, null, { scroll: false });
      setSearchText("");
      return;
    }

    router.push(`/`, null, { scroll: false });
    setSearchText("");
    setCategory("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitSearch(searchText, category);
  };

  return {
    searchText,
    category,
    setSearchText,
    setCategory,
    handleSubmit,
    submitSearch,
  };
};

export default useSearchFormSubmit;
