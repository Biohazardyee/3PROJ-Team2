import PlaceholderImg from "@/assets/images/melodia_placeholder.png";

export const getValidSource = (cover: any) => {

  if (typeof cover === "object" && cover !== null) {
    return cover;
  }
 
  if (typeof cover === "string" && cover.trim() !== "") {
    return { uri: cover };
  }
 
  return PlaceholderImg;
};
