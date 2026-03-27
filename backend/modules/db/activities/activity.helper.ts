export const getImageUrl = (images: any[]) => {
    if (!images || !images.length) return 'https://via.placeholder.com/300';
    const img = images.find(i => i.size === 'extralarge') || images[images.length - 1];
    return img['#text'];
};