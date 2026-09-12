/**
 * Utility to resolve campaign cover photos with high-quality themed fallbacks
 */
export const getCampaignImage = (campaign) => {
  if (campaign?.image_url) return campaign.image_url;
  const id = Number(campaign?.id);
  const cat = (campaign?.category || '').toLowerCase();
  const title = (campaign?.title || '').toLowerCase();

  if (id === 1 || cat.includes('edu') || title.includes('child') || title.includes('educat') || title.includes('school')) {
    return '/assets/campaigns/education.jpg';
  }
  if (id === 2 || cat.includes('water') || title.includes('water') || title.includes('well') || title.includes('sanitat')) {
    return '/assets/campaigns/water.jpg';
  }
  if (id === 3 || cat.includes('disaster') || title.includes('flood') || title.includes('relief') || title.includes('ration')) {
    return '/assets/campaigns/flood_relief.jpg';
  }
  if (id === 4 || title.includes('senior') || title.includes('elderly') || title.includes('warmth')) {
    return '/assets/campaigns/elderly.jpg';
  }
  if (id === 5 || cat.includes('nutri') || title.includes('meal') || title.includes('hunger') || title.includes('malnutri')) {
    return '/assets/campaigns/nutrition.jpg';
  }
  if (id === 6 || cat.includes('health') || title.includes('medic') || title.includes('camp') || title.includes('van')) {
    return '/assets/campaigns/medical.jpg';
  }
  if (id === 7 || title.includes('winter') || title.includes('blanket') || title.includes('clothe')) {
    return '/assets/campaigns/winter.jpg';
  }

  return '/assets/campaigns/education.jpg';
};
