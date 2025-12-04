import { useEffect, useState } from "react";
import axiosConfig from "../Services/axiosConfig";

export default function useHomepageData() {
  const [cms, setCms] = useState({
    banner: [],
    coupons: [],
    fullbanner: [],
    review: [],
    banners: []
  });

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axiosConfig("/cms/get_homepagedesign/?type=home%20page");
        let data = res?.data?.results || [];

        data = data.sort((a, b) => a.sort - b.sort);

        const mapped = {
          banner: (data.find((i) => i.title === "Banner Slider")?.slider) || [],
          coupons: (data.find((i) => i.title === "Coupons")?.coupons) || [],
          fullbanner: (data.find((i) => i.title === "Full Width Banner")?.full_width) || [],
          review: (data.find((i) => i.title === "Review Banners")?.review) || [],
          banners: (data.find((i) => i.title === "Multiple Banners")?.banners) || [],
        };

        setCms(mapped);
      } catch (error) {
        console.log(error);
      }
    };

    getData();
  }, []);

  return cms;
}
